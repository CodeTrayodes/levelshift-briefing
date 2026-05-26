'use client'

export default function StoryRow({ article, index, onListen, onSave, isPlaying }) {
  return (
    <article
      className="story-row px-6 py-7 md:px-8"
      style={{ borderBottom: '1px solid var(--rule)' }}
      role="article"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Index + kicker */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="font-playfair text-[10px]"
              style={{ color: 'var(--text-dim)' }}
            >
              {String(index).padStart(2, '0')}
            </span>
            <span className="text-kicker">{article.category}</span>
          </div>

          {/* Headline */}
          <h2
            className="font-playfair text-[20px] font-bold leading-[1.3] tracking-[-0.01em] mb-3"
            style={{ color: 'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: article.headline }}
          />

          {/* Deck */}
          <p
            className="text-[15px] font-light leading-[1.7] mb-4"
            style={{ color: 'var(--text-muted)', maxWidth: '60ch' }}
          >
            {article.deck}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-label" style={{ color: 'var(--text-dim)' }}>
                {article.source}
              </span>
              <span style={{ color: 'var(--rule-strong)' }}>·</span>
              <span className="text-label" style={{ color: 'var(--text-dim)' }}>
                {article.timeAgo}
              </span>
              <span style={{ color: 'var(--rule-strong)' }}>·</span>
              <span className="text-label" style={{ color: 'var(--text-dim)' }}>
                {article.readTime}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isPlaying ? (
                <span className="flex items-end gap-0.5 h-3" aria-label="Now playing">
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                </span>
              ) : (
                <button
                  className="btn-ghost"
                  onClick={() => onListen?.(article)}
                  aria-label={`Listen to ${article.headline}`}
                >
                  ▶
                </button>
              )}

              <button
                className="btn-ghost"
                onClick={() => onSave?.(article)}
                aria-label={article.saved ? 'Unsave article' : 'Save article'}
              >
                {article.saved ? '★' : '☆'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Source link */}
      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label mt-3 block hover:opacity-60 transition-opacity"
          style={{ color: 'var(--text-dim)' }}
        >
          {new URL(article.url).hostname.replace('www.', '')} ↗
        </a>
      )}
    </article>
  )
}
