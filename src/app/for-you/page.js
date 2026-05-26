'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import Masthead from '@/components/layout/Masthead'
import AudioRail from '@/components/layout/AudioRail'

const SIGNAL_COLORS = {
  'tool you use':  { text: 'var(--accent)',  bg: 'rgba(200,151,58,0.08)',  border: 'rgba(200,151,58,0.2)' },
  'ad platform':   { text: 'var(--accent)',  bg: 'rgba(200,151,58,0.08)',  border: 'rgba(200,151,58,0.2)' },
  'competitor move': { text: '#E07070',      bg: 'rgba(224,112,112,0.08)', border: 'rgba(224,112,112,0.2)' },
  'watching':      { text: '#7BA7BC',        bg: 'rgba(123,167,188,0.08)', border: 'rgba(123,167,188,0.2)' },
  'stakeholder':   { text: '#9B8BC4',        bg: 'rgba(155,139,196,0.08)', border: 'rgba(155,139,196,0.2)' },
}

function getSignalStyle(signal) {
  return SIGNAL_COLORS[signal?.toLowerCase()] || {
    text: 'var(--text-dim)', bg: 'var(--bg-2)', border: 'var(--rule-strong)',
  }
}

export default function ForYou() {
  const [data, setData]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [playingArticle, setPlayingArticle] = useState(null)
  const [savedIds, setSavedIds]           = useState(new Set())

  useEffect(() => {
    fetch('/api/for-you')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))

    try {
      setSavedIds(new Set(JSON.parse(localStorage.getItem('ls-saved') || '[]')))
    } catch {}
  }, [])

  function handleSave(article) {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(article.id)) next.delete(article.id)
      else next.add(article.id)
      localStorage.setItem('ls-saved', JSON.stringify([...next]))
      return next
    })
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="desktop-grid">

          {/* ── MAIN COLUMN ── */}
          <main>
            <Masthead
              articleCount={data?.articles?.length ?? 0}
              onBeatChange={() => {}}
            />

            {/* Page header */}
            <div
              className="px-6 pt-10 pb-8 md:px-8"
              style={{ borderBottom: '1px solid var(--rule)' }}
            >
              <div className="rule-kicker mb-4">
                <span className="text-kicker">For You</span>
              </div>
              <h1
                className="font-playfair text-[30px] md:text-[38px] font-black leading-[1.08] tracking-[-0.02em] mb-3"
                style={{ color: 'var(--text)' }}
              >
                Your <em>personal briefing,</em><br />
                built for Marketing
              </h1>
              <p
                className="text-[15px] font-light leading-relaxed mb-6"
                style={{ color: 'var(--text-dim)', maxWidth: '50ch' }}
              >
                Curated around the tools your team uses, your competitor watch list, and your stakeholders.
              </p>

              {/* Context chips */}
              {data?.team && (
                <div className="flex flex-wrap gap-2">
                  {data.team.tools.map(tool => (
                    <span
                      key={tool}
                      className="text-label px-2.5 py-1"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--rule-strong)',
                        borderRadius: 2,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article list */}
            {loading ? (
              <div className="animate-feed">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="px-6 py-7 md:px-8"
                    style={{ borderBottom: '1px solid var(--rule)' }}
                  >
                    <div className="skeleton h-2 w-36 mb-4" />
                    <div className="skeleton h-2 w-24 mb-3" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-3/4 mb-4" />
                    <div className="skeleton h-3 w-5/6 mb-2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-feed">
                {data?.articles?.map((article, i) => (
                  <ForYouCard
                    key={article.id}
                    article={{ ...article, saved: savedIds.has(article.id) }}
                    index={i + 1}
                    onListen={() => setPlayingArticle(article)}
                    onSave={() => handleSave(article)}
                    isPlaying={playingArticle?.id === article.id}
                  />
                ))}
              </div>
            )}

            <div className="h-28 md:h-0" />
          </main>

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="desktop-sidebar hidden md:block">
            <div className="px-6 py-8" style={{ borderBottom: '1px solid var(--rule)' }}>
              <span className="text-label block mb-5" style={{ color: 'var(--text-dim)' }}>
                Your Context
              </span>

              {data?.team ? (
                <div className="space-y-5">
                  <ContextSection
                    label="Tools"
                    items={data.team.tools}
                    color="var(--accent)"
                  />
                  <ContextSection
                    label="Watching"
                    items={data.team.watching}
                    color="#7BA7BC"
                  />
                  <ContextSection
                    label="Stakeholders"
                    items={data.team.stakeholders}
                    color="#9B8BC4"
                  />
                </div>
              ) : (
                <>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton h-3 w-3/4 mb-3" />)}
                </>
              )}
            </div>

            {playingArticle && (
              <div className="px-6 py-6">
                <span className="text-label block mb-3" style={{ color: 'var(--text-dim)' }}>
                  Now Playing
                </span>
                <AudioRail
                  article={playingArticle}
                  onClose={() => setPlayingArticle(null)}
                />
              </div>
            )}
          </aside>

        </div>
      </div>

      {/* Mobile audio rail */}
      <div className="md:hidden">
        {playingArticle && (
          <AudioRail
            article={playingArticle}
            onClose={() => setPlayingArticle(null)}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

function ForYouCard({ article, index, onListen, onSave, isPlaying }) {
  const signalStyle = getSignalStyle(article.signal)

  return (
    <article
      className="story-row px-6 py-7 md:px-8"
      style={{ borderBottom: '1px solid var(--rule)' }}
    >
      {/* Index + signal tag */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-playfair text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {String(index).padStart(2, '0')}
        </span>
        <span
          className="text-label px-2 py-0.5"
          style={{
            color: signalStyle.text,
            background: signalStyle.bg,
            border: `1px solid ${signalStyle.border}`,
            borderRadius: 2,
          }}
        >
          {article.signal} — {article.signalDetail}
        </span>
      </div>

      {/* Category */}
      <div className="rule-kicker mb-3">
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
        className="text-[15px] font-light leading-[1.7] mb-5"
        style={{ color: 'var(--text-muted)', maxWidth: '60ch' }}
      >
        {article.deck}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-label" style={{ color: 'var(--text-dim)' }}>{article.source}</span>
          <span style={{ color: 'var(--rule-strong)' }}>·</span>
          <span className="text-label" style={{ color: 'var(--text-dim)' }}>{article.timeAgo}</span>
          <span style={{ color: 'var(--rule-strong)' }}>·</span>
          <span className="text-label" style={{ color: 'var(--text-dim)' }}>{article.readTime}</span>
        </div>

        <div className="flex items-center gap-3">
          {isPlaying ? (
            <span className="flex items-end gap-0.5 h-3" aria-label="Now playing">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </span>
          ) : (
            <button className="btn-ghost" onClick={onListen} aria-label="Listen">▶</button>
          )}
          <button className="btn-ghost" onClick={onSave} aria-label={article.saved ? 'Unsave' : 'Save'}>
            {article.saved ? '★' : '☆'}
          </button>
        </div>
      </div>

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

function ContextSection({ label, items, color }) {
  return (
    <div style={{ paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
      <p className="text-label mb-2" style={{ color }}>{label}</p>
      {items.map(item => (
        <span key={item} className="text-label block py-1" style={{ color: 'var(--text-muted)' }}>
          {item}
        </span>
      ))}
    </div>
  )
}
