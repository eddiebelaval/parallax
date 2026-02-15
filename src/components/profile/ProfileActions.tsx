'use client'

import { useRouter } from 'next/navigation'

export function ProfileActions() {
  const router = useRouter()

  return (
    <div className="mt-10 flex gap-3">
      <button
        onClick={() => router.push('/interview')}
        className="border border-border rounded-lg px-5 py-2.5 text-xs font-mono text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        Retake Interview
      </button>
      <button
        onClick={() => router.push('/home')}
        className="border border-border rounded-lg px-5 py-2.5 text-xs font-mono text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        Start Session
      </button>
    </div>
  )
}
