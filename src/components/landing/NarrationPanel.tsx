'use client'

import { useRef, useCallback, useState, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/dist/Flip'
import { ParallaxOrb } from '@/components/ParallaxOrb'
import type { NarrationPhase } from '@/hooks/useNarrationController'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

interface NarrationPanelProps {
  phase: NarrationPhase
  slidUp: boolean
  onStart: () => void
  onReplay: () => void
  isLandingPage: boolean
  isSpeaking: boolean
  narrationContent: React.ReactNode
  chatContent: React.ReactNode
}

type LayoutState = 'idle' | 'voice-center' | 'voice-top' | 'pill' | 'chat'

function getLayoutState(phase: NarrationPhase, slidUp: boolean): LayoutState {
  switch (phase) {
    case 'idle':
      return 'idle'
    case 'expanding':
    case 'narrating':
      return slidUp ? 'voice-top' : 'voice-center'
    case 'collapsing':
    case 'complete':
      return 'pill'
    case 'chat':
      return 'chat'
  }
}

function getLayoutClass(layout: LayoutState, isSpeaking: boolean): string {
  const speaking = isSpeaking ? ' glass-panel--speaking' : ''
  switch (layout) {
    case 'idle':
      return 'glass-panel glass-panel--idle'
    case 'voice-center':
      return `glass-panel glass-panel--narrating${speaking}`
    case 'voice-top':
      return `glass-panel glass-panel--narrating-top${speaking}`
    case 'pill':
      return 'glass-panel glass-panel--pill'
    case 'chat':
      return 'glass-panel glass-panel--chat'
  }
}

export function NarrationPanel({
  phase,
  slidUp,
  onStart,
  onReplay,
  isLandingPage,
  isSpeaking,
  narrationContent,
  chatContent,
}: NarrationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const prevLayoutRef = useRef<LayoutState>('idle')
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)

  const currentLayout = getLayoutState(phase, slidUp)

  // Capture GSAP Flip state before layout changes
  useEffect(() => {
    if (!panelRef.current) return
    if (currentLayout !== prevLayoutRef.current) {
      // Don't flip for the slide-up transition (CSS handles it smoothly)
      const isSlideUp = prevLayoutRef.current === 'voice-center' && currentLayout === 'voice-top'
      if (!isSlideUp) {
        flipStateRef.current = Flip.getState(panelRef.current)
      }

      // Hide content during morphing transitions
      const isMorphing =
        (prevLayoutRef.current === 'idle' && currentLayout === 'voice-center') ||
        (prevLayoutRef.current === 'voice-center' && currentLayout === 'pill') ||
        (prevLayoutRef.current === 'voice-top' && currentLayout === 'pill') ||
        (prevLayoutRef.current === 'pill' && currentLayout === 'voice-center')
      if (isMorphing) {
        setContentVisible(false)
      }
    }
  }, [currentLayout])

  // Animate with GSAP Flip after layout change
  useLayoutEffect(() => {
    if (!panelRef.current || !flipStateRef.current) {
      prevLayoutRef.current = currentLayout
      return
    }

    const prevLayout = prevLayoutRef.current
    const isSlideUp = prevLayout === 'voice-center' && currentLayout === 'voice-top'

    if (!isSlideUp && flipStateRef.current) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let duration = 0.3
      if (currentLayout === 'pill' || prevLayout === 'pill') {
        duration = prevLayout === 'pill' ? 0.3 : 0.4
      }

      Flip.from(flipStateRef.current, {
        duration: prefersReduced ? 0 : duration,
        ease: 'power2.inOut',
        absolute: true,
        onComplete: () => {
          setContentVisible(true)
        },
      })

      flipStateRef.current = null
    }

    prevLayoutRef.current = currentLayout
  }, [currentLayout])

  // Mouse tracking for specular highlight (idle + pill states)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }, [])

  const isClickable = phase === 'idle' || phase === 'complete'
  const showNarrationContent = phase === 'narrating' && contentVisible
  const showChatContent = phase === 'chat'
  const showIdleContent = phase === 'idle' && contentVisible
  const showPillContent = phase === 'complete' && contentVisible
  const isMorphing = phase === 'expanding' || phase === 'collapsing'
  const isNarrating = phase === 'narrating' || phase === 'expanding'

  return (
    <div
      ref={panelRef}
      className={getLayoutClass(currentLayout, isSpeaking && isNarrating)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        phase === 'idle'
          ? 'Begin guided introduction'
          : phase === 'complete'
            ? isLandingPage ? 'Replay introduction' : 'Open Parallax assistant'
            : undefined
      }
      onClick={() => {
        if (phase === 'idle') onStart()
        else if (phase === 'complete' && isLandingPage) onReplay()
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
          e.preventDefault()
          if (phase === 'idle') onStart()
          else if (phase === 'complete' && isLandingPage) onReplay()
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 50, y: 50 }) }}
      style={{ cursor: isClickable ? 'pointer' : undefined }}
    >
      {/* Glass material layers */}
      <span className="glass-panel__surface" aria-hidden="true" />
      <span className="glass-panel__fresnel" aria-hidden="true" />
      <span className="glass-panel__chromatic-r" aria-hidden="true" />
      <span className="glass-panel__chromatic-b" aria-hidden="true" />

      {/* Specular highlight — tracks mouse on interactive states */}
      {isClickable && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            opacity: isHovering ? 1 : 0,
            mixBlendMode: 'overlay',
            background: `radial-gradient(
              circle ${isHovering ? '200px' : '140px'} at ${mousePos.x}% ${mousePos.y}%,
              rgba(255, 255, 255, 0.35) 0%,
              rgba(255, 255, 255, 0.1) 35%,
              transparent 65%
            )`,
            transition: isHovering
              ? 'background 0.05s linear, opacity 0.25s'
              : 'background 0.6s ease-out, opacity 0.4s',
          }}
        />
      )}

      {/* Teal accent glow — tracks mouse on interactive states */}
      {isClickable && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            opacity: isHovering ? 0.8 : 0.2,
            background: `radial-gradient(
              circle ${isHovering ? '180px' : '120px'} at ${mousePos.x}% ${mousePos.y}%,
              rgba(106, 171, 142, ${isHovering ? 0.2 : 0.08}) 0%,
              rgba(212, 160, 64, ${isHovering ? 0.06 : 0.02}) 50%,
              transparent 100%
            )`,
            mixBlendMode: 'screen',
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Idle: Rotating glow halo + breathing ring + orbiting hint */}
      {phase === 'idle' && (
        <>
          <span className="glass-panel__glow" aria-hidden="true" />
          <span className="glass-panel__breathe-ring" aria-hidden="true" />
          <span className="orbit-hint" aria-hidden="true">sound on</span>
        </>
      )}

      {/* ─── Content by phase ─── */}

      {/* Idle: ParallaxOrb caged inside frosted glass — breathing, waiting to be released */}
      {showIdleContent && (
        <div className="relative z-10 flex items-center justify-center">
          <ParallaxOrb
            size={88}
            energy={0}
            isSpeaking={false}
            isAnalyzing={false}
            particles={false}
          />
        </div>
      )}

      {/* Pill: "Parallax" text */}
      {showPillContent && (
        <span className="relative z-10 font-serif text-sm text-foreground/80">
          Parallax
        </span>
      )}

      {/* Narrating: teleprompter inside the pill */}
      {showNarrationContent && (
        <div className="relative z-10 w-full">
          {narrationContent}
        </div>
      )}

      {/* Chat: chat interface — full height for flex layout */}
      {showChatContent && (
        <div className="relative z-10 h-full">
          {chatContent}
        </div>
      )}

      {/* Morphing: empty — just the glass surface animating */}
      {isMorphing && (
        <div className="relative z-10" aria-hidden="true" />
      )}
    </div>
  )
}
