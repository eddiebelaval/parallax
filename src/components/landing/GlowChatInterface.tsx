'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ConversationMessage } from '@/types/conversation'
import { AvaOrb } from '@/components/AvaOrb'

// Web Speech API types (Chrome webkit prefix)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

const SUGGESTION_CHIPS = [
  { label: 'The 14 Lenses', prompt: 'Tell me about the 14 analytical lenses — how do they work together and what makes them effective for conflict resolution?' },
  { label: 'The Melt Animation', prompt: 'Walk me through The Melt animation — how does it transform raw emotion into structured understanding?' },
  { label: 'Tech Stack & Architecture', prompt: 'Give me the full technical breakdown — Next.js, Supabase, Claude integration, real-time architecture, everything.' },
  { label: 'Design System', prompt: 'Explain the Ember design system — the temperature-reactive glows, the color theory, and how design encodes meaning.' },
]

const INTRO_PROMPT =
  'You are Ava, the voice of Parallax. A hackathon judge or developer just clicked "Under the Hood" on the landing page. Introduce yourself warmly: "Hello! I\'m Ava — the voice behind Parallax." Explain this is a space for judges and developers to explore what\'s under the hood. Give them a quick, broad-strokes tech breakdown: built with Next.js 16 and Supabase for real-time two-person conflict resolution, powered by Claude Opus for NVC mediation analysis with 14 analytical lenses, featuring the Ember design system with temperature-reactive glows, voice pipeline with real-time waveforms, and The Melt animation that transforms raw emotion into structured understanding. Then ask if they\'d like to dive deeper into any specific part — the architecture, the AI analysis engine, the design system, or anything else. Be warm, confident, and inviting. Speak naturally — no bullet points.'

interface GlowChatInterfaceProps {
  onClose: () => void
}

