'use client'

import { useEffect } from 'react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Profile page error:', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--ember-surface)] border-2 border-accent flex items-center justify-center">
            <svg
              className="w-8 h-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-2xl text-foreground mb-4">
          Something went wrong
        </h1>

        <p className="text-muted text-sm mb-8 max-w-md mx-auto">
          {error.message === 'Authentication required'
            ? 'You need to be signed in to view your profile.'
            : 'We encountered an error loading your profile. Please try again.'}
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-[var(--ember-dark)] rounded-lg font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>

          {error.message === 'Authentication required' && (
            <a
              href="/auth"
              className="px-6 py-3 border border-border rounded-lg font-mono text-sm text-muted uppercase tracking-wider hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Sign In
            </a>
          )}
        </div>

        {error.digest && (
          <p className="mt-8 text-xs font-mono text-muted">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
