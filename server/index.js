import express from 'express';
import cors from 'cors';
import axios from 'axios';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const allowedOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL)
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const REDIRECT_URI = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/auth/callback`
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
  if (error) return res.redirect(`${FRONTEND_URL}?auth=error`);

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
    const token = response.data.access_token;
    res.redirect(`${FRONTEND_URL}?token=${token}`);
  } catch (err) {
    console.error('Auth error:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?auth=error`);
  }
});

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function spotifyGet(endpoint, token) {
  const res = await axios.get(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

async function getAllSavedAlbums(token) {
  let albums = [];
  let url = '/me/albums?limit=50';
  while (url) {
    const data = await spotifyGet(url, token);
    albums = albums.concat(data.items);
    url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : null;
  }
  return albums;
}

app.get('/api/profile', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const [profile, topArtists] = await Promise.all([
      spotifyGet('/me', token),
      spotifyGet('/me/top/artists?limit=5&time_range=medium_term', token),
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
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query is required' });

  try {
    const [topArtists, topTracks, savedAlbums, recentlyPlayed] = await Promise.all([
      spotifyGet('/me/top/artists?limit=20&time_range=medium_term', token),
      spotifyGet('/me/top/tracks?limit=20&time_range=medium_term', token),
      getAllSavedAlbums(token),
      spotifyGet('/me/player/recently-played?limit=20', token),
    ]);

    const artistNames = topArtists.items.map((a) => a.name).join(', ');
    const genres = [...new Set(topArtists.items.flatMap((a) => a.genres))].slice(0, 15).join(', ');
    const trackNames = topTracks.items.map((t) => `${t.name} by ${t.artists[0].name}`).join(', ');
    const recentTrackNames = recentlyPlayed.items
      .map((i) => `${i.track.name} by ${i.track.artists[0].name}`)
      .join(', ');

    // Build full exclusion set — saved albums + albums from top tracks
    const savedAlbumList = savedAlbums.map((i) => `${i.album.name} by ${i.album.artists[0].name}`);
    const topTrackAlbums = topTracks.items.map((t) => `${t.album.name} by ${t.artists[0].name}`);
    const allKnownAlbums = [...new Set([...savedAlbumList, ...topTrackAlbums])];

    // Normalise for post-filter comparison
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const knownSet = new Set(allKnownAlbums.map(normalize));

    const prompt = `You are an expert music curator with deep knowledge of albums across all genres and eras. Recommend 5 albums based on this user's Spotify listening profile and their specific request.

USER'S TASTE PROFILE:
- Top Artists: ${artistNames || 'Not available'}
- Favourite Genres: ${genres || 'Not available'}
- Top Tracks: ${trackNames || 'Not available'}
- Recently Played: ${recentTrackNames || 'Not available'}

ALBUMS ALREADY IN THEIR LIBRARY — DO NOT RECOMMEND ANY OF THESE:
${allKnownAlbums.length > 0 ? allKnownAlbums.join('\n') : 'None'}

USER'S REQUEST: "${query}"

Recommend exactly 15 real albums the user has NOT heard before. Triple-check that none of your recommendations appear in the library list above before responding.

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

    const rawRecommendations = JSON.parse(jsonMatch[0]);

    // Post-filter: remove any album the AI recommended that's already in the library
    const recommendations = rawRecommendations.filter((rec) => {
      const key = normalize(`${rec.album}${rec.artist}`);
      return !knownSet.has(key);
    });

    const verified = (
      await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const searchResult = await spotifyGet(
              `/search?q=${encodeURIComponent(`album:${rec.album} artist:${rec.artist}`)}&type=album&limit=1`,
              token
            );
            const album = searchResult.albums?.items[0];
            if (!album) return null;
            return {
              ...rec,
              albumArt: album.images[0]?.url || null,
              spotifyUrl: album.external_urls?.spotify || null,
            };
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean).slice(0, 5);

    res.json({ recommendations: verified });
  } catch (err) {
    console.error('Recommend error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
