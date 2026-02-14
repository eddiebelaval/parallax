'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/database'

export function useSession(roomCode: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to Realtime AND fetch initial data in one effect.
  // Subscribing with room_code (known upfront) avoids the race where an
  // UPDATE fires between the initial fetch and the subscription setup.
  useEffect(() => {
    let cancelled = false

    const channel = supabase
      .channel(`session-room-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (!cancelled) {
            // Merge with existing state — Realtime payloads may omit columns
            // when REPLICA IDENTITY FULL is not set on the table
            setSession(prev => {
              if (!prev) return payload.new as Session
              return { ...prev, ...(payload.new as Partial<Session>) }
            })
          }
        }
      )
      .subscribe()

    async function fetchSession() {
      const res = await fetch(`/api/sessions/${roomCode}`)
      if (!res.ok) {
        if (!cancelled) setLoading(false)
        return
      }
      const data = await res.json()
      if (!cancelled) {
        setSession(data)
        setLoading(false)
      }
    }

    fetchSession()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  // Create a new session
  const createSession = useCallback(async (personAName?: string, userId?: string) => {
    setError(null)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_a_name: personAName, ...(userId ? { user_id: userId } : {}) }),
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
  const joinSession = useCallback(async (name: string, side: 'a' | 'b', userId?: string) => {
    setError(null)
    const res = await fetch(`/api/sessions/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, side, ...(userId ? { user_id: userId } : {}) }),
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

  // Re-fetch session from the server — use when Realtime may not deliver
  // (e.g., after conductor API calls that update onboarding_context)
  const refreshSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${roomCode}`)
    if (!res.ok) return null
    const data = await res.json()
    setSession(data)
    return data as Session
  }, [roomCode])

  return { session, loading, error, createSession, joinSession, refreshSession }
}
