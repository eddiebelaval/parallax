'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isValidRoomCode } from '@/lib/room-code'
import { ContextModePicker } from '@/components/ContextModePicker'
import { useAuth } from '@/hooks/useAuth'
import type { SessionMode, ContextMode } from '@/types/database'

const SHOW_EXPLORER = process.env.NEXT_PUBLIC_SHOW_EXPLORER !== 'false'

function ModeCard({
  title,
  description,
  features,
  onClick,
  loading,
  disabled,
  accent = 'orange',
}: {
  title: string
  description: string
  features: string[]
  onClick: () => void
  loading: boolean
  disabled: boolean
  accent?: 'orange' | 'teal'
}) {
  const topBorder = accent === 'orange' ? 'border-t-accent' : 'border-t-success'
  const hoverText = accent === 'orange' ? 'group-hover:text-accent' : 'group-hover:text-success'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group text-left border border-border border-t-2 ${topBorder} hover:border-ember-600 transition-colors disabled:opacity-60 flex flex-col`}
    >
      <div className="px-5 py-4 border-b border-border">
        <p className="font-mono text-sm uppercase tracking-wider text-foreground mb-1">
          {loading ? 'Creating...' : title}
        </p>
        <p className="text-muted text-sm">{description}</p>
      </div>
      <div className="px-5 py-3 flex-1">
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
              <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-5 py-3 border-t border-border">
        <span className={`font-mono text-[10px] uppercase tracking-widest text-ember-600 ${hoverText} transition-colors`}>
          Start session
        </span>
      </div>
    </button>
  )
}

interface TheDoorProps {
  onTalkToParallax?: () => void
}

export function TheDoor({ onTalkToParallax }: TheDoorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState<SessionMode | null>(null)
  const [pendingMode, setPendingMode] = useState<SessionMode | null>(null)
  const [remoteAction, setRemoteAction] = useState<'create' | 'join' | null>(null)
  const [soloLoading, setSoloLoading] = useState(false)

  function handleModeSelect(mode: SessionMode) {
    setPendingMode(mode)
    setError('')
  }

  async function handleSoloStart() {
    setSoloLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'solo', ...(user?.id ? { user_id: user.id } : {}) }),
      })
      if (!res.ok) {
        setError('Failed to create session')
        return
      }
      const session = await res.json()
      router.push(`/session/${session.room_code}`)
    } catch {
      setError('Failed to create session')
    } finally {
      setSoloLoading(false)
    }
  }

  async function handleContextSelect(contextMode: ContextMode) {
    if (!pendingMode) return
    setCreating(pendingMode)
    setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: pendingMode, context_mode: contextMode, ...(user?.id ? { user_id: user.id } : {}) }),
      })
      if (!res.ok) {
        setError('Failed to create session')
        return
      }
      const session = await res.json()
      if (typeof window !== 'undefined' && pendingMode === 'remote') {
        localStorage.setItem(`parallax-side-${session.room_code}`, 'a')
      }
      router.push(`/session/${session.room_code}`)
    } catch {
      setError('Failed to create session')
    } finally {
      setCreating(null)
    }
  }

  function handleJoin() {
    const trimmed = joinCode.trim().toUpperCase()
    if (!isValidRoomCode(trimmed)) {
      setError('Enter a valid 6-character room code')
      return
    }
    setError('')
    if (typeof window !== 'undefined') {
      localStorage.setItem(`parallax-side-${trimmed}`, 'b')
    }
    router.push(`/session/${trimmed}`)
  }

  // Remote: intermediate create/join choice
  if (pendingMode === 'remote' && remoteAction === null) {
    return (
      <div className="py-16 sm:py-24">
        <div className="max-w-md mx-auto px-6">
          <button
            onClick={() => { setPendingMode(null) }}
            className="flex items-center gap-2 text-muted hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors mb-8"
          >
            <span>&larr;</span> Back
          </button>

          <p className="section-indicator mb-6">Remote Session</p>

          <div className="space-y-4">
            <button
              onClick={() => setRemoteAction('create')}
              className="group w-full text-left border border-border border-t-2 border-t-success hover:border-ember-600 transition-colors"
            >
              <div className="px-5 py-4">
                <p className="font-mono text-sm uppercase tracking-wider text-foreground mb-1">
                  Create New Session
                </p>
                <p className="text-muted text-sm">Start a session and share the code with someone</p>
              </div>
              <div className="px-5 py-3 border-t border-border">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-success transition-colors">
                  You are Person A
                </span>
              </div>
            </button>

            <button
              onClick={() => setRemoteAction('join')}
              className="group w-full text-left border border-border border-t-2 border-t-accent hover:border-ember-600 transition-colors"
            >
              <div className="px-5 py-4">
                <p className="font-mono text-sm uppercase tracking-wider text-foreground mb-1">
                  Join Existing Session
                </p>
                <p className="text-muted text-sm">Enter a room code someone shared with you</p>
              </div>
              <div className="px-5 py-3 border-t border-border">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-accent transition-colors">
                  You are Person B
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Remote join: code input
  if (pendingMode === 'remote' && remoteAction === 'join') {
    return (
      <div className="py-16 sm:py-24">
        <div className="max-w-sm mx-auto px-6">
          <button
            onClick={() => setRemoteAction(null)}
            className="flex items-center gap-2 text-muted hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors mb-8"
          >
            <span>&larr;</span> Back
          </button>

          <p className="section-indicator mb-6">Join a Session</p>
          <p className="text-muted text-sm mb-6">Enter the 6-character room code shared with you</p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={6}
                autoFocus
                className="flex-1 px-4 py-4 bg-surface border border-border text-foreground font-mono text-sm tracking-widest text-center rounded placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors"
              />
              <button
                onClick={handleJoin}
                className="px-6 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-wider rounded hover:border-ember-600 transition-colors"
              >
                Join
              </button>
            </div>
            {error && (
              <p className="text-accent font-mono text-xs text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Context mode selection (in-person direct, or remote after choosing "create")
  if (pendingMode) {
    return (
      <div className="py-16 sm:py-24">
        <ContextModePicker
          sessionMode={pendingMode}
          onSelect={handleContextSelect}
          onBack={() => {
            if (pendingMode === 'remote') {
              setRemoteAction(null)
              setCreating(null)
            } else {
              setPendingMode(null)
              setCreating(null)
            }
          }}
          loading={creating !== null}
        />
        {error && (
          <p className="text-accent font-mono text-xs text-center mt-4">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="px-6 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto">

        {/* Path 1: Start a Session */}
        <p className="section-indicator mb-6">Start a Session</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <ModeCard
            title="In-Person"
            description="Same device, shared screen"
            features={[
              'Guided onboarding -- set names, context, goals',
              'Single shared view -- no split screen',
              'X-Ray Scoreboard tracks issues live',
              'Turn-based -- one person speaks at a time',
            ]}
            onClick={() => handleModeSelect('in_person')}
            loading={creating === 'in_person'}
            disabled={creating !== null || soloLoading}
            accent="orange"
          />
          <ModeCard
            title="Remote"
            description="Different devices, split screen"
            features={[
              'Share a 6-character room code',
              'Split-screen -- each person has their own panel',
              'NVC analysis on every message',
              'Session summary when you\'re done',
            ]}
            onClick={() => handleModeSelect('remote')}
            loading={creating === 'remote'}
            disabled={creating !== null || soloLoading}
            accent="teal"
          />
          <ModeCard
            title="Solo"
            description="Just you and Parallax"
            features={[
              '1:1 conversation -- no second person needed',
              'Parallax learns your communication style',
              'Builds your profile for future sessions',
              'Your advocate in two-person conversations',
            ]}
            onClick={handleSoloStart}
            loading={soloLoading}
            disabled={creating !== null || soloLoading}
            accent="teal"
          />
        </div>

        {/* Path 2: Talk to Parallax */}
        {SHOW_EXPLORER && onTalkToParallax && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted font-mono text-xs uppercase tracking-wider">
                if you have questions, ask me
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="text-center">
              <button
                onClick={onTalkToParallax}
                className="group inline-flex items-center gap-3 px-8 py-4 border border-success text-success hover:bg-success/10 font-mono text-sm uppercase tracking-wider transition-all talk-to-parallax-glow"
              >
                <span className="w-2 h-2 rounded-full bg-success group-hover:animate-pulse" />
                Talk to Parallax
              </button>
              <p className="text-ember-700 text-[10px] font-mono uppercase tracking-widest mt-3">
                Powered by Claude Opus 4.6
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
