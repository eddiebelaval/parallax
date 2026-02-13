export function ProfileSummarySkeleton() {
  return (
    <div className="bg-[var(--ember-surface)] border border-border rounded-lg p-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 w-32 bg-[var(--ember-heading)]/20 rounded mb-2 animate-pulse" />
          <div className="h-3 w-28 bg-[var(--ember-muted)] rounded animate-pulse" />
        </div>
        <div className="h-3 w-24 bg-[var(--ember-muted)] rounded animate-pulse" />
      </div>

      {/* Signals skeleton */}
      <div className="space-y-2 pt-3 border-t border-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-28 bg-[var(--ember-muted)] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[var(--ember-heading)]/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
