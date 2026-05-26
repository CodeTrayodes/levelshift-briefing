'use client'

export default function LeadStory({ article, onListen, onSave }) {
  if (!article) return null

  return (
    <article
      style={{ borderBottom: '1px solid var(--rule)' }}
      className="px-6 pt-10 pb-8 md:px-8 md:pt-12"
    >
      {/* Kicker */}
      <div className="rule-kicker mb-4">
        <span className="text-kicker">{article.category}</span>
      </div>

      {/* Headline */}
      <h1
        className="font-playfair text-[32px] md:text-[44px] font-black leading-[1.08] tracking-[-0.02em] mb-5"
        style={{ color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: article.headline }}
      />

      {/* Deck */}
      <p
        className="text-[16px] md:text-[17px] font-light leading-[1.75] mb-8"
        style={{ color: 'var(--text-muted)', maxWidth: '60ch' }}
      >
        {article.deck}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-label" style={{ color: 'var(--text-muted)' }}>
            {article.source}
          </span>
          <span className="text-label" style={{ color: 'var(--text-dim)' }}>
            {article.timeAgo} · {article.readTime} read
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-listen"
            onClick={() => onListen?.(article)}
            aria-label={`Listen to ${article.headline}`}
          >
            <span>Listen</span>
            <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </span>
          </button>

          <button
            className="btn-ghost"
            onClick={() => onSave?.(article)}
            aria-label={article.saved ? 'Unsave article' : 'Save article'}
          >
            {article.saved ? 'Saved ★' : 'Save'}
          </button>
        </div>
      </div>

      {/* Reference URL */}
      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label mt-5 block hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-dim)' }}
        >
          {new URL(article.url).hostname.replace('www.', '')} ↗
        </a>
      )}
    </article>
  )
}
