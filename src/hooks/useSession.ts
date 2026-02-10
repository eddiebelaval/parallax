'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/database'

export function useSession(roomCode: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch session on mount
  useEffect(() => {
    let cancelled = false

    async function fetchSession() {
      const res = await fetch(`/api/sessions/${roomCode}`)
      if (!res.ok) {
        if (!cancelled) {
          // Session doesn't exist yet — that's okay, we'll create it
          setLoading(false)
        }
        return
      }
      const data = await res.json()
      if (!cancelled) {
        setSession(data)
        setLoading(false)
      }
    }

    fetchSession()
    return () => { cancelled = true }
  }, [roomCode])

  // Subscribe to session changes via Realtime
  useEffect(() => {
    if (!session?.id) return

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession(payload.new as Session)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id])

  // Create a new session
  const createSession = useCallback(async (personAName?: string) => {
    setError(null)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_a_name: personAName }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create session')
      return null
    }
    const data = await res.json()
    setSession(data)
    return data as Session
  }, [])

  // Join a session as person A or B
  const joinSession = useCallback(async (name: string, side: 'a' | 'b') => {
    setError(null)
    const res = await fetch(`/api/sessions/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, side }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to join session')
      return null
    }
    const data = await res.json()
    setSession(data)
    return data as Session
  }, [roomCode])

  return { session, loading, error, createSession, joinSession }
}
