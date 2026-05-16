import { BACKEND } from '../api'

const SPOTIFY_LOGO = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
  </svg>
)

const FEATURES = [
  {
    title: 'Taste-aware',
    desc: 'Reads your top artists, genres, and recent plays to ground every pick.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9V5l12-2v13M9 9l12-2M9 9v10a3 3 0 1 1-3-3M21 16a3 3 0 1 1-3-3"
      />
    ),
  },
  {
    title: 'Never repeats',
    desc: 'Cross-checks your full library — nothing you already own.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    ),
  },
  {
    title: 'Natural language',
    desc: 'Search by mood, era, or moment — "smooth jazz for a rainy evening."',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    ),
  },
]

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-zinc-950 text-white">
      <div className="aurora-bg" aria-hidden="true" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.05),_transparent_60%)] pointer-events-none" />

      <main className="relative z-10 min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-zinc-400 tracking-wide">AI curator · powered by your Spotify</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-balance leading-[1.05] mb-5">
            Find your next
            <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              favourite album.
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-10 max-w-sm mx-auto text-balance">
            Describe a mood. Get five hand-picked albums you haven't heard yet — verified, never repeated.
          </p>

          <a
            href={`${BACKEND}/auth/login`}
            className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[280px] bg-green-500 hover:bg-green-400 active:scale-[0.98] text-black font-semibold py-4 px-8 rounded-full text-base transition-all duration-200 shadow-glow-green"
          >
            <span className="w-5 h-5">{SPOTIFY_LOGO}</span>
            Continue with Spotify
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" clipRule="evenodd" />
            </svg>
          </a>

          <p className="text-zinc-600 text-xs mt-5">
            Read-only access. We never store your data.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {FEATURES.map(({ title, desc, icon }, i) => (
              <div
                key={title}
                className="group relative bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl p-4 backdrop-blur-sm transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${150 + i * 80}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3 group-hover:bg-green-500/15 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-green-400" aria-hidden="true">
                    {icon}
                  </svg>
                </div>
                <p className="text-white text-sm font-semibold mb-1">{title}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="absolute bottom-6 left-0 right-0 text-center text-zinc-700 text-[11px] tracking-wide">
          Not affiliated with Spotify · Built for music lovers
        </footer>
      </main>
    </div>
  )
}
