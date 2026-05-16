import { useState, useEffect } from 'react'
import AlbumCard from './AlbumCard'
import { authFetch } from '../api'

const DOT_COLORS = [
  'bg-sky-400',
  'bg-orange-400',
  'bg-violet-400',
  'bg-amber-300',
  'bg-emerald-400',
  'bg-pink-400',
]

const FALLBACK_SUGGESTIONS = [
  'smooth jazz for a rainy evening',
  'late night lo-fi chill',
  'energetic hip-hop to work out to',
  'upbeat summer pop',
  'cinematic instrumental focus',
  'mellow soul for a slow morning',
]

const SUGGESTIONS_CACHE_KEY = 'album_finder_suggestions_v1'

const SpotifyMark = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
  </svg>
)

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-5 flex gap-5">
      <div className="skeleton w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-3 py-2">
        <div className="skeleton h-5 w-2/3 rounded-md" />
        <div className="skeleton h-3.5 w-1/3 rounded-md" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton h-3 w-11/12 rounded-md mt-2" />
        <div className="skeleton h-3 w-3/4 rounded-md" />
      </div>
    </div>
  )
}

export default function Dashboard({ profile, onLogout }) {
  const [query, setQuery] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastQuery, setLastQuery] = useState('')
  const [suggestions, setSuggestions] = useState(() => {
    try {
      const cached = sessionStorage.getItem(SUGGESTIONS_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })

  useEffect(() => {
    if (suggestions) return
    let cancelled = false
    authFetch('/api/suggestions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data?.suggestions) && data.suggestions.length > 0
          ? data.suggestions
          : FALLBACK_SUGGESTIONS
        setSuggestions(list)
        try { sessionStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(list)) } catch {}
      })
      .catch(() => { if (!cancelled) setSuggestions(FALLBACK_SUGGESTIONS) })
    return () => { cancelled = true }
  }, [suggestions])

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

  const handleClear = () => {
    setRecommendations([])
    setLastQuery('')
    setError(null)
    setQuery('')
  }

  const hasResults = !loading && recommendations.length > 0
  const isIdle = !loading && recommendations.length === 0 && !error

  return (
    <div className="relative min-h-dvh bg-zinc-950 text-white overflow-x-hidden">
      <div className="aurora-bg opacity-60" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-glow-green-sm">
              <SpotifyMark className="w-4 h-4 text-black" />
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm">Album Finder</p>
              <p className="text-zinc-600 text-[10px] tracking-wider uppercase">AI curator</p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/60">
                {profile.image && (
                  <img src={profile.image} alt="" className="w-6 h-6 rounded-full ring-1 ring-zinc-700" />
                )}
                <span className="text-zinc-300 text-xs font-medium">{profile.name}</span>
              </div>
              {profile.image && (
                <img src={profile.image} alt={profile.name} className="sm:hidden w-8 h-8 rounded-full ring-1 ring-zinc-700" />
              )}
              <button
                onClick={onLogout}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-medium transition-colors px-2 py-1.5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-12 sm:pt-20 pb-24">
        {isIdle && (
          <section className="text-center animate-fade-up">
            <p className="text-xs uppercase tracking-[0.2em] text-green-400/80 mb-4">
              What's the vibe?
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance leading-[1.05] mb-4">
              Tell me a feeling.
              <span className="block text-zinc-500 font-medium mt-1">I'll find the album.</span>
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base mb-10 max-w-md mx-auto text-balance">
              Describe a mood, a moment, or a memory. Five fresh albums, verified on Spotify.
            </p>
          </section>
        )}

        {!isIdle && (
          <div className="text-center mb-8 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.2em] text-green-400/80">
              {loading ? 'Curating' : 'Curated for you'}
            </p>
          </div>
        )}

        <form onSubmit={handleSearch} className="relative mx-auto max-w-xl mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <label htmlFor="vibe-search" className="sr-only">Describe a vibe or mood</label>
          <div className="group relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-focus-within:from-green-500/20 group-focus-within:via-emerald-400/10 group-focus-within:to-indigo-500/20 blur-xl transition-all duration-500" aria-hidden="true" />
            <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 focus-within:border-green-500 rounded-full pl-5 pr-1.5 py-1.5 transition-colors duration-200 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zinc-500 flex-shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <input
                id="vibe-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='"smooth jazz for a rainy evening"'
                autoComplete="off"
                className="flex-1 bg-transparent px-3 py-2.5 text-white placeholder-zinc-600 outline-none text-sm sm:text-base min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-all duration-200 text-sm whitespace-nowrap active:scale-[0.97] flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Finding</span>
                  </>
                ) : (
                  <>
                    <span>Find</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {isIdle && (
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-wrap justify-center gap-2 mb-12 min-h-[5rem]">
              {suggestions === null
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="skeleton h-8 rounded-full"
                      style={{ width: `${110 + ((i * 37) % 90)}px` }}
                    />
                  ))
                : suggestions.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setQuery(label)}
                      className="group flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 text-xs px-3.5 py-2 rounded-full transition-all duration-200 backdrop-blur-sm animate-fade-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]} opacity-70 group-hover:opacity-100`} />
                      {label}
                    </button>
                  ))}
            </div>

            {profile?.topArtists?.length > 0 && (
              <div className="mt-16 pt-10 border-t border-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-[0.18em]">Your sonic identity</p>
                  <span className="text-zinc-700 text-[10px] tracking-wider uppercase">Top artists</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.topArtists.map((a, i) => (
                    <span
                      key={a}
                      className="bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full animate-fade-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="space-y-3 mt-4">
            <p className="text-center text-zinc-500 text-sm mb-6 animate-fade-up">
              Analysing your taste and finding new albums…
            </p>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="max-w-xl mx-auto bg-red-950/30 border border-red-900/50 rounded-2xl p-5 text-center mt-4 animate-fade-up">
            <p className="text-red-300 text-sm font-medium mb-1">Something went wrong</p>
            <p className="text-red-400/80 text-xs mb-4">{error}</p>
            <button
              onClick={() => handleSearch({ preventDefault: () => {} })}
              className="text-red-200 hover:text-white text-xs font-semibold underline underline-offset-4 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {hasResults && (
          <div>
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-zinc-600 text-xs tabular-nums">5 picks for</span>
                <span className="text-white text-sm font-medium truncate max-w-[200px] sm:max-w-md">
                  "{lastQuery}"
                </span>
              </div>
              <button
                onClick={handleClear}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <AlbumCard key={`${rec.album}-${i}`} album={rec} index={i} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleClear}
                className="text-zinc-500 hover:text-green-400 text-sm font-medium transition-colors"
              >
                ↑ New search
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
