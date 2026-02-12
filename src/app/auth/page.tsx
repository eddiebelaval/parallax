'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/auth'

export default function AuthPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, name || undefined)
      } else {
        await signIn(email, password)
      }
      router.push('/interview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-foreground tracking-tight">
            {isSignUp ? 'Create Your Profile' : 'Welcome Back'}
          </h1>
          <p className="text-muted font-mono text-xs tracking-widest uppercase mt-3">
            {isSignUp
              ? 'Your profile is private, encrypted, and yours alone'
              : 'Sign in to access your intelligence profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--surface)] border border-border rounded-lg px-4 py-3 text-foreground font-sans placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="How should Parallax address you?"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--surface)] border border-border rounded-lg px-4 py-3 text-foreground font-sans placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[var(--surface)] border border-border rounded-lg px-4 py-3 text-foreground font-sans placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="text-[var(--temp-hot)] text-sm font-mono bg-[var(--temp-hot)]/10 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-[var(--ember-dark)] font-mono text-sm uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Working...' : isSignUp ? 'Create Profile' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="text-muted text-sm font-mono hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Already have a profile? Sign in' : 'Need a profile? Create one'}
          </button>
        </div>

        {isSignUp && (
          <div className="mt-8 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ember-teal)" strokeWidth="1.5" className="mt-0.5 flex-shrink-0">
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="text-xs font-mono text-muted leading-relaxed">
                Your profile data is encrypted at rest and isolated by row-level security.
                Only you can access your raw data. Anonymous behavioral signals are shared
                only with your explicit consent, per session.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