export function GlowChatInterface({ onClose }: GlowChatInterfaceProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<ConversationMessage[]>([])
  const introSentRef = useRef(false)

  // Voice input state
  const [micHot, setMicHot] = useState(false)
  const [voiceInterim, setVoiceInterim] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const finalTranscriptRef = useRef('')
  const handleSendRef = useRef<(text?: string) => void>(() => {})

  useEffect(() => {
    setVoiceSupported(isSpeechSupported())
  }, [])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        try { recognitionRef.current.abort() } catch {}
        recognitionRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(timer)
  }, [])

  // Auto-introduce on mount
  useEffect(() => {
    if (introSentRef.current) return
    introSentRef.current = true
    sendIntro()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isLoading])

  const sendStreaming = useCallback(async (content: string) => {
    setError(null)
    setIsLoading(true)
    setStreamingText('')

    const userMessage: ConversationMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => {
      const updated = [...prev, userMessage]
      historyRef.current = prev
      return updated
    })

    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explorer',
          message: content,
          history: historyRef.current,
          stream: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(data.error || `Request failed (${res.status})`)
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError('No response stream')
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()

          if (payload === '[DONE]') continue

          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) {
              setError(parsed.error)
              break
            }
            if (parsed.text) {
              accumulated += parsed.text
              setStreamingText(accumulated)
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      if (accumulated) {
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }

      setStreamingText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Stream an intro greeting — no user message shown
  async function sendIntro() {
    setIsLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explorer',
          message: INTRO_PROMPT,
          history: [],
          stream: true,
        }),
      })

      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              accumulated += parsed.text
              setStreamingText(accumulated)
            }
          } catch {
            // Skip
          }
        }
      }

      if (accumulated) {
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
      setStreamingText('')
    } catch {
      // Silently fail intro — user can still type
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    setInput('')
    await sendStreaming(content)
  }

  // Keep ref current for speech recognition callback
  useEffect(() => {
    handleSendRef.current = handleSend
  })

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // --- Voice: tap-to-talk with Web Speech API ---
  const startVoice = useCallback(() => {
    if (!isSpeechSupported()) return

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    finalTranscriptRef.current = ''
    setVoiceInterim('')

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcript
        } else {
          interimText += transcript
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText
      }

      setVoiceInterim(finalTranscriptRef.current + interimText)
    }

    recognition.onerror = () => {
      setMicHot(false)
      setVoiceInterim('')
      mic.stop()
    }

    recognition.onend = () => {
      setMicHot(false)
      const result = finalTranscriptRef.current.trim()
      if (result) {
        handleSendRef.current(result)
      }
      setVoiceInterim('')
      mic.stop()
    }

    recognitionRef.current = recognition
    recognition.start()
    setMicHot(true)
    mic.start()
  }, [mic])

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const toggleVoice = useCallback(() => {
    if (micHot) {
      stopVoice()
    } else {
      startVoice()
    }
  }, [micHot, startVoice, stopVoice])

  const visibleMessages = expanded ? messages : messages.slice(-6)

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
      {/* Ava's orb at top with glowing aura */}
      <div className="flex items-center justify-center mb-6 flex-shrink-0 relative">
        {/* Glowing aura behind orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-32 h-16 rounded-full blur-2xl transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(106, 171, 142, 0.4) 0%, rgba(106, 171, 142, 0.15) 40%, transparent 70%)',
              opacity: isLoading || streamingText ? 1 : 0.6,
            }}
          />
        </div>

        {/* Ava's orb */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <AvaOrb
            size={64}
            energy={isLoading || streamingText ? 0.5 : 0.1}
            isSpeaking={isLoading || !!streamingText}
            isAnalyzing={false}
            particles={true}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-success/80">
            Under the Hood
          </span>
        </div>

        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-7 h-7 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Close chat"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>

      {/* Messages area — fills available space */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {/* Expand toggle */}
        {messages.length > 6 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-center mb-2 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            View full conversation
          </button>
        )}

        {visibleMessages.map((msg, i) => (
          <div
            key={`${msg.role}-${msg.timestamp}-${i}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 mr-2 flex-shrink-0" />
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--ember-elevated)] text-foreground'
                  : 'bg-surface/50 text-ember-300'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Streaming text */}
        {streamingText && (
          <div className="flex justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 mr-2 flex-shrink-0" />
            <div className="max-w-[85%] px-3 py-2 rounded text-sm leading-relaxed bg-surface/50 text-ember-300">
              <p className="whitespace-pre-wrap">
                {streamingText}
                <span className="typewriter-cursor inline-block w-[2px] h-[1em] bg-success ml-0.5 align-text-bottom" />
              </p>
            </div>
          </div>
        )}

        {/* Loading dots */}
        {isLoading && !streamingText && (
          <div className="flex justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 mr-2 flex-shrink-0 animate-pulse" />
            <div className="flex items-center gap-1 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-accent text-xs font-mono text-center">{error}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 1 && messages[0].role === 'assistant' && !isLoading && !streamingText && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 flex-shrink-0">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.prompt)}
              className="px-3 py-1.5 border border-success/20 text-ember-400 hover:text-success hover:border-success/40 font-mono text-[10px] rounded transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Voice recording indicator */}
      {micHot && (
        <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-success">
            Listening — tap mic to send
          </span>
          {voiceInterim && (
            <span className="text-ember-400 text-xs truncate ml-2 flex-1">
              {voiceInterim}
            </span>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={micHot ? voiceInterim : input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={micHot ? 'Listening...' : 'Ask Parallax...'}
          disabled={isLoading || micHot}
          className={`flex-1 px-3 py-2.5 bg-surface/50 border text-foreground text-sm rounded placeholder:text-muted focus:outline-none transition-colors disabled:opacity-50 ${
            micHot
              ? 'border-success/50 talk-to-parallax-glow'
              : 'border-border/50 focus:border-success/50'
          }`}
        />
        {/* Voice mic button */}
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            disabled={isLoading}
            className={`relative px-2 py-2.5 rounded transition-all ${
              micHot
                ? 'text-success talk-to-parallax-glow'
                : 'text-muted hover:text-success'
            }`}
            aria-label={micHot ? 'Tap to send voice message' : 'Tap to talk'}
          >
            <div className="relative">
              {micHot && (
                <span className="absolute inset-[-6px] rounded-full border-2 border-success animate-ping opacity-30" />
              )}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1zM4 6.5a.5.5 0 0 0-1 0 5 5 0 0 0 4.5 4.975V13.5H6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H8.5v-2.025A5 5 0 0 0 13 6.5a.5.5 0 0 0-1 0 4 4 0 0 1-8 0z" />
              </svg>
            </div>
          </button>
        )}
        {/* Send button */}
        <button
          onClick={() => handleSend()}
          disabled={isLoading || (!input.trim() && !micHot)}
          className="px-2 py-2.5 text-success hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1.5l13 6.5-13 6.5V9l8-1-8-1V1.5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
