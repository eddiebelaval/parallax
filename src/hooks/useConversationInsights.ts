'use client'

import { useState, useEffect, useRef } from 'react'
import type { SoloMemory } from '@/types/database'

/**
 * Extracts sidebar insights from any conversation via Haiku.
 * Reuses the same extraction pipeline as solo mode.
 * Runs after every new message — insights accumulate over time.
 */
export function useConversationInsights(
  messages: Array<{ sender: string; content: string }>,
) {
  const [insights, setInsights] = useState<SoloMemory | null>(null)
  const [loading, setLoading] = useState(false)
  const lastCount = useRef(0)
  const insightsRef = useRef<SoloMemory | null>(null)

  useEffect(() => {
    // Only re-extract when message count changes and we have at least 2 messages
    if (messages.length < 2 || messages.length === lastCount.current) return
    lastCount.current = messages.length

    setLoading(true)

    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({ sender: m.sender, content: m.content })),
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
  }, [messages])

  return { insights, loading }
}
