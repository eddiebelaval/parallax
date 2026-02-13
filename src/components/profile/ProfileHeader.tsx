'use client'

import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface ProfileHeaderProps {
  profile: UserProfile | null
  user: User
  signalsCount: number
}

/**
 * Client component for profile header (needs router for button).
 */
export function ProfileHeader({ profile, user, signalsCount }: ProfileHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          Intelligence Profile
        </span>
      </div>
      <h1 className="font-serif text-3xl text-foreground tracking-tight">
        {profile?.display_name ?? user.email ?? 'Your Profile'}
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
          {signalsCount} signal{signalsCount !== 1 ? 's' : ''} captured
        </span>
      </div>
    </div>
  )
}
