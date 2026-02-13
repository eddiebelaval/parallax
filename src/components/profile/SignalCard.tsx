'use client'

import type { BehavioralSignal } from '@/types/database'

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

function renderValue(signal: BehavioralSignal): React.ReactNode {
  const val = signal.signal_value as Record<string, unknown>

  switch (signal.signal_type) {
    case 'attachment_style':
      return (
        <div className="space-y-1">
          <div className="text-foreground text-sm capitalize">{String(val.primary)}</div>
          {val.secondary != null && <div className="text-muted text-xs">Secondary: {String(val.secondary)}</div>}
        </div>
      )
    case 'conflict_mode':
      return (
        <div className="space-y-1">
          <div className="text-foreground text-sm capitalize">{String(val.primary)}</div>
          <div className="text-muted text-xs">
            Assertiveness: {Number(val.assertiveness).toFixed(1)} / Cooperativeness: {Number(val.cooperativeness).toFixed(1)}
          </div>
        </div>
      )
    case 'gottman_risk': {
      const horsemen = val.horsemen as string[]
      return (
        <div className="space-y-1">
          {horsemen?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {horsemen.map((h) => (
                <span key={h} className="bg-[var(--temp-hot)]/10 text-[var(--temp-hot)] text-xs font-mono px-2 py-0.5 rounded capitalize">
                  {h}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[var(--ember-teal)] text-sm">No horsemen detected</div>
          )}
          <div className="text-muted text-xs">Repair capacity: {Number(val.repairCapacity).toFixed(1)}</div>
        </div>
      )
    }
    case 'regulation_pattern':
      return (
        <div className="space-y-1">
          <div className="text-foreground text-sm capitalize">{String(val.style)}</div>
          {val.floodingOnset != null && <div className="text-muted text-xs">Flooding onset: {String(val.floodingOnset)}</div>}
        </div>
      )
    case 'values': {
      const core = val.core as string[]
      return (
        <div className="flex flex-wrap gap-1.5">
          {core?.map((v) => (
            <span key={v} className="bg-[var(--ember-teal)]/10 text-[var(--ember-teal)] text-xs font-mono px-2 py-0.5 rounded">
              {v}
            </span>
          ))}
        </div>
      )
    }
    default:
      return <div className="text-muted text-xs font-mono">{JSON.stringify(val, null, 2)}</div>
  }
}

interface SignalCardProps {
  signal: BehavioralSignal
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <div className="bg-[var(--surface)] border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          {SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type}
        </span>
        <span className="font-mono text-[10px] text-accent">
          {(signal.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
      {renderValue(signal)}
    </div>
  )
}
