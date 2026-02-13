export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="h-3 w-24 bg-surface rounded animate-pulse mb-4" />
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="h-3 w-32 bg-surface rounded animate-pulse mb-3" />
            <div className="h-10 w-full bg-surface rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
