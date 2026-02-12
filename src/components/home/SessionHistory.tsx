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

const STATUS_COLORS: Record<SessionStatus, string> = {
  waiting: 'bg-[var(--glow-warm)]',
  active: 'bg-[var(--ember-teal,#6aab8e)]',
  completed: 'bg-[var(--ember-muted)]',
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
      <div className="text-center py-12 border border-border rounded-lg">
        <p className="text-muted font-mono text-sm mb-2">No sessions yet</p>
        <p className="text-[var(--ember-text)] text-xs">
          Start your first session above to begin resolving conflict with clarity.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const labelA = participantLabel(session, userId, 'a')
        const labelB = participantLabel(session, userId, 'b')

        return (
          <button
            key={session.id}
            onClick={() => router.push(`/session/${session.room_code}`)}
            className="w-full text-left bg-[var(--surface)] border border-border rounded-lg px-5 py-4 hover:border-foreground/20 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-wider text-foreground">
                  {session.room_code}
                </span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  {CONTEXT_LABELS[session.context_mode] ?? session.context_mode}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted">
                {relativeDate(session.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[session.status]}`} />
              <span className="text-[var(--ember-text)] text-sm">
                {labelA} & {labelB}
              </span>
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                {session.mode === 'in_person' ? 'In-Person' : 'Remote'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
