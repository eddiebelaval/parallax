'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Message, SoloMemory } from '@/types/database'

export interface SoloChatMessage {
  id: string
  sender: 'person_a' | 'mediator'
  content: string
  created_at: string
}

/** Keep existing array items in order, append only genuinely new ones. */
function appendNewStrings(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((s) => s.toLowerCase()))
  const added = incoming.filter((s) => !seen.has(s.toLowerCase()))
  return [...existing, ...added]
}

/** Same as appendNewStrings but keyed by object field. */
function appendNewByKey<T>(
  existing: T[],
  incoming: T[],
  key: keyof T,
): T[] {
  const seen = new Set(existing.map((item) => String(item[key]).toLowerCase()))
  const added = incoming.filter((item) => !seen.has(String(item[key]).toLowerCase()))
  return [...existing, ...added]
}

/**
 * Merge incoming insights into existing state.
 * Preserves existing items in place, only appends new ones.
 * Scalar fields (situation, emotion) update in place.
 */
function mergeInsights(existing: SoloMemory | null, incoming: SoloMemory): SoloMemory {
  if (!existing) return incoming

  return {
    identity: {
      name: incoming.identity?.name || existing.identity?.name || null,
      bio: incoming.identity?.bio || existing.identity?.bio || null,
      importantPeople: appendNewByKey(
        existing.identity?.importantPeople || [],
        incoming.identity?.importantPeople || [],
        'name',
      ),
    },
    themes: appendNewStrings(existing.themes, incoming.themes),
    patterns: appendNewStrings(existing.patterns, incoming.patterns),
    values: appendNewStrings(existing.values, incoming.values),
    strengths: appendNewStrings(existing.strengths, incoming.strengths),
    recentSessions: incoming.recentSessions || existing.recentSessions,
    currentSituation: incoming.currentSituation || existing.currentSituation,
    emotionalState: incoming.emotionalState || existing.emotionalState,
    actionItems: appendNewByKey(
      existing.actionItems,
      incoming.actionItems,
      'id',
    ),
    sessionCount: Math.max(existing.sessionCount || 0, incoming.sessionCount || 0),
    lastSeenAt: incoming.lastSeenAt || existing.lastSeenAt,
  }
}

export function useSoloChat(sessionId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<SoloChatMessage[]>([])
  const [insights, setInsights] = useState<SoloMemory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const greetingSentRef = useRef(false)

  // Fetch existing messages + insights on mount
  useEffect(() => {
    if (!sessionId) return
    const params = new URLSearchParams({ session_id: sessionId })
    if (userId) params.set('user_id', userId)

    fetch(`/api/solo?${params}`)
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
        if (data.insights) {
          // On mount, set directly (no merge needed — this is the baseline)
          setInsights(data.insights)
        }
      })
      .catch(() => {
        // Non-critical fetch failure
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }, [sessionId, userId])

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
      if (data.insights) {
        setInsights((prev) => mergeInsights(prev, data.insights))
      }
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
      if (data.insights) {
        setInsights((prev) => mergeInsights(prev, data.insights))
      }
    } catch {
      setError('Connection lost -- message not sent')
    } finally {
      setLoading(false)
    }
  }, [sessionId, userId, loading])

  return { messages, insights, loading, error, initialLoading, sendMessage, sendGreeting }
}
