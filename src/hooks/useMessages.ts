'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Message, MessageSender } from '@/types/database'

export function useMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch existing messages on mount
  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId!)
        .order('created_at', { ascending: true })

      if (!cancelled) {
        if (!error && data) {
          setMessages(data as Message[])
        }
        setLoading(false)
      }
    }

    fetchMessages()
    return () => { cancelled = true }
  }, [sessionId])

  // Subscribe to new messages via Realtime
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Avoid duplicates (in case of race with optimistic insert)
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as Message
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Send a message
  const sendMessage = useCallback(async (sender: MessageSender, content: string) => {
    if (!sessionId) return null

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, sender, content }),
    })

    if (!res.ok) return null
    return await res.json() as Message
  }, [sessionId])

  // Determine whose turn it is (alternates between A/B, ignoring mediator messages)
  function getCurrentTurn(msgs: Message[]): MessageSender {
    const humanMessages = msgs.filter((m) => m.sender !== 'mediator')
    if (humanMessages.length === 0) return 'person_a'
    return humanMessages[humanMessages.length - 1].sender === 'person_a'
      ? 'person_b'
      : 'person_a'
  }

  // Re-fetch messages from the server — use when Realtime may not deliver
  // INSERT events (e.g., after conductor API calls insert mediator messages)
  const refreshMessages = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data as Message[])
    }
  }, [sessionId])

  const currentTurn = getCurrentTurn(messages)

  return { messages, loading, sendMessage, currentTurn, refreshMessages }
}
