'use client'

import { useState } from 'react'

export default function AIDigest({ digest, isLoading }) {
  const [expanded, setExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="px-6 py-7 md:px-8" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="skeleton h-2 w-24 mb-4" />
        <div className="skeleton h-3 w-full mb-2" />
        <div className="skeleton h-3 w-5/6 mb-2" />
        <div className="skeleton h-3 w-4/6" />
      </div>
    )
  }

  if (!digest) return null

  return (
    <div className="px-6 py-7 md:px-8" style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-label" style={{ color: 'var(--text-dim)' }}>
          AI Digest — Today's Signal
        </span>
        <button
          className="btn-ghost"
          style={{ fontSize: 11 }}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {/* Digest body */}
      <div className="digest-quote">
        <p dangerouslySetInnerHTML={{ __html: digest.summary }} />
        {expanded && digest.detail && (
          <p
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--rule)' }}
            dangerouslySetInnerHTML={{ __html: digest.detail }}
          />
        )}
      </div>

      {/* What to watch */}
      {digest.watchFor && (
        <div className="mt-4 flex items-start gap-3">
          <span className="text-label mt-0.5 shrink-0" style={{ color: 'var(--accent)' }}>
            Watch
          </span>
          <span
            className="text-[12px] font-light leading-relaxed"
            style={{ color: 'var(--text-dim)' }}
          >
            {digest.watchFor}
          </span>
        </div>
      )}
    </div>
  )
}
