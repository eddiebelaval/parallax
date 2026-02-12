'use client'

import { useRouter } from 'next/navigation'
import type { UserProfile, BehavioralSignal } from '@/types/database'

const SIGNAL_LABELS: Record<string, string> = {
  attachment_style: 'Attachment Style',
  conflict_mode: 'Conflict Mode',
  gottman_risk: 'Gottman Patterns',
  regulation_pattern: 'Emotional Regulation',
  scarf_sensitivity: 'SCARF Sensitivity',
  drama_triangle: 'Drama Triangle',
  values: 'Core Values',
  cbt_patterns: 'Cognitive Patterns',
  narrative_themes: 'Narrative Themes',
}

function primaryValue(signal: BehavioralSignal): string {
  const val = signal.signal_value as Record<string, unknown>
  switch (signal.signal_type) {
    case 'attachment_style':
      return String(val.primary ?? 'Unknown')
    case 'conflict_mode':
      return String(val.primary ?? 'Unknown')
    case 'gottman_risk': {
      const horsemen = val.horsemen as string[] | undefined
      return horsemen?.length ? horsemen.join(', ') : 'None detected'
    }
    case 'regulation_pattern':
      return String(val.style ?? 'Unknown')
    case 'values': {
      const core = val.core as string[] | undefined
      return core?.slice(0, 3).join(', ') ?? 'Unknown'
    }
    default:
      return JSON.stringify(val).slice(0, 40)
  }
}

interface ProfileSummaryProps {
  profile: UserProfile | null
  signals: BehavioralSignal[]
}

export function ProfileSummary({ profile, signals }: ProfileSummaryProps) {
  const router = useRouter()
  const topSignals = signals.slice(0, 3)

  return (
    <div className="bg-[var(--surface)] border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-foreground text-sm font-sans">
            {profile?.display_name ?? 'Your Profile'}
          </p>
          {profile?.interview_completed ? (
            <span className="flex items-center gap-1.5 text-[var(--ember-teal)] text-xs font-mono mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interview complete
            </span>
          ) : (
            <button
              onClick={() => router.push('/interview')}
              className="text-accent text-xs font-mono mt-1 hover:underline"
            >
              Complete your interview
            </button>
          )}
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="font-mono text-[10px] text-muted uppercase tracking-widest hover:text-foreground transition-colors"
        >
          View Full Profile
        </button>
      </div>

      {topSignals.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border">
          {topSignals.map((signal) => (
            <div key={signal.id} className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                {SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type}
              </span>
              <span className="text-foreground text-sm capitalize">
                {primaryValue(signal)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
