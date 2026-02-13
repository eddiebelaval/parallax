'use client'

import { Suspense } from 'react'
import { TheDoor } from '@/components/landing/TheDoor'
import { SessionHistory } from '@/components/home/SessionHistory'
import { ProfileSummary } from '@/components/home/ProfileSummary'
import { SessionHistorySkeleton } from '@/components/home/SessionHistorySkeleton'
import { ProfileSummarySkeleton } from '@/components/home/ProfileSummarySkeleton'
import { ProfileSetupCTA } from '@/components/home/ProfileSetupCTA'
import { ParallaxFAB } from '@/components/home/ParallaxFAB'
import type { UserProfile, BehavioralSignal, Session } from '@/types/database'

interface HomeContentProps {
  displayName: string
  userId: string
  profile: UserProfile | null
  signals: BehavioralSignal[]
  sessions: Session[]
}

/**
 * HomeContent — Client wrapper for the home page.
 *
 * Receives server-fetched data as props and assembles the home page UI:
 * - Welcome header
 * - ProfileSetupCTA (if no signals)
 * - TheDoor (quick start)
 * - Session history
 * - Profile summary
 * - ParallaxFAB (always visible)
 */
export function HomeContent({ displayName, userId, profile, signals, sessions }: HomeContentProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
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

      {/* Profile Setup CTA — shows only when profile is incomplete */}
      <div className="mb-8">
        <ProfileSetupCTA signalCount={signals.length} />
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
        <Suspense fallback={<SessionHistorySkeleton />}>
          <SessionHistory sessions={sessions} userId={userId} />
        </Suspense>
      </div>

      {/* Profile Summary */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Your Intelligence Profile
          </span>
        </div>
        <Suspense fallback={<ProfileSummarySkeleton />}>
          <ProfileSummary profile={profile} signals={signals} />
        </Suspense>
      </div>

      {/* Parallax Guide FAB */}
      <ParallaxFAB />
    </div>
  )
}
