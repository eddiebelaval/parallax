import { SessionHistorySkeleton } from '@/components/home/SessionHistorySkeleton'
import { ProfileSummarySkeleton } from '@/components/home/ProfileSummarySkeleton'

/**
 * Loading state for home page.
 * Shows while server component is fetching data.
 */
export default function HomeLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Your Home Base
          </span>
        </div>
        <div className="h-9 w-64 bg-[var(--ember-heading)]/20 rounded animate-pulse" />
      </div>

      {/* Quick Start placeholder */}
      <div className="mb-12 py-16">
        <div className="h-48 bg-[var(--ember-surface)] border border-border rounded-lg animate-pulse" />
      </div>

      {/* Session History skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Session History
          </span>
        </div>
        <SessionHistorySkeleton />
      </div>

      {/* Profile Summary skeleton */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Your Intelligence Profile
          </span>
        </div>
        <ProfileSummarySkeleton />
      </div>
    </div>
  )
}
