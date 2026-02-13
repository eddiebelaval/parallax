'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const ANON_ID_KEY = 'parallax-anon-id'
const ANON_NAME_KEY = 'parallax-anon-name'

/**
 * Get or create an anonymous user ID for hackathon mode.
 * Persists in localStorage across page refreshes.
 */
function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(ANON_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ANON_ID_KEY, id)
  }
  return id
}

/**
 * Build a minimal User-like object from the anonymous ID.
 * Has enough fields to satisfy components that read user.id,
 * user.email, and user.user_metadata.
 */
function buildAnonUser(id: string): User {
  const name = typeof window !== 'undefined' ? localStorage.getItem(ANON_NAME_KEY) : null
  return {
    id,
    email: undefined,
    user_metadata: {
      display_name: name,
      full_name: name,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      // Try to get existing session
      const { data: { user: existingUser } } = await supabase.auth.getUser()

      if (existingUser) {
        setUser(existingUser)
        setLoading(false)
        return
      }

      // No existing user — create anonymous session
      // This creates a real auth.users row so FK constraints are satisfied
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonData?.user && !anonError) {
        setUser(anonData.user)
      }
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

/**
 * Save a display name for the anonymous user.
 * Called from the interview when Parallax learns the user's name.
 */
export function setAnonDisplayName(name: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ANON_NAME_KEY, name)
}
