'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const PREFERRED_VOICES = [
  'Samantha',                 // macOS default
  'Google UK English Female', // Chrome on desktop
  'Microsoft Zira',           // Windows
  'Karen',                    // macOS Australian
]

function selectVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Try preferred voices first
  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name.includes(name))
    if (match) return match
  }
  // Fall back to first English voice
  const english = voices.find((v) => v.lang.startsWith('en'))
  return english || voices[0]
}

export function useParallaxVoice(): {
  speak: (text: string) => void
  isSpeaking: boolean
  cancel: () => void
} {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load voices (they load asynchronously in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        voiceRef.current = selectVoice(voices)
      }
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    if (voiceRef.current) {
      utterance.voice = voiceRef.current
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak, isSpeaking, cancel }
}
