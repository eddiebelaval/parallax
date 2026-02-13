'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Message } from '@/types/database'

export interface SoloChatMessage {
  id: string
  sender: 'person_a' | 'mediator'
  content: string
  created_at: string
}

export function useSoloChat(sessionId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<SoloChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const greetingSentRef = useRef(false)

  // Fetch existing messages on mount
  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/solo?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages.map((m: Message) => ({
            id: m.id,
            sender: m.sender as 'person_a' | 'mediator',
            content: m.content,
            created_at: m.created_at,
          })))
        }
      })
      .catch(() => {
        // Non-critical fetch failure
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }, [sessionId])

  // Send initial greeting (once per session)
  const sendGreeting = useCallback(async () => {
    if (!sessionId || greetingSentRef.current || loading) return
    greetingSentRef.current = true
    setLoading(true)

    try {
      const res = await fetch('/api/solo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, ...(userId ? { user_id: userId } : {}), trigger: 'greeting' }),
      })

      if (!res.ok) {
        setLoading(false)
        return
      }

      const data = await res.json()
      const greetingMsg: SoloChatMessage = {
        id: crypto.randomUUID(),
        sender: 'mediator',
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, greetingMsg])
    } catch {
      // Greeting failure is non-critical
    } finally {
      setLoading(false)
    }
  }, [sessionId, userId, loading])

  // Send a user message
  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || loading || !content.trim()) return
    setLoading(true)
    setError(null)

    // Optimistic insert
    const userMsg: SoloChatMessage = {
      id: crypto.randomUUID(),
      sender: 'person_a',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await fetch('/api/solo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, ...(userId ? { user_id: userId } : {}), message: content }),
      })

      if (!res.ok) {
        setError('Parallax is unavailable -- try again')
        setLoading(false)
        return
      }

      const data = await res.json()
      const assistantMsg: SoloChatMessage = {
        id: crypto.randomUUID(),
        sender: 'mediator',
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setError('Connection lost -- message not sent')
    } finally {
      setLoading(false)
    }
  }, [sessionId, userId, loading])

  return { messages, loading, error, initialLoading, sendMessage, sendGreeting }
}
