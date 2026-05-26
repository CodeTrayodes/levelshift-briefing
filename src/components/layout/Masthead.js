'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ui/ThemeProvider'

const BEATS = ['All', 'Competitors', 'AI Tools', 'Campaigns', 'Trends', 'Saved']

export default function Masthead({ articleCount = 0, onBeatChange }) {
  const [localBeat, setLocalBeat] = useState('All')
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const isForYou = pathname === '/for-you'

  const activeBeat = isForYou ? 'For You' : localBeat

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function handleBeat(beat) {
    setLocalBeat(beat)
    onBeatChange?.(beat)
  }

  return (
    <header
      style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg)' }}
      className="sticky top-0 z-30 px-6 pt-5 pb-0"
    >
      {/* Brand row */}
      <div className="flex items-start justify-between mb-5">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="text-kicker block mb-1">Levelshift</span>
          <span
            className="font-playfair text-[28px] font-bold leading-none block"
            style={{ color: 'var(--text)' }}
          >
            Intelligence
          </span>
        </Link>

        <div className="flex flex-col items-end gap-2">
          <span
            className="text-label"
            style={{ color: 'var(--text-dim)' }}
            suppressHydrationWarning
          >
            {today}
          </span>

          <div className="flex items-center gap-3">
            {articleCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="live-dot" />
                <span className="text-label" style={{ color: 'var(--accent)' }}>
                  {articleCount} new
                </span>
              </div>
            )}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '○' : '●'}
            </button>
          </div>
        </div>
      </div>

      {/* Beat navigation */}
      <nav
        className="flex gap-6 overflow-x-auto scroll-hide"
        style={{ marginBottom: '-1px' }}
        aria-label="Content beats"
      >
        {/* For You — always a link */}
        <Link
          href="/for-you"
          className={`beat-pill ${activeBeat === 'For You' ? 'active' : ''}`}
          style={activeBeat === 'For You' ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' } : {}}
        >
          For You
        </Link>

        {BEATS.map((beat) =>
          isForYou ? (
            <Link
              key={beat}
              href="/"
              className="beat-pill"
            >
              {beat}
            </Link>
          ) : (
            <button
              key={beat}
              className={`beat-pill ${activeBeat === beat ? 'active' : ''}`}
              onClick={() => handleBeat(beat)}
              aria-current={activeBeat === beat ? 'page' : undefined}
            >
              {beat}
            </button>
          )
        )}
      </nav>
    </header>
  )
}
