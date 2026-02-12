'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/database'

export function useUserSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`person_a_user_id.eq.${userId},person_b_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!cancelled) {
        if (!error && data) {
          setSessions(data as Session[])
        }
        setLoading(false)
      }
    }

    fetchSessions()
    return () => { cancelled = true }
  }, [userId])

  return { sessions, loading }
}
