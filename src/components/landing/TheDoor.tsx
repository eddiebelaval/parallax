'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isValidRoomCode } from '@/lib/room-code'
import { ContextModePicker } from '@/components/ContextModePicker'
import { ModeCardScene } from '@/components/landing/ModeCardScene'
import { useAuth } from '@/hooks/useAuth'
import type { SessionMode, ContextMode } from '@/types/database'

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

export function TheDoor() {
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
    <div className="relative px-6 py-24 sm:py-32">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 50%, rgba(106, 171, 142, 0.04) 0%, transparent 70%),
              radial-gradient(ellipse 50% 30% at 20% 80%, rgba(212, 160, 64, 0.03) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Choose Your Experience
            </p>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
            Three ways to enter<br />
            <span className="text-accent">the conversation underneath</span>
          </h2>
          <p className="text-lg text-ember-400 max-w-2xl mx-auto leading-relaxed">
            Same room or different cities. Just you or both of you.<br />
            Parallax adapts to how you need to talk.
          </p>
        </div>

        {/* Mode selection cards */}
        <div className="grid grid-cols-1 gap-5 max-w-xl mx-auto mb-16">
          {/* In-Person Mode */}
          <button
            onClick={() => handleModeSelect('in_person')}
            disabled={creating !== null || soloLoading}
            className="group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/40 via-accent/20 to-accent/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Orb scene */}
                <div className="sm:w-48 h-36 sm:h-auto flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border overflow-hidden">
                  <ModeCardScene type="inperson" height={144} />
                </div>

                {/* Text content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <h3 className="font-mono text-sm sm:text-base uppercase tracking-wider text-accent">
                      {creating === 'in_person' ? 'Creating...' : 'In-Person'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Same device, shared screen
                  </p>
                  <p className="text-ember-500 text-xs leading-relaxed mb-4">
                    AI conductor guides the conversation with turn-based flow. X-Ray scoreboard tracks issues live.
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-accent transition-colors">
                    Begin Session &rarr;
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Remote Mode */}
          <button
            onClick={() => handleModeSelect('remote')}
            disabled={creating !== null || soloLoading}
            className="group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-success/40 via-success/20 to-success/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Orb scene */}
                <div className="sm:w-48 h-36 sm:h-auto flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border overflow-hidden">
                  <ModeCardScene type="remote" height={144} />
                </div>

                {/* Text content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <h3 className="font-mono text-sm sm:text-base uppercase tracking-wider text-success">
                      {creating === 'remote' ? 'Creating...' : 'Remote'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Different devices, connected experience
                  </p>
                  <p className="text-ember-500 text-xs leading-relaxed mb-4">
                    Share a room code. Each person gets their own panel with NVC analysis on every message.
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-success transition-colors">
                    Begin Session &rarr;
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Solo Mode */}
          <button
            onClick={handleSoloStart}
            disabled={creating !== null || soloLoading}
            className="group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-success/40 via-success/20 to-success/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Orb scene */}
                <div className="sm:w-48 h-36 sm:h-auto flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border overflow-hidden">
                  <ModeCardScene type="solo" height={144} />
                </div>

                {/* Text content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <h3 className="font-mono text-sm sm:text-base uppercase tracking-wider text-success">
                      {soloLoading ? 'Creating...' : 'Solo'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Just you and Ava
                  </p>
                  <p className="text-ember-500 text-xs leading-relaxed mb-4">
                    1:1 conversation that learns your style and becomes your advocate in future sessions.
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-success transition-colors">
                    Begin Session &rarr;
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
