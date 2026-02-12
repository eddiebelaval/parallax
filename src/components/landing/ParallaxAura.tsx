'use client'

import { useEffect, useRef, useState } from 'react'

type AuraState = 'hidden' | 'entering' | 'visible' | 'exiting'

interface ParallaxAuraProps {
  visible: boolean
  chatMode?: boolean
  children: React.ReactNode
}

export function ParallaxAura({ visible, chatMode = false, children }: ParallaxAuraProps) {
  const [auraState, setAuraState] = useState<AuraState>('hidden')
  const prevVisible = useRef(visible)

  useEffect(() => {
    if (visible && !prevVisible.current) {
      setAuraState('entering')
      const timer = setTimeout(() => setAuraState('visible'), chatMode ? 500 : 800)
      return () => clearTimeout(timer)
    }
    if (!visible && prevVisible.current) {
      setAuraState('exiting')
      const timer = setTimeout(() => setAuraState('hidden'), 600)
      return () => clearTimeout(timer)
    }
    prevVisible.current = visible
  }, [visible, chatMode])

  useEffect(() => {
    prevVisible.current = visible
  })

  if (auraState === 'hidden') return null

  // Only animate the parent during enter/exit transitions.
  // When visible, the parent stays still — glow layers animate themselves.
  const animClass =
    auraState === 'entering'
      ? chatMode
        ? 'parallax-aura--chat-enter'
        : 'parallax-aura--entering'
      : auraState === 'exiting'
        ? 'parallax-aura--exiting'
        : ''

  const positionClass = chatMode ? 'parallax-aura--bottom' : ''

  // Narration: glow from top, casting down
  // Chat: glow from bottom, casting up
  if (chatMode) {
    return (
      <div className={`parallax-aura ${positionClass} ${animClass}`}>
        {/* Opaque backdrop — blocks page content from bleeding through */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '100%',
            background: 'linear-gradient(to top, var(--ember-dark) 60%, transparent 100%)',
          }}
        />
        {/* Glow layer 1: Intense teal from below */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '30vh',
            background:
              'radial-gradient(ellipse 90% 80% at 50% 100%, rgba(106, 171, 142, 0.50) 0%, rgba(106, 171, 142, 0.20) 35%, transparent 65%)',
            animation: 'aura-wave 8s ease-in-out infinite',
          }}
        />
        {/* Glow layer 2: Wider ambient from below */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '40vh',
            background:
              'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(106, 171, 142, 0.15) 0%, transparent 55%)',
            animation: 'aura-wave 12s ease-in-out infinite reverse',
          }}
        />
        {/* Content zone — anchored to lower third */}
        <div
          className="relative pb-8 pt-6 px-6 pointer-events-auto"
          style={{ minHeight: '35vh' }}
        >
          {children}
        </div>
      </div>
    )
  }

  // Narration mode: glow from top
  return (
    <div className={`parallax-aura ${animClass}`}>
      {/* Opaque backdrop — solid dark behind text so page content doesn't show */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: '100%',
          background: 'linear-gradient(to bottom, var(--ember-dark) 55%, transparent 100%)',
        }}
      />
      {/* Glow layer 1: Intense teal semicircle from top */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: '40vh',
          background:
            'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(106, 171, 142, 0.55) 0%, rgba(106, 171, 142, 0.25) 30%, transparent 65%)',
          animation: 'aura-wave 8s ease-in-out infinite',
        }}
      />
      {/* Glow layer 2: Wider ambient haze */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: '50vh',
          background:
            'radial-gradient(ellipse 120% 90% at 50% 0%, rgba(106, 171, 142, 0.18) 0%, transparent 55%)',
          animation: 'aura-wave 12s ease-in-out infinite reverse',
        }}
      />
      {/* Glow layer 3: Tight intense core — pulsing */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: '25vh',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(106, 171, 142, 0.40) 0%, transparent 60%)',
          animation: 'aura-pulse 3s ease-in-out infinite',
        }}
      />
      {/* Content zone — narration text */}
      <div
        className="relative pt-16 sm:pt-20 pb-8 px-6 pointer-events-auto"
        style={{ minHeight: '30vh' }}
      >
        {children}
      </div>
    </div>
  )
}
