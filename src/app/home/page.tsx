'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserSessions } from '@/hooks/useUserSessions'
import { supabase } from '@/lib/supabase'
import { TheDoor } from '@/components/landing/TheDoor'
import { SessionHistory } from '@/components/home/SessionHistory'
import { ProfileSummary } from '@/components/home/ProfileSummary'
import type { UserProfile, BehavioralSignal } from '@/types/database'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { sessions, loading: sessionsLoading } = useUserSessions(user?.id)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [signals, setSignals] = useState<BehavioralSignal[]>([])
  const [loading, setLoading] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [authLoading, user, router])

  // Load profile + signals
  useEffect(() => {
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
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted font-mono text-sm">Loading...</div>
      </div>
    )
  }

  const displayName = profile?.display_name ?? user?.email ?? 'there'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Your Home Base
          </span>
        </div>
        <h1 className="font-serif text-3xl text-foreground tracking-tight">
          Welcome back, {displayName}
        </h1>
      </div>

      {/* Quick Start */}
      <div className="mb-12">
        <TheDoor />
      </div>

      {/* Session History */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Session History
          </span>
        </div>
        {sessionsLoading ? (
          <div className="text-muted font-mono text-sm">Loading sessions...</div>
        ) : (
          <SessionHistory sessions={sessions} userId={user!.id} />
        )}
      </div>

      {/* Profile Summary */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Your Intelligence Profile
          </span>
        </div>
        <ProfileSummary profile={profile} signals={signals} />
      </div>
    </div>
  )
}
