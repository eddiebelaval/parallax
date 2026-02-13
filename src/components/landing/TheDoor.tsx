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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* In-Person Mode */}
          <button
            onClick={() => handleModeSelect('in_person')}
            disabled={creating !== null || soloLoading}
            className="group relative text-left overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/40 via-accent/20 to-accent/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden h-full flex flex-col">
              {/* Visual header */}
              <div className="relative h-40 bg-gradient-to-br from-accent/10 to-accent/5 border-b border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Stylized icon */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-accent/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-2 border-accent/60 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-accent/80 group-hover:bg-accent transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-accent/30 group-hover:bg-accent/50 transition-colors" />
                <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent/40 transition-colors" />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <h3 className="font-mono text-lg uppercase tracking-wider text-accent">
                      {creating === 'in_person' ? 'Creating...' : 'In-Person'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Same device, shared screen
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    'AI Conductor guides the conversation',
                    'Single shared view — no split screen',
                    'X-Ray Scoreboard tracks issues live',
                    'Turn-based flow with adaptive timing',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                      <span className="text-ember-500 text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-accent transition-colors">
                    Begin session
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Remote Mode */}
          <button
            onClick={() => handleModeSelect('remote')}
            disabled={creating !== null || soloLoading}
            className="group relative text-left overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-success/40 via-success/20 to-success/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden h-full flex flex-col">
              {/* Visual header */}
              <div className="relative h-40 bg-gradient-to-br from-success/10 to-success/5 border-b border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  {/* Two connected orbs */}
                  <div className="w-12 h-12 rounded-full border-2 border-success/60 bg-success/20 group-hover:bg-success/30 transition-colors" />
                  <div className="h-px w-8 bg-success/40 group-hover:bg-success/60 transition-colors" />
                  <div className="w-12 h-12 rounded-full border-2 border-success/60 bg-success/20 group-hover:bg-success/30 transition-colors" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <h3 className="font-mono text-lg uppercase tracking-wider text-success">
                      {creating === 'remote' ? 'Creating...' : 'Remote'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Different devices, connected experience
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    'Share a 6-character room code',
                    'Each person has their own panel',
                    'NVC analysis on every message',
                    'Session summary when you\'re done',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      <span className="text-ember-500 text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-success transition-colors">
                    Begin session
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Solo Mode */}
          <button
            onClick={handleSoloStart}
            disabled={creating !== null || soloLoading}
            className="group relative text-left overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-success/40 via-success/20 to-success/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border border-border bg-surface/90 backdrop-blur-sm rounded-xl overflow-hidden h-full flex flex-col">
              {/* Visual header */}
              <div className="relative h-40 bg-gradient-to-br from-success/10 to-success/5 border-b border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Single glowing orb */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-success/60 bg-success/20 group-hover:bg-success/30 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-success/80 bg-success/40 group-hover:bg-success/50 transition-colors" />
                    </div>
                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-full border border-success/20 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <h3 className="font-mono text-lg uppercase tracking-wider text-success">
                      {soloLoading ? 'Creating...' : 'Solo'}
                    </h3>
                  </div>
                  <p className="text-ember-400 text-sm mb-3">
                    Just you and Parallax
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    '1:1 conversation — no second person needed',
                    'Parallax learns your communication style',
                    'Builds your profile for future sessions',
                    'Your advocate in two-person conversations',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      <span className="text-ember-500 text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 group-hover:text-success transition-colors">
                    Begin session
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Talk to Parallax divider */}
        {SHOW_EXPLORER && onTalkToParallax && (
          <>
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-muted font-mono text-xs uppercase tracking-[0.2em]">
                or just ask me anything
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="text-center">
              <button
                onClick={onTalkToParallax}
                className="group relative inline-flex items-center gap-3 px-10 py-5 border border-success text-success hover:bg-success/10 font-mono text-sm uppercase tracking-wider transition-all talk-to-parallax-glow"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-success group-hover:animate-pulse" />
                <span>Talk to Parallax</span>
                <span className="w-2.5 h-2.5 rounded-full bg-success group-hover:animate-pulse" />
              </button>
              <p className="text-ember-700 text-[10px] font-mono uppercase tracking-widest mt-4">
                Powered by Claude Opus 4.6
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
