'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useInterview } from '@/hooks/useInterview'
import { supabase } from '@/lib/supabase'
import { TOTAL_PHASES, getPhaseConfig } from '@/lib/interview-prompts'
import type { InterviewPhase } from '@/types/database'

export default function InterviewPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // undefined = not yet fetched, null = no name, string = has name
  const [displayName, setDisplayName] = useState<string | null | undefined>(undefined)

  // Fetch display_name from user_profiles
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? null)
      })
  }, [user])

  const {
    phase,
    messages,
    isLoading,
    isComplete,
    signalsExtracted,
    sendMessage,
    startInterview,
  } = useInterview({
    userId: user?.id ?? '',
    contextMode: undefined,
    displayName,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [authLoading, user, router])

  // Auto-start interview once user and displayName are resolved
  useEffect(() => {
    if (user && displayName !== undefined && messages.length === 0) {
      startInterview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, displayName])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input after AI response
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  if (authLoading || displayName === undefined) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted font-mono text-sm">Loading...</div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[var(--ember-teal)]/20 border border-[var(--ember-teal)]/40 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ember-teal)" strokeWidth="1.5">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-foreground tracking-tight mb-4">
            Profile Complete
          </h1>
          <p className="text-muted font-mono text-sm mb-2">
            {signalsExtracted} behavioral signals extracted
          </p>
          <p className="text-[var(--ember-text)] text-sm mb-8">
            Parallax now understands your communication patterns, conflict style, and values.
            This intelligence will enhance every mediation session you join.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/home')}
              className="border border-border rounded-lg px-6 py-3 text-sm font-mono text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => router.push('/home')}
              className="bg-accent text-[var(--ember-dark)] rounded-lg px-6 py-3 text-sm font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col max-w-2xl mx-auto">
      {/* Phase Indicator */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            Phase {phase} of {TOTAL_PHASES}
          </span>
          <span className="font-mono text-xs text-accent">
            {getPhaseConfig(phase as Exclude<InterviewPhase, 0>).name}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((p) => {
            let barColor = 'bg-border'
            if (p < phase) barColor = 'bg-[var(--ember-teal)]'
            else if (p === phase) barColor = 'bg-accent'

            return (
              <div
                key={p}
                className={`h-1 rounded-full flex-1 transition-colors duration-500 ${barColor}`}
              />
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                msg.role === 'user'
                  ? 'bg-accent/15 border border-accent/20 text-foreground'
                  : 'bg-[var(--surface)] border border-border text-[var(--ember-text)]'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--ember-teal)]" />
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                    Parallax
                  </span>
                </div>
              )}
              <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface)] border border-border rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--ember-teal)] animate-pulse" />
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  Parallax is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={isLoading}
            className="flex-1 bg-[var(--surface)] border border-border rounded-xl px-4 py-3 text-foreground font-sans text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-accent text-[var(--ember-dark)] rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Send
          </button>
        </form>
        {signalsExtracted > 0 && (
          <div className="mt-2 text-center">
            <span className="font-mono text-[10px] text-[var(--ember-teal)] uppercase tracking-widest">
              {signalsExtracted} signal{signalsExtracted !== 1 ? 's' : ''} captured
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
