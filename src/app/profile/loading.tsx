export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Intelligence Profile
          </span>
        </div>
        <div className="h-9 w-72 bg-[var(--ember-heading)]/20 rounded animate-pulse mb-3" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-[var(--ember-teal)]/30 rounded animate-pulse" />
          <div className="h-4 w-24 bg-[var(--ember-muted)] rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--surface)] border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-28 bg-[var(--ember-muted)] rounded animate-pulse" />
              <div className="h-3 w-20 bg-accent/30 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[var(--ember-heading)]/20 rounded animate-pulse" />
              <div className="h-3 w-48 bg-[var(--ember-muted)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <div className="h-10 w-32 border border-border rounded-lg animate-pulse" />
        <div className="h-10 w-28 border border-border rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
