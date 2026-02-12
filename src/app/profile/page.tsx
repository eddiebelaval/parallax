'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
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

function SignalCard({ signal }: { signal: BehavioralSignal }) {
  const val = signal.signal_value as Record<string, unknown>

  function renderValue(): React.ReactNode {
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
      {renderValue()}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [signals, setSignals] = useState<BehavioralSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }
    if (!user) return

    async function loadProfile() {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      const { data: signalData } = await supabase
        .from('behavioral_signals')
        .select('*')
        .eq('user_id', user!.id)
        .order('signal_type')

      setProfile(profileData as UserProfile | null)
      setSignals((signalData ?? []) as BehavioralSignal[])
      setLoading(false)
    }

    loadProfile()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted font-mono text-sm">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Intelligence Profile
          </span>
        </div>
        <h1 className="font-serif text-3xl text-foreground tracking-tight">
          {profile?.display_name ?? user?.email ?? 'Your Profile'}
        </h1>
        <div className="flex items-center gap-4 mt-3">
          {profile?.interview_completed ? (
            <span className="flex items-center gap-1.5 text-[var(--ember-teal)] text-xs font-mono">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interview complete
            </span>
          ) : (
            <button
              onClick={() => router.push('/interview')}
              className="text-accent text-xs font-mono hover:underline"
            >
              Complete your interview
            </button>
          )}
          <span className="text-muted text-xs font-mono">
            {signals.length} signal{signals.length !== 1 ? 's' : ''} captured
          </span>
        </div>
      </div>

      {/* Signals */}
      {signals.length > 0 ? (
        <div className="space-y-3">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg">
          <p className="text-muted font-mono text-sm mb-4">No behavioral signals yet</p>
          <button
            onClick={() => router.push('/interview')}
            className="bg-accent text-[var(--ember-dark)] rounded-lg px-6 py-3 text-sm font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Start Interview
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 flex gap-3">
        <button
          onClick={() => router.push('/interview')}
          className="border border-border rounded-lg px-5 py-2.5 text-xs font-mono text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          Retake Interview
        </button>
        <button
          onClick={() => router.push('/home')}
          className="border border-border rounded-lg px-5 py-2.5 text-xs font-mono text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          Start Session
        </button>
      </div>
    </div>
  )
}
