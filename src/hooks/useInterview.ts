'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { InterviewPhase } from '@/types/database'

interface InterviewMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UseInterviewOptions {
  userId: string
  contextMode?: string
  displayName?: string | null
}

export function useInterview({ userId, contextMode, displayName }: UseInterviewOptions) {
  const [phase, setPhase] = useState<InterviewPhase>(1)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [signalsExtracted, setSignalsExtracted] = useState(0)
  const [isResuming, setIsResuming] = useState(false)
  const resumeChecked = useRef(false)

  // Check for existing interview progress on mount (resume capability)
  useEffect(() => {
    if (!userId || resumeChecked.current) return
    resumeChecked.current = true

    setIsResuming(true)
    fetch(`/api/interview?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          setIsComplete(true)
          setPhase(4)
        } else if (data.messages?.length > 0) {
          // Resume from saved progress
          setPhase(data.phase as InterviewPhase)
          setMessages(data.messages)
        }
      })
      .catch(() => {})
      .finally(() => setIsResuming(false))
  }, [userId])

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading || isComplete) return

    const userMessage: InterviewMessage = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          phase,
          message: content,
          conversation_history: messages,
          context_mode: contextMode,
          display_name: displayName,
        }),
      })

      if (!response.ok) {
        throw new Error('Interview API error')
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])

      if (data.signals_extracted > 0) {
        setSignalsExtracted((prev) => prev + data.signals_extracted)
      }

      if (data.interview_complete) {
        setIsComplete(true)
      } else if (data.phase_complete && data.next_phase) {
        setPhase(data.next_phase as InterviewPhase)
        // Reset conversation history for new phase (context carried via DB)
        setMessages([{ role: 'assistant', content: data.response }])
      }
    } catch (err) {
      console.error('Interview error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [userId, phase, messages, isLoading, isComplete, contextMode, displayName])

  const startInterview = useCallback(async () => {
    // If we already have messages (resumed), don't restart
    if (messages.length > 0) return

    setPhase(1)
    setMessages([])
    setIsLoading(true)
    setIsComplete(false)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          phase: 1,
          message: 'Hello, I\'d like to start my profile interview.',
          conversation_history: [],
          context_mode: contextMode,
          display_name: displayName,
        }),
      })

      if (!response.ok) throw new Error('Failed to start interview')

      const data = await response.json()
      setMessages([{ role: 'assistant', content: data.response }])
    } catch (err) {
      console.error('Failed to start interview:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, contextMode, displayName, messages.length])

  return {
    phase,
    messages,
    isLoading,
    isComplete,
    isResuming,
    signalsExtracted,
    sendMessage,
    startInterview,
  }
}
