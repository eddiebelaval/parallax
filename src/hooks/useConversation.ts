'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  ConversationalMode,
  ConversationMessage,
  ConverseRequest,
  ConverseResponse,
  ToolResult,
} from '@/types/conversation'

interface UseConversationOptions {
  onToolResults?: (results: ToolResult[]) => void
}

export function useConversation(mode: ConversationalMode, options?: UseConversationOptions) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null)

      const userMessage: ConversationMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      let currentMessages: ConversationMessage[] = []
      setMessages((prev) => {
        currentMessages = prev
        return [...prev, userMessage]
      })

      setIsLoading(true)

      try {
        const body: ConverseRequest = {
          mode,
          message: content,
          history: currentMessages,
        }

        // Pass auth token for profile tools (best-effort)
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const res = await fetch('/api/converse', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Request failed' }))
          setError(data.error || `Request failed (${res.status})`)
          return
        }

        const data: ConverseResponse = await res.json()

        // Apply tool results if the Guide executed any tools
        if (data.toolResults && options?.onToolResults) {
          options.onToolResults(data.toolResults)
        }

        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
          toolResults: data.toolResults,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      } finally {
        setIsLoading(false)
      }
    },
    [mode, options],
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearConversation }
}
