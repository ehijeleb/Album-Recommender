export default function AlbumCard({ album, index }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 flex gap-4 transition-colors group">
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800 shadow-md">
        {album.albumArt ? (
          <img src={album.albumArt} alt={album.album} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-zinc-600">
              <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base leading-tight truncate">{album.album}</h4>
            <p className="text-zinc-400 text-sm mt-0.5">
              {album.artist}
              {album.year && <span className="text-zinc-600"> · {album.year}</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {album.genre && (
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                {album.genre}
              </span>
            )}
            {album.mood && (
              <span className="bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-500/20 whitespace-nowrap">
                {album.mood}
              </span>
            )}
          </div>
        </div>

        {album.reason && (
          <p className="text-zinc-500 text-sm leading-relaxed mt-2">{album.reason}</p>
        )}

        {album.spotifyUrl && (
          <a
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-green-500 hover:text-green-400 text-xs font-medium mt-2.5 transition-colors"
          >
            Open in Spotify
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
