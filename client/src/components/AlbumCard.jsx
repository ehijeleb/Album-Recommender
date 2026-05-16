export default function AlbumCard({ album, index }) {
  const rank = String(index + 1).padStart(2, '0')

  return (
    <article
      className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all duration-300 backdrop-blur-sm animate-fade-up overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent opacity-60 group-hover:via-green-500/40 transition-colors duration-500" />

      <div className="flex gap-4 sm:gap-5">
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-2 bg-green-500/0 group-hover:bg-green-500/10 blur-xl rounded-2xl transition-all duration-500" />
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-800 shadow-card ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-[1.03]">
            {album.albumArt ? (
              <img
                src={album.albumArt}
                alt={`${album.album} cover`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-zinc-700" aria-hidden="true">
                  <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                </svg>
              </div>
            )}
          </div>
          <span
            aria-hidden="true"
            className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 text-[11px] font-semibold tracking-wider flex items-center justify-center tabular-nums"
          >
            {rank}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-white text-lg sm:text-xl leading-tight tracking-tight truncate">
                {album.album}
              </h3>
              <p className="text-zinc-400 text-sm mt-1 truncate">
                <span className="text-zinc-300">{album.artist}</span>
                {album.year && (
                  <span className="text-zinc-600"> · {album.year}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {album.genre && (
              <span className="bg-zinc-800/80 text-zinc-300 text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                {album.genre}
              </span>
            )}
            {album.mood && (
              <span className="bg-green-500/10 text-green-300 text-[11px] font-medium px-2.5 py-1 rounded-full border border-green-500/20 whitespace-nowrap">
                {album.mood}
              </span>
            )}
          </div>

          {album.reason && (
            <blockquote className="relative mt-4 pl-3 border-l-2 border-zinc-800 group-hover:border-green-500/40 transition-colors duration-300">
              <p className="text-zinc-400 text-sm leading-relaxed italic">
                {album.reason}
              </p>
            </blockquote>
          )}

          {album.spotifyUrl && (
            <div className="mt-4 flex">
              <a
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${album.album} on Spotify`}
                className="inline-flex items-center gap-2 bg-zinc-800/70 hover:bg-green-500 text-zinc-200 hover:text-black text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 group/btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                </svg>
                Open in Spotify
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
