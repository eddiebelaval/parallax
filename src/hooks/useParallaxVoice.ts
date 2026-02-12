'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * useParallaxVoice — ElevenLabs TTS via /api/tts server proxy.
 *
 * Sends text to the server, receives audio/mpeg, plays via HTMLAudioElement.
 * Falls back to browser SpeechSynthesis if the API call fails.
 */
export function useParallaxVoice(): {
  speak: (text: string) => void
  speakChunked: (text: string) => Promise<void>
  isSpeaking: boolean
  cancel: () => void
} {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    cleanup()
    // Also cancel browser fallback if active
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [cleanup])

  /** Speak via browser SpeechSynthesis (fallback) */
  const speakFallback = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.()
        return
      }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        onEnd?.()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        onEnd?.()
      }
      window.speechSynthesis.speak(utterance)
    },
    [],
  )

  /** Core: fetch audio from /api/tts and play it. Returns a Promise that resolves when done. */
  const playElevenLabs = useCallback(
    async (text: string): Promise<void> => {
      cleanup()

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        throw new Error(`TTS API returned ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url

      return new Promise<void>((resolve) => {
        const audio = new Audio(url)
        audioRef.current = audio

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          cleanup()
          resolve()
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          cleanup()
          resolve()
        }

        audio.play().catch(() => {
          setIsSpeaking(false)
          cleanup()
          resolve()
        })
      })
    },
    [cleanup],
  )

  /** Fire-and-forget speak. Falls back to browser TTS on failure. */
  const speak = useCallback(
    (text: string) => {
      playElevenLabs(text).catch(() => {
        speakFallback(text)
      })
    },
    [playElevenLabs, speakFallback],
  )

  /** Awaitable speak. Resolves when audio finishes. Falls back to browser TTS on failure. */
  const speakChunked = useCallback(
    async (text: string): Promise<void> => {
      try {
        await playElevenLabs(text)
      } catch {
        // Fallback to browser TTS with a promise wrapper
        return new Promise<void>((resolve) => {
          speakFallback(text, resolve)
        })
      }
    },
    [playElevenLabs, speakFallback],
  )

  return { speak, speakChunked, isSpeaking, cancel }
}
