'use client'

import { useState, useRef, useEffect } from 'react'

export default function AudioRail({ article, onClose }) {
  const [playing, setPlaying]       = useState(false)
  const [progress, setProgress]     = useState(0)
  const [duration, setDuration]     = useState(0)
  const [loading, setLoading]       = useState(false)
  const audioRef                    = useRef(null)

  // Auto-load + play when article changes
  useEffect(() => {
    if (!article) return
    setProgress(0)
    setPlaying(false)
    loadAndPlay(article)
  }, [article?.id])

  async function loadAndPlay(art) {
    setLoading(true)
    try {
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${art.headline.replace(/<[^>]+>/g, '')}. ${art.deck}`,
          articleId: art.id,
        }),
      })
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setPlaying(true)
      }
    } catch (err) {
      console.error('Audio error:', err)
    } finally {
      setLoading(false)
    }
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
    setDuration(audioRef.current.duration || 0)
  }

  function handleSeek(e) {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  function formatTime(secs) {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!article) return null

  const currentTime = audioRef.current?.currentTime || 0

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:sticky md:bottom-0"
      style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--rule-strong)' }}
      role="region"
      aria-label="Audio player"
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      {/* Progress track */}
      <div
        className="progress-track cursor-pointer"
        onClick={handleSeek}
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-3 pb-6">
        {/* Article info */}
        <div className="flex-1 min-w-0">
          <div className="text-label mb-0.5" style={{ color: 'var(--accent)' }}>
            {loading ? 'Loading audio…' : 'Now Playing'}
          </div>
          <div
            className="font-playfair text-[15px] font-bold leading-snug truncate"
            style={{ color: 'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: article.headline }}
          />
          <div className="text-label mt-0.5" style={{ color: 'var(--text-dim)' }}>
            {article.source} · {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={togglePlay}
            disabled={loading}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--rule-strong)',
              background: 'transparent',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {loading ? '…' : playing ? '⏸' : '▶'}
          </button>

          <button
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close player"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}