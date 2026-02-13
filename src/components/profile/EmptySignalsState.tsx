'use client'

import { useRouter } from 'next/navigation'

export function EmptySignalsState() {
  const router = useRouter()

  return (
    <div className="text-center py-16 border border-border rounded-lg">
      <p className="text-muted font-mono text-sm mb-4">No behavioral signals yet</p>
      <button
        onClick={() => router.push('/interview')}
        className="bg-accent text-[var(--ember-dark)] rounded-lg px-6 py-3 text-sm font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
      >
        Start Interview
      </button>
    </div>
  )
}
