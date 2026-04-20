import { useState, useEffect } from 'react'
import AlbumCard from './AlbumCard'
import { authFetch } from '../api'

const SUGGESTIONS = [
  'smooth jazz for a rainy evening',
  'energetic hip hop to work out to',
  'late night lo-fi chill',
  'melancholic indie folk',
  'classic rock anthems',
  'upbeat summer pop',
]

export default function Dashboard({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [query, setQuery] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastQuery, setLastQuery] = useState('')

  useEffect(() => {
    authFetch('/api/profile')
      .then((r) => {
        if (r.status === 401) { onLogout(); return null }
        return r.json()
      })
      .then((data) => { if (data) setProfile(data) })
      .catch(console.error)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q || loading) return

    setLoading(true)
    setError(null)
    setRecommendations([])
    setLastQuery(q)

    try {
      const res = await authFetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({ query: q }),
      })
      if (res.status === 401) { onLogout(); return }
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRecommendations(data.recommendations)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800/60 px-6 py-4 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow shadow-green-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-4 h-4">
                <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
              </svg>
            </div>
            <span className="font-bold text-white">Album Finder</span>
          </div>

          {profile && (
            <div className="flex items-center gap-3">
              {profile.image && (
                <img src={profile.image} alt={profile.name} className="w-8 h-8 rounded-full ring-2 ring-zinc-700" />
              )}
              <span className="text-zinc-400 text-sm hidden sm:block">{profile.name}</span>
              <button
                onClick={onLogout}
                className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">What are you in the mood for?</h2>
          <p className="text-zinc-500 mb-8">
            Describe a vibe, genre, or moment — we'll find albums you haven't heard yet.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "smooth jazz for a rainy evening"'
              className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-green-500 rounded-full px-6 py-3.5 text-white placeholder-zinc-600 outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold px-7 py-3.5 rounded-full transition-colors text-sm whitespace-nowrap"
            >
              {loading ? 'Finding...' : 'Find Albums'}
            </button>
          </form>

          {recommendations.length === 0 && !loading && (
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs px-4 py-2 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Analysing your taste and finding new albums...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-900/60 rounded-2xl p-4 text-red-400 text-sm text-center mb-8">
            Something went wrong: {error}
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-zinc-300 text-sm">
                5 recommendations for{' '}
                <span className="text-white font-medium">"{lastQuery}"</span>
              </h3>
              <button
                onClick={() => { setRecommendations([]); setLastQuery('') }}
                className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <AlbumCard key={i} album={rec} index={i} />
              ))}
            </div>
          </div>
        )}

        {profile?.topArtists?.length > 0 && recommendations.length === 0 && !loading && (
          <div className="mt-16 text-center">
            <p className="text-zinc-600 text-xs mb-3">Based on your Spotify history</p>
            <div className="flex flex-wrap justify-center gap-2">
              {profile.topArtists.map((a) => (
                <span key={a} className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs px-3 py-1.5 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
