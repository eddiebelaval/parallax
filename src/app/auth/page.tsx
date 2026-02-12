'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUp, signIn, signInWithGoogle, signInWithMagicLink } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [authMode, setAuthMode] = useState<'default' | 'magic' | 'password'>('default')
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Surface OAuth errors from callback redirect
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'oauth_failed') {
      setError('Google sign-in failed. Please try again or use email.')
    } else if (urlError === 'no_code') {
      setError('Authentication interrupted. Please try again.')
    }
  }, [searchParams])

  // Redirect already-authenticated users
  useEffect(() => {
    if (authLoading || !user) return
    supabase
      .from('user_profiles')
      .select('interview_completed')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        router.replace(data?.interview_completed ? '/home' : '/interview')
      })
  }, [user, authLoading, router])

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await signInWithMagicLink(email)
      setSuccess('Check your email — we sent you a sign-in link.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        router.push('/interview')
      } else {
        const { user: signedIn } = await signIn(email, password)
        if (signedIn) {
          const { data } = await supabase
            .from('user_profiles')
            .select('interview_completed')
            .eq('user_id', signedIn.id)
            .single()
          router.push(data?.interview_completed ? '/home' : '/interview')
        } else {
          router.push('/interview')
        }
      }
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

        {error && (
          <div className="text-[var(--temp-hot)] text-sm font-mono bg-[var(--temp-hot)]/10 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="text-[var(--temp-cool)] text-sm font-mono bg-[var(--temp-cool)]/10 rounded-lg px-4 py-3 mb-6">
            {success}
          </div>
        )}

        {/* Google OAuth — Primary (one click) */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-accent text-[var(--ember-dark)] font-mono text-sm uppercase tracking-widest py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'Working...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-muted font-mono text-[10px] uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Magic Link — Secondary (no password, just email) */}
        {authMode === 'default' && (
          <div className="space-y-3">
            <form onSubmit={handleMagicLink} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-[var(--surface)] border border-border rounded-lg px-4 py-3 text-foreground font-sans text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="your@email.com"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="px-5 py-3 border border-accent text-accent font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-accent hover:text-[var(--ember-dark)] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? '...' : 'Send link'}
              </button>
            </form>
            <p className="text-muted text-xs font-mono text-center">
              No password needed — we email you a sign-in link
            </p>
          </div>
        )}

        {/* Email + Password — Tertiary (hidden by default) */}
        {authMode === 'password' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--surface)] border border-accent text-accent font-mono text-sm uppercase tracking-widest py-3 rounded-lg hover:bg-accent hover:text-[var(--ember-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Working...' : isSignUp ? 'Create Profile' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Mode switchers */}
        <div className="text-center mt-6 space-y-2">
          {authMode === 'default' && (
            <button
              onClick={() => { setAuthMode('password'); setError(null); setSuccess(null) }}
              className="text-muted text-xs font-mono hover:text-foreground transition-colors"
            >
              Use email + password instead
            </button>
          )}
          {authMode === 'password' && (
            <>
              <button
                onClick={() => { setAuthMode('default'); setError(null); setSuccess(null) }}
                className="text-muted text-xs font-mono hover:text-foreground transition-colors block mx-auto"
              >
                Use magic link instead (no password)
              </button>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                className="text-muted text-xs font-mono hover:text-foreground transition-colors block mx-auto"
              >
                {isSignUp ? 'Already have a profile? Sign in' : 'Need a profile? Create one'}
              </button>
            </>
          )}
        </div>

        <div className="mt-8 p-4 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ember-teal)" strokeWidth="1.5" className="mt-0.5 flex-shrink-0">
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div className="text-xs font-mono text-muted leading-relaxed">
              Your profile data is encrypted at rest and isolated by row-level security.
              Only you can access your raw data.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
          <div className="text-muted font-mono text-sm">Loading...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
