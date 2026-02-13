import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getServerUser } from '@/lib/auth/server-auth'
import { getUserData } from '@/lib/data/user-profile'
import { TheDoor } from '@/components/landing/TheDoor'
import { SessionHistory } from '@/components/home/SessionHistory'
import { ProfileSummary } from '@/components/home/ProfileSummary'
import { SessionHistorySkeleton } from '@/components/home/SessionHistorySkeleton'
import { ProfileSummarySkeleton } from '@/components/home/ProfileSummarySkeleton'

/**
 * Home Page - Server Component
 *
 * Converted from client component to server component for:
 * - Server-side auth check with redirect
 * - Parallel data fetching at the server level
 * - Automatic caching and deduplication via React cache()
 * - Streaming with Suspense boundaries
 */

export default async function HomePage() {
  // Server-side auth check
  const user = await getServerUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch all user data in parallel (cached via React cache())
  const { profile, signals, sessions } = await getUserData(user.id)

  const displayName = profile?.display_name ?? user.email ?? 'there'

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

      {/* Session History with Suspense */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Session History
          </span>
        </div>
        <Suspense fallback={<SessionHistorySkeleton />}>
          <SessionHistory sessions={sessions} userId={user.id} />
        </Suspense>
      </div>

      {/* Profile Summary with Suspense */}
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
    </div>
  )
}
