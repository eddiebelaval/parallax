'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTypewriter } from './useTypewriter'
import { useParallaxVoice } from './useParallaxVoice'
import { NARRATION_SCRIPT, FALLBACK_INTRO, getIntroPrompt, buildFullNarrationPrompt, DYNAMIC_STEP_IDS } from '@/lib/narration-script'
import type { NarrationStep, GeneratedNarration, DynamicStepId } from '@/lib/narration-script'

export type NarrationPhase = 'idle' | 'expanding' | 'narrating' | 'collapsing' | 'complete' | 'chat'

const INTRO_SEEN_KEY = 'parallax-intro-seen'
const API_TIMEOUT_MS = 5000
const EXPAND_DURATION_MS = 300
const COLLAPSE_DURATION_MS = 400

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  const generatedTextRef = useRef<GeneratedNarration | null>(null)
  const firstSectionRevealedRef = useRef(false)

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
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      el.classList.add('section-visible')
    }, 400)

    // After the first section reveals, signal the panel to slide up
    if (!firstSectionRevealedRef.current) {
      firstSectionRevealedRef.current = true
      setSlidUp(true)
    }
  }, [])

  const markComplete = useCallback(() => {
    setPhase('complete')
    setSlidUp(false)
    localStorage.setItem(INTRO_SEEN_KEY, '1')
    sectionRefs.current.forEach((el) => {
      el.classList.add('section-visible')
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

  const generateFullNarration = useCallback(async (replayCount: number): Promise<GeneratedNarration | null> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explorer',
          message: buildFullNarrationPrompt(replayCount),
          history: [],
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) return null
      const data = await res.json()
      const raw: string = data.message || ''

      // Extract JSON — handle code fences or leading text
      let cleaned = raw.trim()
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim()
      const jsonStart = cleaned.indexOf('{')
      const jsonEnd = cleaned.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) return null
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1)

      const parsed = JSON.parse(cleaned)

      // Validate all required keys exist
      for (const id of DYNAMIC_STEP_IDS) {
        if (typeof parsed[id] !== 'string') return null
      }

      return parsed as GeneratedNarration
    } catch {
      clearTimeout(timeout)
      return null
    }
  }, [])

  const runStep = useCallback(
    async (step: NarrationStep, index: number) => {
      if (abortRef.current) return
      setCurrentStep(index)

      let text: string
      if (step.type === 'api') {
        // Greeting — has its own dedicated prompt + API call
        const prompt = getIntroPrompt(replayCountRef.current)
        text = await fetchExplorerIntro(prompt)
      } else if (generatedTextRef.current && step.id in generatedTextRef.current) {
        // Dynamic body step — use freshly generated text
        text = generatedTextRef.current[step.id as DynamicStepId]
      } else {
        // Static fallback (also used for 'what-you-see' which is MeltDemo-locked)
        text = step.text
      }

      if (abortRef.current) return

      if (step.revealsSection) {
        revealSection(step.revealsSection)
      }

      const typePromise = typewriter.start(text)
      const voicePromise = mutedRef.current
        ? Promise.resolve()
        : voice.speakChunked(text)

      await Promise.all([typePromise, voicePromise])

      if (abortRef.current) return

      if (step.delayAfterMs) {
        await sleep(step.delayAfterMs)
      }
    },
    [fetchExplorerIntro, revealSection, typewriter, voice],
  )

  const startNarration = useCallback(async () => {
    abortRef.current = false
    generatedTextRef.current = null
    firstSectionRevealedRef.current = false
    setSlidUp(false)

    // Phase 1: Expanding — morph pill to panel
    setPhase('expanding')

    // Check for reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await sleep(prefersReduced ? 0 : EXPAND_DURATION_MS)

    if (abortRef.current) return

    // Phase 2: Narrating
    setPhase('narrating')

    // Fire full narration generation in parallel with the greeting step.
    // By the time the greeting finishes speaking (~8-12s), this is ready.
    const narrationPromise = generateFullNarration(replayCountRef.current)
      .then((result) => { generatedTextRef.current = result })

    // Run greeting (step 0) immediately — its own API call + TTS
    if (NARRATION_SCRIPT.length > 0) {
      await runStep(NARRATION_SCRIPT[0], 0)
    }

    // Ensure generated text is ready before body steps
    await narrationPromise

    // Run remaining steps with dynamic (or fallback static) text
    for (let i = 1; i < NARRATION_SCRIPT.length; i++) {
      if (abortRef.current) break
      await runStep(NARRATION_SCRIPT[i], i)
    }

    if (!abortRef.current) {
      // Phase 3: Collapsing — morph panel back to pill
      setPhase('collapsing')
      const prefersReducedEnd = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      await sleep(prefersReducedEnd ? 0 : COLLAPSE_DURATION_MS)
      markComplete()
    }
  }, [runStep, markComplete, generateFullNarration])

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
