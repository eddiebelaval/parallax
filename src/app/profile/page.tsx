import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth/server-auth'
import { getUserData } from '@/lib/data/user-profile'
import { SignalCard } from '@/components/profile/SignalCard'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileActions } from '@/components/profile/ProfileActions'
import { EmptySignalsState } from '@/components/profile/EmptySignalsState'

const EMPTY_USER_DATA = { profile: null, signals: [] } as const

export default async function ProfilePage() {
  const user = await getServerUser().catch(() => null)

  if (!user) {
    redirect('/auth')
  }

  const { profile, signals } = await getUserData(user.id).catch(() => EMPTY_USER_DATA)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <ProfileHeader profile={profile} user={user} signalsCount={signals.length} />

      {signals.length > 0 ? (
        <div className="space-y-3">
          {signals.map((signal) => (
            <Suspense key={signal.id} fallback={<SignalCardSkeleton />}>
              <SignalCard signal={signal} />
            </Suspense>
          ))}
        </div>
      ) : (
        <EmptySignalsState />
      )}

      <ProfileActions />
    </div>
  )
}

function SignalCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-28 bg-[var(--ember-muted)] rounded animate-pulse" />
        <div className="h-3 w-20 bg-accent/30 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-[var(--ember-heading)]/20 rounded animate-pulse" />
        <div className="h-3 w-48 bg-[var(--ember-muted)] rounded animate-pulse" />
      </div>
    </div>
  )
}
