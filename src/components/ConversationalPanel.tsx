'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { useSettings } from '@/hooks/useSettings'
import type { ConversePanelProps, ToolResult } from '@/types/conversation'

function toolResultLabel(tr: ToolResult): string {
  if (tr.toolName === 'update_setting' && tr.success) {
    return `Updated ${typeof tr.input.key === 'string' ? tr.input.key : 'setting'}`
  }
  if (tr.toolName === 'get_settings') {
    return 'Read settings'
  }
  if (tr.toolName === 'navigate_to' && tr.success) {
    return `Navigating to ${typeof tr.input.page === 'string' ? tr.input.page : 'page'}`
  }
  if (tr.toolName === 'update_profile' && tr.success) {
    return `Updated profile ${typeof tr.input.field === 'string' ? tr.input.field : 'field'}`
  }
  if (tr.toolName === 'get_profile') {
    return 'Read profile'
  }
  return tr.toolName
}

interface ExtendedPanelProps extends ConversePanelProps {
  onToolResults?: (results: ToolResult[]) => void
}

export function ConversationalPanel({ mode, isOpen, onClose, onToolResults: externalOnToolResults }: ExtendedPanelProps) {
  const { applyToolResults } = useSettings()
  const options = useMemo(() => ({
    onToolResults: (results: ToolResult[]) => {
      applyToolResults(results)
      externalOnToolResults?.(results)
    },
  }), [applyToolResults, externalOnToolResults])
  const { messages, isLoading, error, sendMessage, clearConversation } = useConversation(
    mode,
    options,
  )
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    await sendMessage(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const title = mode === 'explorer' ? 'Talk to Ava' : 'Ava Guide'
  const titleColor = mode === 'explorer' ? 'text-accent' : 'text-success'

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[400px] max-w-full bg-background border-l border-border flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Conversational Layer
            </p>
            <h2 className={`font-mono text-sm tracking-wider ${titleColor}`}>{title}</h2>
          </div>
          <button
            onClick={() => {
              clearConversation()
              onClose()
            }}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-2 h-2 rounded-full bg-success mb-4" />
              <p className="text-muted text-xs font-mono uppercase tracking-wider mb-2">
                {mode === 'explorer' ? 'Explorer Mode' : 'Guide Mode'}
              </p>
              <p className="text-ember-500 text-xs leading-relaxed">
                {mode === 'explorer'
                  ? 'Ask about Parallax architecture, NVC analysis, the Ember design system, or anything about how this was built.'
                  : 'Ask how features work, get help with your session, or say things like "turn off temperature display" to change settings.'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${msg.timestamp}-${i}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-2 h-2 rounded-full bg-success mt-2 mr-2 flex-shrink-0" />
              )}
              <div className="max-w-[85%]">
                <div
                  className={`px-3 py-2 rounded ${
                    msg.role === 'user'
                      ? 'bg-[var(--ember-elevated)] text-foreground'
                      : 'bg-surface text-ember-300'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Tool execution indicator */}
                {msg.toolResults && msg.toolResults.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {msg.toolResults.map((tr, j) => (
                      <div
                        key={`${tr.toolName}-${j}`}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider ${
                          tr.success
                            ? 'bg-success/10 text-success'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tr.success ? 'bg-success' : 'bg-accent'
                          }`}
                        />
                        {toolResultLabel(tr)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-2 h-2 rounded-full bg-success mt-2 mr-2 flex-shrink-0 animate-pulse" />
              <div className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"
                    style={{ animationDelay: '300ms' }}
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
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'guide' ? 'Ask for help or change settings...' : 'Ask Ava...'}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-ember-600 focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 text-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5l13 6.5-13 6.5V9l8-1-8-1V1.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
