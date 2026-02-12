'use client'

import { AudioWaveformOrb } from '@/components/AudioWaveformOrb'

interface NarrationStageProps {
  text: string
  isTyping: boolean
  isSpeaking: boolean
  waveform: Float32Array | null
  energy: number
}

export function NarrationStage({ text, isTyping, isSpeaking, waveform, energy }: NarrationStageProps) {
  return (
    <div className="max-w-xl mx-auto text-center narration-enter">
      {/* Parallax voice orb — shows real waveform when speaking */}
      <div className="mb-6 flex justify-center">
        <AudioWaveformOrb
          name="Parallax"
          role="claude"
          waveform={waveform}
          energy={energy}
          active={isSpeaking}
          size={56}
        />
      </div>

      <p className="font-serif text-lg sm:text-xl md:text-2xl leading-relaxed text-foreground">
        {text}
        {isTyping && (
          <span className="typewriter-cursor inline-block w-[2px] h-[1.1em] bg-accent ml-0.5 align-text-bottom" />
        )}
      </p>
    </div>
  )
}
