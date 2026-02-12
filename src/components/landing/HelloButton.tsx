'use client'

import { useRef, useCallback, useState } from 'react'

interface HelloButtonProps {
  onClick: () => void
  visible: boolean
}

export function HelloButton({ onClick, visible }: HelloButtonProps) {
  const pillRef = useRef<HTMLButtonElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = pillRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      <button
        ref={pillRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 50, y: 50 }) }}
        className="group relative px-14 sm:px-20 py-10 sm:py-14 rounded-full liquid-glass liquid-glass--lg"
        aria-label="Begin guided introduction"
      >
        {/* Layer 1: Glass background with bevel */}
        <span className="liquid-glass__bg" aria-hidden="true" />

        {/* Layer 2: Fresnel rim — edges brighter than center */}
        <span className="liquid-glass__fresnel" aria-hidden="true" />

        {/* Layer 3: Mouse-tracking specular highlight */}
        <span
          aria-hidden="true"
          className="liquid-glass__specular"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(
              circle ${isHovering ? '200px' : '140px'} at ${mousePos.x}% ${mousePos.y}%,
              rgba(255, 255, 255, 0.35) 0%,
              rgba(255, 255, 255, 0.1) 35%,
              transparent 65%
            )`,
            transition: isHovering ? 'background 0.05s linear, opacity 0.25s' : 'background 0.6s ease-out, opacity 0.4s',
          }}
        />

        {/* Layer 4: Chromatic aberration border — red/blue shift */}
        <span className="liquid-glass__chromatic-r" aria-hidden="true" />
        <span className="liquid-glass__chromatic-b" aria-hidden="true" />

        {/* Layer 5: Mouse-chase teal glow (brand accent) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovering ? 0.8 : 0.2,
            background: `radial-gradient(
              circle ${isHovering ? '180px' : '120px'} at ${mousePos.x}% ${mousePos.y}%,
              rgba(106, 171, 142, ${isHovering ? 0.2 : 0.08}) 0%,
              rgba(212, 160, 64, ${isHovering ? 0.06 : 0.02}) 50%,
              transparent 100%
            )`,
            mixBlendMode: 'screen',
          }}
        />

        {/* Rotating outer glow halo */}
        <span
          aria-hidden="true"
          className="absolute -inset-12 sm:-inset-16 hello-ring-glow pointer-events-none"
        />

        {/* Breathing ring border */}
        <span
          aria-hidden="true"
          className="absolute -inset-3 sm:-inset-4 rounded-full border border-success/20 hello-ring-breathe pointer-events-none"
        />

        {/* The word */}
        <span className="relative z-10 font-serif text-5xl sm:text-6xl md:text-7xl text-foreground tracking-tight hello-text-breathe">
          Listen.
        </span>

        {/* Hint text */}
        <span className="relative z-10 block mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted hello-hint-pulse text-center">
          Parallax has something to show you
        </span>
      </button>
    </div>
  )
}
