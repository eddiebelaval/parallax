'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ConversationMessage } from '@/types/conversation'
import { AudioWaveformOrb } from '@/components/_deprecated/AudioWaveformOrb'
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser'

const SUGGESTION_CHIPS = [
  { label: 'How does the analysis work?', prompt: 'How does the NVC analysis work? Walk me through what happens when someone sends a message.' },
  { label: "What's under the hood?", prompt: "What's your technical architecture? What are you built with?" },
  { label: 'Who built this?', prompt: 'Tell me about who built you and why.' },
  { label: 'Tell me about the 14 lenses', prompt: 'What are the 14 analytical lenses you use and how do they work together?' },
]

const INTRO_PROMPT =
  'A hackathon judge or developer just clicked "Talk to Parallax." Start with "Hello!" and then warmly introduce yourself in 2-3 sentences. You are the CTO of this codebase — you know every architectural decision, every design choice, every line of code. Tell them what they can ask you about: the NVC analysis engine, the 14 analytical lenses, the Ember design system, the Melt animation, the voice pipeline, the real-time architecture, or anything else. Be confident and inviting. Do NOT use bullet points — speak naturally.'

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
  const mic = useAudioAnalyser()

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(timer)
  }, [])

  // Auto-introduce on mount — streams a greeting without showing a user message
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
        // Keep the last potentially incomplete line in the buffer
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

      // Finalize: move streaming text into messages array
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const visibleMessages = expanded ? messages : messages.slice(-4)

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Header with orbs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AudioWaveformOrb
            name="Parallax"
            role="claude"
            waveform={null}
            energy={isLoading || streamingText ? 0.3 : 0}
            active={isLoading || !!streamingText}
            size={32}
          />
          <AudioWaveformOrb
            name="You"
            role="a"
            waveform={mic.waveform}
            energy={mic.energy}
            active={mic.active}
            size={32}
          />
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Close chat"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>

      {/* Messages area */}
      <div
        className={`overflow-y-auto space-y-3 mb-4 transition-[max-height] duration-300 ${
          expanded ? 'max-h-[50vh]' : 'max-h-[30vh]'
        }`}
      >
        {/* Empty state removed — intro auto-streams on mount */}

        {/* Expand toggle */}
        {messages.length > 4 && !expanded && (
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
              <span className="w-1.5 h-1.5 rounded-full bg-ember-teal mt-2 mr-2 flex-shrink-0" />
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

        {/* Streaming text — renders incrementally as tokens arrive */}
        {streamingText && (
          <div className="flex justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-teal mt-2 mr-2 flex-shrink-0" />
            <div className="max-w-[85%] px-3 py-2 rounded text-sm leading-relaxed bg-surface/50 text-ember-300">
              <p className="whitespace-pre-wrap">
                {streamingText}
                <span className="typewriter-cursor inline-block w-[2px] h-[1em] bg-ember-teal ml-0.5 align-text-bottom" />
              </p>
            </div>
          </div>
        )}

        {/* Loading dots — only before streaming starts */}
        {isLoading && !streamingText && (
          <div className="flex justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-teal mt-2 mr-2 flex-shrink-0 animate-pulse" />
            <div className="flex items-center gap-1 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-ember-teal animate-pulse"
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

      {/* Suggestion chips — show after intro, before user sends first message */}
      {messages.length === 1 && messages[0].role === 'assistant' && !isLoading && !streamingText && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.prompt)}
              className="px-3 py-1.5 border border-border/50 text-ember-400 hover:text-foreground hover:border-ember-600 font-mono text-[10px] rounded transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Parallax..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-surface/50 border border-border/50 text-foreground text-sm rounded placeholder:text-muted focus:border-ember-teal/50 focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => (mic.active ? mic.stop() : mic.start())}
          className={`px-2 py-2 transition-colors ${
            mic.active
              ? 'text-accent hover:text-foreground'
              : mic.denied
                ? 'text-muted cursor-not-allowed opacity-40'
                : 'text-muted hover:text-foreground'
          }`}
          aria-label={mic.active ? 'Mute microphone' : 'Enable microphone'}
          disabled={mic.denied}
          title={mic.denied ? 'Microphone access denied' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1zM4 6.5a.5.5 0 0 0-1 0 5 5 0 0 0 4.5 4.975V13.5H6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H8.5v-2.025A5 5 0 0 0 13 6.5a.5.5 0 0 0-1 0 4 4 0 0 1-8 0z" />
            {!mic.active && (
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-2 py-2 text-ember-teal hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
