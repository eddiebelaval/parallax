export function SessionHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-[var(--ember-surface)] px-5 py-4"
        >
          {/* Header row skeleton */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="h-2 w-2 rounded-full bg-[var(--ember-muted)] animate-pulse" />
              <div className="h-3 w-16 bg-[var(--ember-muted)] rounded animate-pulse" />
              {/* Room code */}
              <div className="h-5 w-20 bg-[var(--ember-dark)] rounded animate-pulse" />
            </div>
            {/* Timestamp */}
            <div className="h-3 w-12 bg-[var(--ember-muted)] rounded animate-pulse" />
          </div>

          {/* Main content skeleton */}
          <div className="mb-2 flex items-center gap-3">
            {/* Mode icon */}
            <div className="h-5 w-5 bg-[var(--ember-muted)] rounded-full animate-pulse" />
            {/* Participants */}
            <div className="flex-1">
              <div className="h-4 w-40 bg-[var(--ember-heading)]/20 rounded mb-1 animate-pulse" />
              <div className="h-3 w-32 bg-[var(--ember-muted)] rounded animate-pulse" />
            </div>
            {/* Arrow */}
            <div className="h-4 w-4 bg-[var(--ember-muted)] rounded animate-pulse" />
          </div>

          {/* Bottom metadata skeleton */}
          <div className="flex items-center gap-2 border-t border-border/50 pt-2">
            <div className="h-5 w-20 bg-[var(--ember-dark)] rounded animate-pulse" />
            <div className="ml-auto h-3 w-6 bg-[var(--ember-muted)] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
