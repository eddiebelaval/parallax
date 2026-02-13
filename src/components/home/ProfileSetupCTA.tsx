'use client'

import Link from 'next/link'

/**
 * ProfileSetupCTA — Non-blocking card suggesting the user complete their profile.
 *
 * Shown on /home when the user's profile is incomplete (no interview signals).
 * This is a soft suggestion, not a gate. Users can dismiss or ignore it.
 */
export function ProfileSetupCTA({ signalCount }: { signalCount: number }) {
  if (signalCount > 0) return null

  return (
    <div className="relative overflow-hidden rounded-lg border border-success/30 bg-success/5 p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-success/10 to-transparent rounded-bl-full" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="font-mono text-[10px] text-success uppercase tracking-widest">
            Get More from Parallax
          </span>
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">
          Teach Parallax how you communicate
        </h3>
        <p className="text-sm text-muted leading-relaxed mb-4">
          A 10-minute conversational interview extracts your communication patterns —
          attachment style, conflict mode, emotional regulation — so Parallax can deliver
          sharper, more personalized analysis.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/interview"
            className="px-4 py-2 border border-success text-success font-mono text-xs uppercase tracking-widest rounded hover:bg-success/10 transition-colors"
          >
            Start Interview
          </Link>
          <span className="text-muted text-xs font-mono">or ask Parallax below</span>
        </div>
      </div>
    </div>
  )
}
