'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import Masthead from '@/components/layout/Masthead'
import AudioRail from '@/components/layout/AudioRail'
import LeadStory from '@/components/feed/LeadStory'
import AIDigest from '@/components/feed/AIDigest'
import StoryRow from '@/components/feed/StoryRow'

export default function Home() {
  const [articles, setArticles]         = useState([])
  const [digest, setDigest]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeBeat, setActiveBeat]     = useState('All')
  const [playingArticle, setPlayingArticle] = useState(null)
  const [savedIds, setSavedIds]         = useState(new Set())

  const fetchBriefing = useCallback(async (beat = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/briefing?beat=${beat.toLowerCase()}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setDigest(data.digest || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBriefing()
    // Load saved articles from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('ls-saved') || '[]')
      setSavedIds(new Set(saved))
    } catch {}
  }, [])

  function handleBeatChange(beat) {
    setActiveBeat(beat)
    if (beat === 'Saved') {
      // filter locally
      return
    }
    fetchBriefing(beat === 'All' ? 'all' : beat)
  }

  function handleListen(article) {
    setPlayingArticle(article)
  }

  function handleSave(article) {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(article.id)) {
        next.delete(article.id)
      } else {
        next.add(article.id)
      }
      localStorage.setItem('ls-saved', JSON.stringify([...next]))
      return next
    })
  }

  // Split lead vs rest
  const lead      = articles.find(a => a.isLead)
  const rest      = articles.filter(a => !a.isLead)
  const displayed = activeBeat === 'Saved'
    ? articles.filter(a => savedIds.has(a.id))
    : rest

  const enriched = (arr) =>
    arr.map(a => ({ ...a, saved: savedIds.has(a.id) }))

  return (
    <ThemeProvider>
      {/* Desktop: two-column grid. Mobile: single column */}
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="desktop-grid">

          {/* ── MAIN COLUMN ── */}
          <main>
            <Masthead
              articleCount={articles.length}
              onBeatChange={handleBeatChange}
            />

            {/* Error state */}
            {error && (
              <div className="px-6 py-8 text-center">
                <p className="text-label mb-2" style={{ color: 'var(--text-dim)' }}>
                  Failed to load briefing
                </p>
                <p className="text-[12px] mb-4" style={{ color: 'var(--text-dim)' }}>{error}</p>
                <button className="btn-listen" onClick={() => fetchBriefing(activeBeat)}>
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && !error && (
              <div className="animate-feed">
                {/* Lead skeleton */}
                <div className="px-6 py-8" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <div className="skeleton h-2 w-28 mb-4" />
                  <div className="skeleton h-7 w-full mb-2" />
                  <div className="skeleton h-7 w-5/6 mb-2" />
                  <div className="skeleton h-7 w-4/6 mb-5" />
                  <div className="skeleton h-3 w-full mb-2" />
                  <div className="skeleton h-3 w-5/6" />
                </div>
                {/* Digest skeleton */}
                <div className="mx-6 py-5" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <div className="skeleton h-2 w-24 mb-3" />
                  <div className="skeleton h-3 w-full mb-2" />
                  <div className="skeleton h-3 w-4/6" />
                </div>
                {/* Story skeletons */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="px-6 py-5" style={{ borderBottom: '1px solid var(--rule)' }}>
                    <div className="skeleton h-2 w-20 mb-3" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            {!loading && !error && (
              <div className="animate-feed">
                {lead && (
                  <LeadStory
                    article={{ ...lead, saved: savedIds.has(lead.id) }}
                    onListen={handleListen}
                    onSave={handleSave}
                  />
                )}

                <AIDigest digest={digest} isLoading={false} />

                <section aria-label="More stories">
                  {enriched(displayed).map((article, i) => (
                    <StoryRow
                      key={article.id}
                      article={article}
                      index={i + 1}
                      onListen={handleListen}
                      onSave={handleSave}
                      isPlaying={playingArticle?.id === article.id}
                    />
                  ))}
                </section>

                {displayed.length === 0 && activeBeat === 'Saved' && (
                  <div className="px-6 py-16 text-center">
                    <p className="text-label" style={{ color: 'var(--text-dim)' }}>
                      No saved articles yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom padding for audio rail on mobile */}
            <div className="h-28 md:h-0" />
          </main>

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="desktop-sidebar hidden md:block">
            <div
              className="px-6 py-8"
              style={{ borderBottom: '1px solid var(--rule)' }}
            >
              <span className="text-label block mb-4" style={{ color: 'var(--text-dim)' }}>
                Today's Digest
              </span>
              {digest && (
                <div className="digest-quote">
                  <p dangerouslySetInnerHTML={{ __html: digest.summary }} />
                  {digest.detail && (
                    <p
                      className="mt-3 pt-3"
                      style={{ borderTop: '1px solid var(--rule)' }}
                      dangerouslySetInnerHTML={{ __html: digest.detail }}
                    />
                  )}
                  {digest.watchFor && (
                    <p className="mt-3 pt-3 not-italic" style={{ borderTop: '1px solid var(--rule)', color: 'var(--text-dim)', fontSize: 12 }}>
                      <span style={{ color: 'var(--accent)' }}>Watch — </span>
                      {digest.watchFor}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Audio player — desktop sidebar position */}
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

      {/* Mobile audio rail — fixed bottom */}
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