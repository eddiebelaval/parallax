'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SoloMemory } from '@/types/database'

/**
 * Extracts sidebar insights from a conversation via Haiku.
 * Reuses the same extraction pipeline as solo mode.
 * Runs after every new message — insights accumulate over time.
 *
 * @param messages - Full conversation messages
 * @param focusSender - Optional: extract insights focused on this person's messages.
 *   The full conversation is still sent for context, but the extraction
 *   prompt focuses on the specified sender's patterns/themes/values.
 */
export function useConversationInsights(
  messages: Array<{ sender: string; content: string }>,
  focusSender?: string,
) {
  const [insights, setInsights] = useState<SoloMemory | null>(null)
  const [loading, setLoading] = useState(false)
  const lastCount = useRef(0)
  const insightsRef = useRef<SoloMemory | null>(null)

  // Stable key to prevent re-running when focusSender reference changes
  const senderKey = focusSender || '__all__'

  // Filter messages to focus on one person's contributions (but keep mediator for context)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedMessages, senderKey])

  return { insights, loading }
}
