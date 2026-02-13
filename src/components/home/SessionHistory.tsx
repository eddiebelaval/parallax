'use client'

import { useRouter } from 'next/navigation'
import type { Session, SessionStatus } from '@/types/database'

const CONTEXT_LABELS: Record<string, string> = {
  intimate: 'Intimate',
  family: 'Family',
  professional_peer: 'Professional (Peer)',
  professional_hierarchical: 'Professional (Hierarchical)',
  transactional: 'Transactional',
  civil_structural: 'Civil / Structural',
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; glow: string }> = {
  waiting: {
    label: 'Waiting',
    color: 'bg-[var(--temp-warm)]',
    glow: 'shadow-[0_0_12px_rgba(212,160,64,0.25)]'
  },
  active: {
    label: 'Active',
    color: 'bg-[var(--temp-cool)]',
    glow: 'shadow-[0_0_12px_rgba(106,171,142,0.25)]'
  },
  completed: {
    label: 'Completed',
    color: 'bg-[var(--ember-muted)]',
    glow: ''
  },
}

const MODE_ICONS: Record<string, string> = {
  solo: '◐',
  in_person: '◈',
  remote: '◇',
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function participantLabel(
  session: Session,
  userId: string,
  slot: 'a' | 'b'
): string {
  const isUser =
    slot === 'a'
      ? session.person_a_user_id === userId
      : session.person_b_user_id === userId
  const name =
    slot === 'a' ? session.person_a_name : session.person_b_name

  if (isUser) return 'You'
  return name ?? (slot === 'a' ? 'Person A' : 'Person B')
}

interface SessionHistoryProps {
  sessions: Session[]
  userId: string
}

export function SessionHistory({ sessions, userId }: SessionHistoryProps) {
  const router = useRouter()

  if (sessions.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-[var(--ember-surface)] p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--glow-warm-ambient)] to-transparent opacity-30" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border">
            <span className="text-2xl text-muted">◈</span>
          </div>
          <p className="mb-2 font-mono text-sm tracking-wider text-muted">NO SESSIONS YET</p>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--ember-text)]">
            Start your first session above to begin resolving conflict with clarity and compassion.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => {
        const labelA = participantLabel(session, userId, 'a')
        const labelB = participantLabel(session, userId, 'b')
        const statusConfig = STATUS_CONFIG[session.status]
        const modeIcon = MODE_ICONS[session.mode] || '◇'

        return (
          <button
            key={session.id}
            onClick={() => router.push(`/session/${session.room_code}`)}
            className="group relative w-full overflow-hidden rounded-lg border border-border bg-[var(--ember-surface)] text-left transition-all duration-300 hover:border-[var(--ember-accent)] hover:bg-[var(--ember-elevated)] hover:shadow-lg"
            title={`View session from ${fullDate(session.created_at)}`}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--glow-warm-ambient)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-50" />

            {/* Content */}
            <div className="relative px-5 py-4">
              {/* Header row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${statusConfig.color} ${statusConfig.glow} transition-all duration-300 group-hover:scale-110`}
                      aria-label={statusConfig.label}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Room code badge */}
                  <div className="rounded bg-[var(--ember-dark)] px-2 py-0.5 font-mono text-xs tracking-wider text-[var(--ember-accent)] transition-colors duration-300 group-hover:bg-[var(--ember-surface)] group-hover:text-[var(--ember-heading)]">
                    {session.room_code}
                  </div>
                </div>

                {/* Timestamp */}
                <span className="font-mono text-[10px] text-muted transition-colors duration-300 group-hover:text-[var(--ember-text)]">
                  {relativeDate(session.created_at)}
                </span>
              </div>

              {/* Main content */}
              <div className="mb-2 flex items-center gap-3">
                {/* Mode icon */}
                <span className="text-lg text-[var(--ember-accent)] transition-all duration-300 group-hover:scale-110 group-hover:text-[var(--ember-heading)]">
                  {modeIcon}
                </span>

                {/* Participants */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--ember-heading)] transition-colors duration-300 group-hover:text-foreground">
                    {session.mode === 'solo' ? 'You & Parallax' : `${labelA} & ${labelB}`}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {CONTEXT_LABELS[session.context_mode] ?? session.context_mode}
                  </p>
                </div>

                {/* Arrow indicator */}
                <svg
                  className="h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--ember-accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Bottom metadata */}
              <div className="flex items-center gap-2 border-t border-border/50 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-[var(--ember-dark)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                  <span aria-hidden="true">{modeIcon}</span>
                  {session.mode === 'solo' ? 'Solo' : session.mode === 'in_person' ? 'In-Person' : 'Remote'}
                </span>

                {/* Session number indicator */}
                <span className="ml-auto font-mono text-[9px] text-muted/50">
                  #{sessions.length - index}
                </span>
              </div>
            </div>

            {/* Backlit effect for active sessions */}
            {session.status === 'active' && (
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--temp-cool)] to-transparent opacity-50 blur-sm" />
            )}
          </button>
        )
      })}
    </div>
  )
}
