'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTypewriter } from './useTypewriter'
import { useParallaxVoice } from './useParallaxVoice'
import { NARRATION_SCRIPT, FALLBACK_INTRO, getIntroPrompt } from '@/lib/narration-script'
import type { NarrationStep } from '@/lib/narration-script'

export type NarrationPhase = 'idle' | 'expanding' | 'narrating' | 'collapsing' | 'complete' | 'chat'

const INTRO_SEEN_KEY = 'parallax-intro-seen'
const API_TIMEOUT_MS = 5000
const EXPAND_DURATION_MS = 300
const COLLAPSE_DURATION_MS = 400
const STEP_MAX_TIMEOUT_MS = 25000 // Safety net: force-proceed if a step hangs

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Race a promise against a timeout. Resolves with 'timeout' if the deadline hits. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | 'timeout'> {
  return Promise.race([
    promise,
    new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ])
}

export function useNarrationController() {
  // Always start 'idle' for SSR consistency — check localStorage after hydration
  const [phase, setPhase] = useState<NarrationPhase>('idle')
  const [slidUp, setSlidUp] = useState(false)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
      if (localStorage.getItem(INTRO_SEEN_KEY)) {
        setPhase('complete')
      }
    }
  }, [])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isMuted, setIsMuted] = useState(false)

  const typewriter = useTypewriter(30)
  const voice = useParallaxVoice()

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())
  const abortRef = useRef(false)
  const mutedRef = useRef(false)
  const replayCountRef = useRef(0)
  const firstSectionRevealedRef = useRef(false)
  const lastRevealedSectionRef = useRef<string | null>(null)

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el)
    } else {
      sectionRefs.current.delete(id)
    }
  }, [])

  const revealSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current.get(sectionId)
    if (!el) return

    // Blur all previously revealed sections — focus on the new one
    sectionRefs.current.forEach((sectionEl, id) => {
      if (id !== sectionId && sectionEl.classList.contains('section-visible')) {
        sectionEl.classList.add('section-defocused')
      }
    })
    // Also blur the hero (always visible, never hidden)
    const heroEl = sectionRefs.current.get('hero')
    if (heroEl && sectionId !== 'hero') {
      heroEl.classList.add('section-defocused')
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('section-defocused')
    setTimeout(() => {
      el.classList.add('section-visible')
    }, 400)

    lastRevealedSectionRef.current = sectionId

    // After the first section reveals, signal the panel to slide up
    if (!firstSectionRevealedRef.current) {
      firstSectionRevealedRef.current = true
      setSlidUp(true)
    }
  }, [])

  const scrollToTheDoor = useCallback(() => {
    const doorEl = sectionRefs.current.get('the-door')
    if (doorEl) {
      doorEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const markComplete = useCallback(() => {
    setPhase('complete')
    setSlidUp(false)
    localStorage.setItem(INTRO_SEEN_KEY, '1')
    sectionRefs.current.forEach((el) => {
      el.classList.add('section-visible')
      el.classList.remove('section-defocused')
    })
    voice.cancel()
    typewriter.reset()
  }, [voice, typewriter])

  const fetchExplorerIntro = useCallback(async (prompt: string): Promise<string> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explorer',
          message: prompt,
          history: [],
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) return FALLBACK_INTRO
      const data = await res.json()
      return data.message || FALLBACK_INTRO
    } catch {
      clearTimeout(timeout)
      return FALLBACK_INTRO
    }
  }, [])

  const runStep = useCallback(
    async (step: NarrationStep, index: number) => {
      if (abortRef.current) return
      setCurrentStep(index)

      let text: string
      if (step.type === 'api') {
        const prompt = getIntroPrompt(replayCountRef.current)
        text = await fetchExplorerIntro(prompt)
      } else {
        text = step.text
      }

      if (abortRef.current) return

      if (step.revealsSection) {
        revealSection(step.revealsSection)
      }

      // Race typewriter + TTS against a safety timeout.
      // If TTS hangs (e.g. short audio not firing onended), we still proceed.
      const typePromise = typewriter.start(text)
      const voicePromise = mutedRef.current
        ? Promise.resolve()
        : voice.speakChunked(text)

      const result = await withTimeout(
        Promise.all([typePromise, voicePromise]),
        STEP_MAX_TIMEOUT_MS,
      )

      if (result === 'timeout') {
        // Force cleanup — TTS or typewriter hung
        voice.cancel()
        typewriter.skipToEnd()
      }

      if (abortRef.current) return

      if (step.delayAfterMs) {
        await sleep(step.delayAfterMs)
      }
    },
    [fetchExplorerIntro, revealSection, typewriter, voice],
  )

  const startNarration = useCallback(async () => {
    abortRef.current = false
    firstSectionRevealedRef.current = false
    lastRevealedSectionRef.current = null
    setSlidUp(false)

    // Phase 1: Expanding — morph pill to panel
    setPhase('expanding')

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await sleep(prefersReduced ? 0 : EXPAND_DURATION_MS)

    if (abortRef.current) return

    // Phase 2: Narrating — run all 3 beats
    setPhase('narrating')

    for (let i = 0; i < NARRATION_SCRIPT.length; i++) {
      if (abortRef.current) break
      await runStep(NARRATION_SCRIPT[i], i)
    }

    if (!abortRef.current) {
      // Phase 3: Collapsing — morph panel back to pill
      setPhase('collapsing')
      const prefersReducedEnd = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      await sleep(prefersReducedEnd ? 0 : COLLAPSE_DURATION_MS)
      markComplete()
      // Auto-scroll to The Door after narration completes
      setTimeout(scrollToTheDoor, 300)
    }
  }, [runStep, markComplete, scrollToTheDoor])

  const skipToEnd = useCallback(() => {
    abortRef.current = true
    voice.cancel()
    typewriter.skipToEnd()
    setSlidUp(false)
    markComplete()
  }, [voice, typewriter, markComplete])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      mutedRef.current = next
      if (next) voice.cancel()
      return next
    })
  }, [voice])

  const replayNarration = useCallback(() => {
    replayCountRef.current += 1
    abortRef.current = true
    voice.cancel()
    typewriter.reset()
    setSlidUp(false)
    // Re-hide all sections so they reveal again during narration
    sectionRefs.current.forEach((el) => {
      el.classList.remove('section-visible')
      el.classList.remove('section-defocused')
    })
    setCurrentStep(-1)
    // Small delay to let abort propagate, then start fresh
    setTimeout(() => {
      startNarration()
    }, 100)
  }, [voice, typewriter, startNarration])

  const enterChat = useCallback(() => {
    setPhase('chat')
  }, [])

  const exitChat = useCallback(() => {
    setPhase('complete')
  }, [])

  return {
    phase,
    slidUp,
    currentStep,
    displayedText: typewriter.displayedText,
    isTyping: typewriter.isTyping,
    isSpeaking: voice.isSpeaking,
    voiceWaveform: voice.waveform,
    voiceEnergy: voice.energy,
    isMuted,
    startNarration,
    replayNarration,
    skipToEnd,
    toggleMute,
    registerSection,
    enterChat,
    exitChat,
  }
}
