'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Issue } from '@/types/database'

export function useIssues(sessionId: string | undefined) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch existing issues on mount
  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchIssues() {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('session_id', sessionId!)
        .order('position', { ascending: true })

      if (!cancelled) {
        if (!error && data) {
          setIssues(data as Issue[])
        }
        setLoading(false)
      }
    }

    fetchIssues()
    return () => { cancelled = true }
  }, [sessionId])

  // Subscribe to issue changes via Realtime
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`issues-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newIssue = payload.new as Issue
          setIssues((prev) => {
            if (prev.some((i) => i.id === newIssue.id)) return prev
            return [...prev, newIssue]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'issues',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as Issue
          setIssues((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Derived: split issues by person
  const personAIssues = issues.filter((i) => i.raised_by === 'person_a')
  const personBIssues = issues.filter((i) => i.raised_by === 'person_b')

  return { issues, personAIssues, personBIssues, loading }
}
