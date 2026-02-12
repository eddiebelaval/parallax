'use client'

interface NarrationControlsProps {
  isMuted: boolean
  onSkip: () => void
  onToggleMute: () => void
}

export function NarrationControls({ isMuted, onSkip, onToggleMute }: NarrationControlsProps) {
  return (
    <div className="flex justify-center gap-6 mt-6">
      <button
        onClick={onToggleMute}
        className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button
        onClick={onSkip}
        className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
      >
        Skip intro
      </button>
    </div>
  )
}
