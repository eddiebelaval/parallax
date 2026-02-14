'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useConversation } from '@/hooks/useConversation'
import { useParallaxVoice } from '@/hooks/useParallaxVoice'
import { useAutoListen } from '@/hooks/useAutoListen'
import type { ToolResult } from '@/types/conversation'

type AvaContext = 'landing' | 'general' | 'session'

interface AvaConciergeProps {
  isOpen: boolean
  onClose: () => void
  onReplayTour?: () => void
  onVoiceState: (energy: number, isSpeaking: boolean) => void
  context: AvaContext
}

const INTRO_PROMPTS: Record<AvaContext, string> = {
  landing:
    "The user tapped your pill on the landing page. Greet warmly in 1 sentence. You can help them navigate, start sessions, replay the tour, or answer questions. Keep it under 15 words.",
  general:
    "The user tapped your pill. Greet briefly. You can help navigate, change settings, or answer questions about Parallax. Keep it under 15 words.",
  session:
    "The user tapped your pill during a live session. Check in warmly - 'Everything going alright?' or similar. Be supportive and brief. They might want to vent, ask for help, or just need encouragement. Do NOT try to mediate - that's what the session is for. Keep it under 20 words.",
}

const ROUTE_MAP: Record<string, string> = {
  home: '/home',
  interview: '/interview',
  settings: '/settings',
  profile: '/profile',
}

export function AvaConcierge({ isOpen, onClose, onReplayTour, onVoiceState, context }: AvaConciergeProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [inputText, setInputText] = useState('')
  const hasGreetedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Tool result handler — navigate, replay tour, etc.
  const handleToolResults = useCallback(
    (results: ToolResult[]) => {
      for (const r of results) {
        if (r.toolName === 'navigate_to' && r.success) {
          const route = ROUTE_MAP[r.input.page as string]
          if (route) {
            onClose()
            setTimeout(() => router.push(route), 300)
          }
        }
        if (r.toolName === 'replay_tour' && r.success) {
          onClose()
          onReplayTour?.()
        }
      }
    },
    [router, onClose, onReplayTour],
  )

  // Hooks
  const conversation = useConversation('guide', { onToolResults: handleToolResults })
  const voice = useParallaxVoice()

  // Pipe voice state to parent for pill glow
  useEffect(() => {
    onVoiceState(voice.energy, voice.isSpeaking)
  }, [voice.energy, voice.isSpeaking, onVoiceState])

  // Auto-listen: mic input when TTS finishes
  const handleTranscript = useCallback(
    (text: string) => {
      conversation.sendMessage(text)
    },
    [conversation.sendMessage],
  )

  const autoListen = useAutoListen({
    enabled: isOpen && mode === 'voice' && !voice.isSpeaking && !conversation.isLoading,
    isTTSPlaying: voice.isSpeaking,
    onTranscript: handleTranscript,
    silenceTimeoutMs: 3000,
  })

  // Speak assistant responses via TTS
  const lastMessageRef = useRef<string | null>(null)
  useEffect(() => {
    const msgs = conversation.messages
    if (msgs.length === 0) return
    const last = msgs[msgs.length - 1]
    if (last.role === 'assistant' && last.content !== lastMessageRef.current) {
      lastMessageRef.current = last.content
      voice.speak(last.content)
    }
  }, [conversation.messages, voice.speak])

  // Greet on open
  useEffect(() => {
    if (isOpen && !hasGreetedRef.current) {
      hasGreetedRef.current = true
      conversation.sendMessage(INTRO_PROMPTS[context])
    }
  }, [isOpen, context, conversation.sendMessage])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      hasGreetedRef.current = false
      voice.cancel()
      conversation.clearConversation()
      lastMessageRef.current = null
      setInputText('')
      setMode('voice')
    }
  }, [isOpen, voice.cancel, conversation.clearConversation])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Focus text input when switching to text mode
  useEffect(() => {
    if (mode === 'text' && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [mode, isOpen])

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || conversation.isLoading) return
      setInputText('')
      voice.cancel()
      conversation.sendMessage(trimmed)
    },
    [conversation.sendMessage, conversation.isLoading, voice.cancel],
  )

  if (!isOpen) return null

  const latestAssistantMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.content

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mic-first concierge — floating below header orb */}
      <div className="ava-concierge z-50" role="dialog" aria-label="Ava concierge">
        {/* Close button */}
        <button
          onClick={onClose}
          className="ava-close-btn"
          aria-label="Close Ava"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Subtitle: Ava's spoken response as text */}
        {latestAssistantMessage && (
          <p className="ava-concierge__subtitle">
            {latestAssistantMessage}
          </p>
        )}
        {conversation.isLoading && !latestAssistantMessage && (
          <p className="ava-concierge__subtitle ava-concierge__subtitle--thinking">
            ...
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-2">
          {mode === 'voice' ? (
            <>
              {/* Mic button with waveform bars */}
              <button
                className={`ava-mic-btn ${autoListen.isSpeechActive ? 'ava-mic-btn--active' : ''}`}
                aria-label={autoListen.isSpeechActive ? 'Listening' : 'Microphone ready'}
              >
                <div className="ava-mic-bars">
                  <span /><span /><span /><span /><span />
                </div>
              </button>

              {/* Text mode toggle */}
              <button
                onClick={() => setMode('text')}
                className="ava-text-toggle"
                aria-label="Switch to text input"
              >
                T
              </button>
            </>
          ) : (
            <>
              {/* Compact text input */}
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit(inputText)
                  }}
                  placeholder="Type here..."
                  disabled={conversation.isLoading}
                  className="ava-text-input"
                />
                <button
                  onClick={() => handleSubmit(inputText)}
                  disabled={!inputText.trim() || conversation.isLoading}
                  className="ava-send-btn"
                >
                  &uarr;
                </button>
              </div>

              {/* Back to voice mode */}
              <button
                onClick={() => setMode('voice')}
                className="ava-text-toggle"
                aria-label="Switch to voice input"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Interim transcript preview */}
        {autoListen.interimText && (
          <p className="ava-concierge__interim">{autoListen.interimText}</p>
        )}
      </div>
    </>
  )
}
