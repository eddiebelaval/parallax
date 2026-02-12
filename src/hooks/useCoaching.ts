'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CoachingMessage } from '@/types/database'

export function useCoaching(sessionId: string | undefined, person: 'person_a' | 'person_b') {
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing coaching history on mount
  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/coach?session_id=${sessionId}&person=${person}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages)
        }
      })
      .catch(() => {
        // Coaching history fetch is non-critical
      })
  }, [sessionId, person])

  // Send new coaching message
  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || loading) return
    setLoading(true)
    setError(null)

    // Optimistic insert for user message
    const userMsg: CoachingMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      person,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, person, message: content }),
      })

      if (!res.ok) {
        setError('Coaching unavailable -- try again')
        setLoading(false)
        return
      }

      const data = await res.json()
      const assistantMsg: CoachingMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        person,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setError('Connection lost -- coaching skipped')
    } finally {
      setLoading(false)
    }
  }, [sessionId, person, loading])

  return { messages, isOpen, setIsOpen, loading, error, sendMessage }
}
