import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 3001;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const allowedOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL)
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL}/auth/callback`
  : 'http://127.0.0.1:3001/auth/callback';
const SCOPES = [
  'user-top-read',
  'user-library-read',
  'user-read-recently-played',
  'user-read-private',
  'user-read-email'
].join(' ');

app.get('/auth/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.redirect('http://localhost:5173?auth=error');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        },
      }
    );
    req.session.accessToken = response.data.access_token;
    req.session.refreshToken = response.data.refresh_token;
    res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}?auth=success`);
  } catch (err) {
    console.error('Auth error:', err.response?.data || err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}?auth=error`);
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/auth/status', (req, res) => {
  res.json({ authenticated: !!req.session.accessToken });
});

async function spotifyGet(endpoint, token) {
  const res = await axios.get(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

app.get('/api/profile', async (req, res) => {
  if (!req.session.accessToken) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const [profile, topArtists] = await Promise.all([
      spotifyGet('/me', req.session.accessToken),
      spotifyGet('/me/top/artists?limit=5&time_range=medium_term', req.session.accessToken),
    ]);
    res.json({
      name: profile.display_name,
      image: profile.images?.[0]?.url || null,
      topArtists: topArtists.items.map((a) => a.name),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recommend', async (req, res) => {
  if (!req.session.accessToken) return res.status(401).json({ error: 'Not authenticated' });
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query is required' });

  try {
    const [topArtists, topTracks, savedAlbums, recentlyPlayed] = await Promise.all([
      spotifyGet('/me/top/artists?limit=20&time_range=medium_term', req.session.accessToken),
      spotifyGet('/me/top/tracks?limit=20&time_range=medium_term', req.session.accessToken),
      spotifyGet('/me/albums?limit=50', req.session.accessToken),
      spotifyGet('/me/player/recently-played?limit=20', req.session.accessToken),
    ]);

    const artistNames = topArtists.items.map((a) => a.name).join(', ');
    const genres = [...new Set(topArtists.items.flatMap((a) => a.genres))].slice(0, 15).join(', ');
    const trackNames = topTracks.items.map((t) => `${t.name} by ${t.artists[0].name}`).join(', ');
    const savedAlbumList = savedAlbums.items.map((i) => `${i.album.name} by ${i.album.artists[0].name}`);
    const recentTrackNames = recentlyPlayed.items
      .map((i) => `${i.track.name} by ${i.track.artists[0].name}`)
      .join(', ');

    const prompt = `You are an expert music curator with deep knowledge of albums across all genres and eras. Recommend 5 albums based on this user's Spotify listening profile and their specific request.

USER'S TASTE PROFILE:
- Top Artists: ${artistNames || 'Not available'}
- Favourite Genres: ${genres || 'Not available'}
- Top Tracks: ${trackNames || 'Not available'}
- Recently Played: ${recentTrackNames || 'Not available'}

ALBUMS ALREADY IN THEIR LIBRARY (do NOT recommend these):
${savedAlbumList.length > 0 ? savedAlbumList.join('\n') : 'None'}

USER'S REQUEST: "${query}"

Recommend exactly 5 real albums that match the request and complement their taste. Do not recommend anything from their library.

Respond with ONLY a valid JSON array — no markdown, no code blocks, no explanation:
[
  {
    "album": "Album Name",
    "artist": "Artist Name",
    "year": "2019",
    "genre": "Genre",
    "reason": "One sentence explaining why this fits their taste and request",
    "mood": "One word mood label"
  }
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    let text = completion.choices[0].message.content.trim();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse recommendations from AI response');

    const recommendations = JSON.parse(jsonMatch[0]);

    const recommendationsWithArt = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const searchResult = await spotifyGet(
            `/search?q=${encodeURIComponent(`album:${rec.album} artist:${rec.artist}`)}&type=album&limit=1`,
            req.session.accessToken
          );
          const album = searchResult.albums?.items[0];
          return {
            ...rec,
            albumArt: album?.images[0]?.url || null,
            spotifyUrl: album?.external_urls?.spotify || null,
          };
        } catch {
          return { ...rec, albumArt: null, spotifyUrl: null };
        }
      })
    );

    res.json({ recommendations: recommendationsWithArt });
  } catch (err) {
    console.error('Recommend error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
