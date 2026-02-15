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

  // Send a message (optimistic insert so MessageCard mounts before analysis)
  const sendMessage = useCallback(async (sender: MessageSender, content: string) => {
    if (!sessionId) return null

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, sender, content }),
    })

    if (!res.ok) return null
    const msg = await res.json() as Message

    // Add to state immediately so the card renders without analysis.
    // This ensures useMelt starts at "idle" and can animate the
    // dissolve→crystallize transition when analysis arrives later.
    // The Realtime INSERT handler's duplicate check (line 57) prevents doubles.
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })

    return msg
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
  // INSERT events (e.g., after conductor API calls insert mediator messages).
  // Merges new data into existing state so that MessageCard instances are
  // updated in-place rather than replaced. This preserves useMelt's ref
  // state so the dissolve→crystallize animation can fire when analysis
  // transitions from null to present.
  const refreshMessages = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages((prev) => {
        const prevMap = new Map(prev.map((m) => [m.id, m]))
        return (data as Message[]).map((fresh) => {
          const existing = prevMap.get(fresh.id)
          // Keep existing object reference if nothing meaningful changed
          // (same nvc_analysis presence) to avoid unnecessary re-renders.
          // Update when analysis arrives or other fields change.
          if (existing && JSON.stringify(existing) === JSON.stringify(fresh)) {
            return existing
          }
          return fresh
        })
      })
    }
  }, [sessionId])

  const currentTurn = getCurrentTurn(messages)

  return { messages, loading, sendMessage, currentTurn, refreshMessages }
}
