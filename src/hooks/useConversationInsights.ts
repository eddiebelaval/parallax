'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SoloMemory } from '@/types/database'

/**
 * Extracts sidebar insights from a conversation via Haiku.
 * Reuses the same extraction pipeline as solo mode.
 * Runs after every new message -- insights accumulate over time.
 *
 * When focusSender is provided, only that person's messages (plus mediator
 * messages for context) are sent for extraction. The prompt focuses on
 * the specified sender's patterns, themes, and values.
 */
export function useConversationInsights(
  messages: Array<{ sender: string; content: string }>,
  focusSender?: string,
): { insights: SoloMemory | null; loading: boolean } {
  const [insights, setInsights] = useState<SoloMemory | null>(null)
  const [loading, setLoading] = useState(false)
  const lastCount = useRef(0)
  const insightsRef = useRef<SoloMemory | null>(null)

  const focusedMessages = useMemo(() => {
    if (!focusSender) return messages
    return messages.filter(
      (m) => m.sender === focusSender || m.sender === 'mediator',
    )
  }, [messages, focusSender])

  useEffect(() => {
    if (focusedMessages.length < 2 || focusedMessages.length === lastCount.current) return
    lastCount.current = focusedMessages.length

    setLoading(true)

    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: focusedMessages.map((m) => ({ sender: m.sender, content: m.content })),
        existing_memory: insightsRef.current,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.insights) {
          insightsRef.current = data.insights
          setInsights(data.insights)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [focusedMessages]) // eslint-disable-line react-hooks/exhaustive-deps

  return { insights, loading }
}
