'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useInterview } from '@/hooks/useInterview'
import { useParallaxVoice } from '@/hooks/useParallaxVoice'
import { useAutoListen } from '@/hooks/useAutoListen'
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

  // Hackathon: no auth walls — skip redirect
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/auth')
  //   }
  // }, [authLoading, user, router])

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
    ? `assistant-${lastAssistantMsg.content}`
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

  // Hands-free voice input
  const [handsFree, setHandsFree] = useState(true);
  const [muted, setMuted] = useState(false);
  const isBusy = isLoading || typewriter.isTyping || voice.isSpeaking;

  const autoListen = useAutoListen({
    enabled: handsFree && !muted && !isBusy,
    isTTSPlaying: voice.isSpeaking,
    onTranscript: handleSend,
    silenceTimeoutMs: 5000,
  });

  if (authLoading || displayName === undefined) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted font-mono text-sm">Loading...</div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Ambient celebration glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, var(--glow-cool-ambient) 0%, transparent 70%)',
            animation: 'ambient-breathe 4s ease-in-out infinite'
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Larger celebratory orb */}
          <div className="transform scale-125">
            <ParallaxPresence
              isAnalyzing={false}
              isSpeaking={voice.isSpeaking}
              voiceWaveform={voice.waveform}
              voiceEnergy={voice.energy}
            />
          </div>

          <div className="text-center max-w-xl mt-8 space-y-6">
            {/* Completion badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-temp-cool/10 border border-temp-cool/30">
              <svg
                className="w-4 h-4 text-temp-cool"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono text-[10px] text-temp-cool uppercase tracking-widest font-semibold">
                All phases complete
              </span>
            </div>

            <h1 className="font-serif text-4xl text-foreground tracking-tight leading-tight">
              Your Profile is Ready
            </h1>

            {/* Signal extraction summary */}
            <div className="inline-flex flex-col items-center gap-1 px-6 py-3 rounded-lg bg-surface/50 border border-border">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-mono text-lg text-accent font-semibold">
                  {signalsExtracted}
                </span>
                <span className="font-mono text-xs text-muted uppercase tracking-wider">
                  behavioral signals
                </span>
              </div>
              <span className="font-mono text-[9px] text-muted/70 uppercase tracking-widest">
                Extracted from {messages.filter(m => m.role === 'user').length} responses
              </span>
            </div>

            <p className="text-[var(--ember-text)] text-base leading-relaxed px-4">
              Parallax now understands your communication patterns, conflict style, and values.
              This intelligence will enhance every conversation and mediation session you join.
            </p>

            {/* What was captured */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-left">
              {[
                { label: 'Communication Style', icon: '💬' },
                { label: 'Conflict Patterns', icon: '⚡' },
                { label: 'Core Values', icon: '🎯' },
                { label: 'Stress Response', icon: '🧭' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-lg bg-surface/30 border border-border hover:border-accent/30 transition-all duration-200"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-mono text-xs text-muted uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-border/50">
              <button
                onClick={() => router.push('/home')}
                className="border border-border rounded-lg px-6 py-3 text-sm font-mono text-muted hover:text-foreground hover:border-accent/30 hover:bg-surface/50 transition-all duration-200"
              >
                View Full Profile
              </button>
              <button
                onClick={() => router.push('/home')}
                className="bg-accent text-[var(--ember-dark)] rounded-lg px-8 py-3 text-sm font-mono uppercase tracking-wider hover:shadow-[0_0_20px_var(--glow-warm)] transition-all duration-200 font-semibold"
              >
                Start a Session
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col max-w-3xl mx-auto">
      {/* Phase Journey Visualization */}
      <div className="px-8 py-6 border-b border-border bg-surface/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {Array.from({ length: TOTAL_PHASES }).map((_, i) => {
              const phaseNum = i + 1
              const isActive = phaseNum === phase
              const isComplete = phaseNum < phase

              return (
                <div key={phaseNum} className="flex items-center gap-2">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                    isComplete
                      ? 'bg-temp-cool/20 border border-temp-cool'
                      : isActive
                      ? 'bg-accent/20 border-2 border-accent shadow-[0_0_12px_var(--glow-warm)]'
                      : 'bg-surface border border-border'
                  }`}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-temp-cool" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`font-mono text-xs font-semibold ${
                        isActive ? 'text-accent' : 'text-muted'
                      }`}>
                        {phaseNum}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-30" />
                    )}
                  </div>
                  {i < TOTAL_PHASES - 1 && (
                    <div className={`w-12 h-0.5 transition-colors duration-500 ${
                      isComplete ? 'bg-temp-cool/30' : 'bg-border'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            Phase {phase}
          </span>
          <span className="font-serif text-lg text-foreground tracking-tight">
            {getPhaseConfig(phase as Exclude<InterviewPhase, 0>).name}
          </span>
          <span className="font-mono text-[10px] text-muted/70 uppercase tracking-widest ml-auto">
            {getPhaseConfig(phase as Exclude<InterviewPhase, 0>).duration}
          </span>
        </div>
      </div>

      {/* Parallax Orb - Larger, More Prominent */}
      <div className="py-8 flex-shrink-0">
        <ParallaxPresence
          isAnalyzing={isLoading}
          isSpeaking={voice.isSpeaking}
          voiceWaveform={voice.waveform}
          voiceEnergy={voice.energy}
        />
      </div>

      {/* Messages - More Generous Spacing */}
      <div
        className="flex-1 overflow-y-auto px-8 py-6 space-y-8 transition-opacity duration-150"
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
            <div
              key={i}
              className={`relative pl-5 py-4 rounded-r-lg transition-all duration-300 ${glowClass}`}
              style={{
                transform: i === messages.length - 1 ? 'scale(1)' : 'scale(0.98)',
                opacity: i === messages.length - 1 ? 1 : 0.85
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${
                  msg.role === 'assistant' ? 'bg-temp-cool' : 'bg-accent'
                }`} />
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  {msg.role === 'assistant' ? 'Parallax' : (displayName || 'You')}
                </span>
              </div>
              <div className="text-base font-sans leading-relaxed whitespace-pre-wrap text-[var(--ember-text)] max-w-2xl">
                {displayContent}
                {isLastAssistant && typewriter.isTyping && (
                  <span
                    className="inline-block w-0.5 h-5 bg-temp-cool ml-1 align-middle"
                    style={{ animation: 'cursor-blink 0.8s infinite' }}
                  />
                )}
              </div>
            </div>
          )
        })}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="relative pl-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-temp-cool animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-temp-cool/80">
                Parallax is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Signal Counter with Celebration */}
      {signalsExtracted > 0 && (
        <div className="px-8 py-4 border-t border-border/50 bg-surface/20">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <svg
                className="w-5 h-5 text-temp-cool"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ animation: 'signal-pulse 2s ease-in-out infinite' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="absolute inset-[-4px] rounded-full border border-temp-cool animate-ping opacity-20" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs uppercase tracking-widest text-temp-cool font-semibold">
                {signalsExtracted} behavioral signal{signalsExtracted !== 1 ? 's' : ''} captured
              </span>
              <span className="font-mono text-[9px] text-muted uppercase tracking-wider">
                Building your profile
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Voice + Text Input — hands-free enabled */}
      <ActiveSpeakerBar
        activeSpeakerName={displayName || 'You'}
        onSend={handleSend}
        disabled={isBusy}
        autoListen={handsFree}
        autoListenState={{
          isListening: autoListen.isListening,
          interimText: autoListen.interimText,
          isSpeechActive: autoListen.isSpeechActive,
          silenceCountdown: autoListen.silenceCountdown,
        }}
        isTTSSpeaking={voice.isSpeaking}
        isProcessing={isLoading}
        isMuted={muted}
        onToggleMute={() => setMuted((v) => !v)}
        onModeChange={(mode) => {
          if (mode === "auto") {
            setHandsFree(true);
            setMuted(false);
          } else {
            setHandsFree(false);
            setMuted(false);
          }
        }}
      />
    </div>
  )
}
