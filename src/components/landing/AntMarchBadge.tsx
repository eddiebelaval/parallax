'use client'

import { useState, useEffect, useRef } from 'react'

interface AntMarchBadgeProps {
  onClick: () => void
}

/**
 * Check if the ant has been released (easter egg state)
 */
function useAntReleased(): boolean {
  const [isReleased, setIsReleased] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const released = localStorage.getItem('parallax-ant-released') === 'true'
    setIsReleased(released)

    // Poll for changes (in case user releases ant in another tab)
    const interval = setInterval(() => {
      const released = localStorage.getItem('parallax-ant-released') === 'true'
      setIsReleased(released)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return isReleased
}

/** Compute an SVG path tracing a pill/stadium shape clockwise. */
function stadiumPath(w: number, h: number): string {
  const r = h / 2
  return [
    `M ${r} 0`,
    `L ${w - r} 0`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `L ${r} ${h}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    'Z',
  ].join(' ')
}

const ANT_COUNT = 14
const MARCH_DURATION_S = 20
const SPAWN_INTERVAL_MS = (MARCH_DURATION_S / ANT_COUNT) * 1000
const INITIAL_DELAY_MS = 7000

export function AntMarchBadge({ onClick }: AntMarchBadgeProps) {
  const pillRef = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState('')
  const [spawnedCount, setSpawnedCount] = useState(0)
  const antReleased = useAntReleased()

  // Measure the pill and compute the marching path
  useEffect(() => {
    if (!pillRef.current) return
    const el = pillRef.current
    setPath(stadiumPath(el.offsetWidth, el.offsetHeight))
  }, [])

  // Stagger ant spawning after initial delay
  useEffect(() => {
    if (!path) return
    let intervalId: ReturnType<typeof setInterval> | null = null
    const timerId = setTimeout(() => {
      let count = 0
      intervalId = setInterval(() => {
        count++
        setSpawnedCount(count)
        if (count >= ANT_COUNT && intervalId) clearInterval(intervalId)
      }, SPAWN_INTERVAL_MS)
    }, INITIAL_DELAY_MS)
    return () => {
      clearTimeout(timerId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [path])

  return (
    <div className="group inline-block">
      {/* Pill wrapper — relative for ant positioning */}
      <div className="relative inline-flex">
        {/* The crab pill badge */}
        <div
          id="claude-code-badge"
          ref={pillRef}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-border rounded-full bg-surface/50 backdrop-blur-sm transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:opacity-40"
        >
          {/* Crab icon (Clawd) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-success flex-shrink-0">
            <path d="M5 8c-1.5-1.5-3-2-4-1.5M19 8c1.5-1.5 3-2 4-1.5M8 4c0-1.5-.5-3-1.5-3.5M16 4c0-1.5.5-3 1.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="12" cy="13" rx="7" ry="6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9.5" cy="11.5" r="1" fill="currentColor" />
            <circle cx="14.5" cy="11.5" r="1" fill="currentColor" />
            <path d="M5 16c-2 1-3 3-2.5 4M19 16c2 1 3 3 2.5 4M8 19c-.5 1.5-1 3-.5 4M16 19c.5 1.5 1 3 .5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Built with Claude Code
          </span>
        </div>

        {/* Marching ants — walk the pill perimeter */}
        {path && Array.from({ length: spawnedCount }, (_, i) => (
          <span
            key={i}
            className="ant-march pointer-events-none"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              offsetPath: `path('${path}')`,
              offsetAnchor: 'center',
              offsetRotate: 'auto',
            } as React.CSSProperties}
          >
            {/* Tiny 2D side-view ant (~10x8px) */}
            <svg width="10" height="8" viewBox="0 0 10 8" className="text-muted/60">
              <ellipse cx="2.5" cy="4" rx="2" ry="1.6" fill="currentColor" />
              <ellipse cx="5.2" cy="3.8" rx="1.3" ry="1" fill="currentColor" />
              <circle cx="7.2" cy="3.5" r="0.9" fill="currentColor" />
              <line x1="3" y1="5.3" x2="2" y2="7.5" stroke="currentColor" strokeWidth="0.4" />
              <line x1="4.8" y1="4.8" x2="4" y2="7" stroke="currentColor" strokeWidth="0.4" />
              <line x1="6.2" y1="4.6" x2="5.8" y2="6.8" stroke="currentColor" strokeWidth="0.4" />
              <line x1="7.8" y1="2.8" x2="8.8" y2="1.2" stroke="currentColor" strokeWidth="0.3" />
              <line x1="7.6" y1="3.2" x2="9" y2="2" stroke="currentColor" strokeWidth="0.3" />
            </svg>
          </span>
        ))}
      </div>

      {/* Easter egg: "Under the Hood" only appears AFTER ant escapes */}
      {antReleased && (
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <button
              onClick={onClick}
              className="pt-1 pb-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-success/70 hover:text-success opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150"
              aria-label="Talk to Ava about how Parallax works"
            >
              ^ Under the Hood ^
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
