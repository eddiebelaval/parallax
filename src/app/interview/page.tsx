'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useInterview } from '@/hooks/useInterview'
import { useParallaxVoice } from '@/hooks/useParallaxVoice'
import { useTypewriter } from '@/hooks/useTypewriter'
import { supabase } from '@/lib/supabase'
import { TOTAL_PHASES, getPhaseConfig } from '@/lib/interview-prompts'
import { ParallaxPresence } from '@/components/inperson/ParallaxPresence'
import { ActiveSpeakerBar } from '@/components/inperson/ActiveSpeakerBar'
import type { InterviewPhase } from '@/types/database'

export default function InterviewPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastAssistantRef = useRef<string | null>(null)
  const prevPhaseRef = useRef<InterviewPhase>(1)
  const [phaseTransitioning, setPhaseTransitioning] = useState(false)

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
    displayName,
  })

  const voice = useParallaxVoice()
  const typewriter = useTypewriter()

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

  // Detect new assistant messages → fire typewriter + TTS
  const lastAssistantMsg = messages.findLast(m => m.role === 'assistant')
  const lastAssistantKey = lastAssistantMsg
    ? `${messages.length}-${lastAssistantMsg.content}`
    : null

  useEffect(() => {
    if (lastAssistantMsg && lastAssistantKey !== lastAssistantRef.current) {
      lastAssistantRef.current = lastAssistantKey
      typewriter.start(lastAssistantMsg.content)
      voice.speak(lastAssistantMsg.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistantKey])

  // Cancel on phase change with smooth transition
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      voice.cancel()
      typewriter.reset()
      lastAssistantRef.current = null
      setPhaseTransitioning(true)
      const timer = setTimeout(() => setPhaseTransitioning(false), 150)
      prevPhaseRef.current = phase
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Cancel on unmount
  useEffect(() => {
    return () => {
      voice.cancel()
      typewriter.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typewriter.displayedText])

  const handleSend = useCallback((content: string) => {
    if (!content.trim() || isLoading) return
    typewriter.reset()
    voice.cancel()
    lastAssistantRef.current = null
    sendMessage(content.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, sendMessage])

  if (authLoading || displayName === undefined) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted font-mono text-sm">Loading...</div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-6">
        <ParallaxPresence
          isAnalyzing={false}
          isSpeaking={voice.isSpeaking}
          voiceWaveform={voice.waveform}
          voiceEnergy={voice.energy}
        />
        <div className="text-center max-w-md mt-6">
          <h1 className="font-serif text-3xl text-foreground tracking-tight mb-4">
            Profile Complete
          </h1>
          <p className="font-mono text-[10px] text-temp-cool uppercase tracking-widest mb-2">
            {signalsExtracted} behavioral signal{signalsExtracted !== 1 ? 's' : ''} extracted
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

  const isBusy = isLoading || typewriter.isTyping || voice.isSpeaking

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col max-w-2xl mx-auto">
      {/* Phase Indicator */}
      <div className="px-6 py-3 border-b border-border">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          Phase {phase} of {TOTAL_PHASES}
        </span>
        <span className="font-mono text-[10px] text-accent uppercase tracking-widest ml-2">
          {getPhaseConfig(phase as Exclude<InterviewPhase, 0>).name}
        </span>
      </div>

      {/* Parallax Orb */}
      <ParallaxPresence
        isAnalyzing={isLoading}
        isSpeaking={voice.isSpeaking}
        voiceWaveform={voice.waveform}
        voiceEnergy={voice.energy}
      />

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-5 transition-opacity duration-150"
        style={{ opacity: phaseTransitioning ? 0 : 1 }}
      >
        {messages.map((msg, i) => {
          const isLastAssistant =
            msg.role === 'assistant' &&
            i === messages.length - 1 &&
            msg.content === lastAssistantRef.current
          const displayContent =
            isLastAssistant && typewriter.isTyping
              ? typewriter.displayedText
              : msg.content
          const glowClass =
            msg.role === 'assistant' ? 'backlit backlit-cool' : 'backlit backlit-warm'

          return (
            <div key={i} className={`relative pl-4 py-3 ${glowClass}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  msg.role === 'assistant' ? 'bg-temp-cool' : 'bg-accent'
                }`} />
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  {msg.role === 'assistant' ? 'Parallax' : (displayName || 'You')}
                </span>
              </div>
              <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap text-[var(--ember-text)]">
                {displayContent}
                {isLastAssistant && typewriter.isTyping && (
                  <span
                    className="inline-block w-0.5 h-4 bg-temp-cool ml-0.5 align-middle"
                    style={{ animation: 'cursor-blink 0.8s infinite' }}
                  />
                )}
              </div>
            </div>
          )
        })}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="relative pl-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse" />
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                Parallax is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Signal Counter */}
      {signalsExtracted > 0 && (
        <div className="text-center py-2">
          <span className="font-mono text-[10px] text-temp-cool uppercase tracking-widest">
            {signalsExtracted} signal{signalsExtracted !== 1 ? 's' : ''} captured
          </span>
        </div>
      )}

      {/* Voice + Text Input */}
      <ActiveSpeakerBar
        activeSpeakerName={displayName || 'You'}
        onSend={handleSend}
        disabled={isBusy}
      />
    </div>
  )
}
