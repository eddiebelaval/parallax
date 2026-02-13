'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { useAutoListen } from '@/hooks/useAutoListen'
import { useParallaxVoice } from '@/hooks/useParallaxVoice'
import { AudioWaveformOrb } from '@/components/AudioWaveformOrb'
import type { ConversationMessage } from '@/types/conversation'

type InputMode = 'hands-free' | 'type'

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>('hands-free')
  const [textInput, setTextInput] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Conversation hook — guide mode, no tool results handling
  const { messages, isLoading, error, sendMessage, clearConversation } = useConversation('guide')

  // TTS for assistant responses
  const { speak, isSpeaking, cancel, waveform, energy } = useParallaxVoice()

  // Voice input — only active when expanded + hands-free mode
  const handleTranscript = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage(text.trim())
      }
    },
    [sendMessage],
  )

  const {
    isListening,
    interimText,
    isSpeechActive,
    silenceCountdown,
    isSupported: isVoiceSupported,
  } = useAutoListen({
    enabled: isOpen && inputMode === 'hands-free',
    isTTSPlaying: isSpeaking,
    onTranscript: handleTranscript,
    silenceTimeoutMs: 2000,
  })

  // Speak assistant responses via TTS
  const lastSpokenIndexRef = useRef(-1)
  useEffect(() => {
    if (messages.length === 0) {
      lastSpokenIndexRef.current = -1
      return
    }
    const lastIndex = messages.length - 1
    const lastMsg = messages[lastIndex]
    if (lastMsg.role === 'assistant' && lastIndex > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastIndex
      speak(lastMsg.content)
    }
  }, [messages, speak])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus text input when switching to type mode
  useEffect(() => {
    if (isOpen && inputMode === 'type') {
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, inputMode])

  function handleOpen() {
    setIsOpen(true)
  }

  function handleClose() {
    cancel()
    clearConversation()
    setTextInput('')
    setIsOpen(false)
  }

  async function handleTextSend() {
    const trimmed = textInput.trim()
    if (!trimmed || isLoading) return
    setTextInput('')
    await sendMessage(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed FAB — anchored in place */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--temp-cool)',
            boxShadow: '0 4px 16px rgba(106, 171, 142, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(106, 171, 142, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(106, 171, 142, 0.2)'
          }}
          aria-label="Ask Parallax for help"
        >
          <span className="font-mono text-lg font-semibold" style={{ color: 'var(--ember-dark)' }}>
            ?
          </span>
        </button>
      )}

      {/* Expanded panel — grows from the FAB position */}
      {isOpen && (
        <div
          className="flex flex-col bg-background border border-border rounded-lg overflow-hidden"
          style={{
            width: '360px',
            maxHeight: '480px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transformOrigin: 'bottom right',
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <AudioWaveformOrb
              name="Parallax"
              role="claude"
              waveform={waveform}
              energy={energy}
              active={isSpeaking}
              size={32}
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Help
              </p>
              <h2 className="font-mono text-sm tracking-wider text-temp-cool">
                Ask Parallax
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Close help panel"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div
                className="w-2 h-2 rounded-full mb-4"
                style={{ backgroundColor: 'var(--temp-cool)' }}
              />
              <p className="text-muted text-xs font-mono uppercase tracking-wider mb-2">
                Guide Mode
              </p>
              <p className="text-ember-500 text-xs leading-relaxed">
                Ask me anything about Parallax — how features work, what to do
                next, or just say hi.
              </p>
            </div>
          )}

          {messages.map((msg: ConversationMessage, i: number) => (
            <div
              key={`${msg.role}-${msg.timestamp}-${i}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-2 h-2 rounded-full mt-2 mr-2 flex-shrink-0"
                  style={{ backgroundColor: 'var(--temp-cool)' }}
                />
              )}
              <div className="max-w-[85%]">
                <div
                  className={`px-3 py-2 rounded text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[var(--ember-elevated)] text-foreground'
                      : 'bg-surface text-ember-300'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="w-2 h-2 rounded-full mt-2 mr-2 flex-shrink-0 animate-pulse"
                style={{ backgroundColor: 'var(--temp-cool)' }}
              />
              <div className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--temp-cool)' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--temp-cool)', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--temp-cool)', animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="px-3 py-2">
              <p className="text-accent text-xs font-mono">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          {/* Hands-free status */}
          {inputMode === 'hands-free' && (
            <div className="mb-2">
              {isListening && interimText && (
                <p className="text-xs text-foreground/70 mb-1 truncate">
                  {interimText}
                </p>
              )}
              <div className="flex items-center gap-2">
                {isListening ? (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSpeechActive ? 'animate-pulse' : ''
                      }`}
                      style={{ backgroundColor: 'var(--temp-cool)' }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {isSpeaking
                        ? 'Speaking...'
                        : isSpeechActive
                          ? 'Listening...'
                          : silenceCountdown > 0
                            ? `Sending in ${silenceCountdown}s`
                            : 'Listening...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-muted" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {!isVoiceSupported ? 'Voice not supported' : 'Mic paused'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Text input (type mode) */}
          {inputMode === 'type' && (
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Parallax..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-ember-600 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleTextSend}
                disabled={isLoading || !textInput.trim()}
                className="px-2 py-2 text-temp-cool hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 1.5l13 6.5-13 6.5V9l8-1-8-1V1.5z" />
                </svg>
              </button>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setInputMode(inputMode === 'hands-free' ? 'type' : 'hands-free')}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
            >
              {inputMode === 'hands-free' ? (
                <>
                  {/* Keyboard icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
                  </svg>
                  <span>Switch to typing</span>
                </>
              ) : (
                <>
                  {/* Mic icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                  <span>Switch to hands-free</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
