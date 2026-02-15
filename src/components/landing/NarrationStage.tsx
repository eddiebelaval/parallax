'use client'

import { useRef, useEffect } from 'react'
import { AvaOrb } from '@/components/AvaOrb'

interface NarrationStageProps {
  text: string
  isTyping: boolean
  isSpeaking: boolean
  energy: number
  isMuted: boolean
  onSkip: () => void
  onToggleMute: () => void
}

export function NarrationStage({
  text,
  isTyping,
  isSpeaking,
  energy,
  isMuted,
  onSkip,
  onToggleMute,
}: NarrationStageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as text grows (teleprompter effect)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [text])

  return (
    <div className="flex flex-col items-center w-full">
      {/* Global Parallax orb — floats above the pill, half sticking out */}
      <div className="-mt-12 mb-1">
        <AvaOrb
          size={72}
          energy={energy}
          isSpeaking={isSpeaking}
          particles={isSpeaking}
        />
      </div>

      {/* Teleprompter text — 2 lines, scrolling with fade */}
      <div className="teleprompter w-full">
        <div ref={scrollRef} className="teleprompter__inner">
          <p className="font-serif text-base sm:text-lg leading-[1.6] text-foreground/90 text-center">
            {text}
            {isTyping && (
              <span className="typewriter-cursor inline-block w-[2px] h-[1.1em] bg-accent ml-0.5 align-text-bottom" />
            )}
          </p>
        </div>
      </div>

      {/* Compact controls */}
      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={onToggleMute}
          className="font-mono text-[9px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={onSkip}
          className="font-mono text-[9px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
