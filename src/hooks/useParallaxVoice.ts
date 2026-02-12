'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * useParallaxVoice — ElevenLabs TTS via /api/tts server proxy.
 *
 * Sends text to the server, receives audio/mpeg, plays via HTMLAudioElement.
 * Falls back to browser SpeechSynthesis if the API call fails.
 * Exposes real-time waveform + energy data from audio output for visualization.
 */
export function useParallaxVoice(): {
  speak: (text: string) => void
  speakChunked: (text: string) => Promise<void>
  isSpeaking: boolean
  cancel: () => void
  waveform: Float32Array | null
  energy: number
} {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [waveform, setWaveform] = useState<Float32Array | null>(null)
  const [energy, setEnergy] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)
  const dataArrayRef = useRef<Float32Array<ArrayBuffer> | null>(null)

  const analysisTick = useCallback(() => {
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    if (!analyser || !dataArray) return

    analyser.getFloatTimeDomainData(dataArray)

    let sumSquares = 0
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sumSquares / dataArray.length)
    setEnergy(Math.min(1, rms * 5))
    setWaveform(new Float32Array(dataArray))

    rafRef.current = requestAnimationFrame(analysisTick)
  }, [])

  const stopAnalysis = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setWaveform(null)
    setEnergy(0)
  }, [])

  const cleanup = useCallback(() => {
    stopAnalysis()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [stopAnalysis])

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

        audio.onplay = () => {
          setIsSpeaking(true)

          // Connect audio element to AnalyserNode for waveform visualization
          try {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new AudioContext()
            }
            const ctx = audioCtxRef.current
            if (ctx.state === 'suspended') ctx.resume()

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 2048
            analyser.smoothingTimeConstant = 0.8

            const source = ctx.createMediaElementSource(audio)
            source.connect(analyser)
            analyser.connect(ctx.destination)

            analyserRef.current = analyser
            dataArrayRef.current = new Float32Array(analyser.fftSize)
            rafRef.current = requestAnimationFrame(analysisTick)
          } catch {
            // Analysis is optional — audio still plays without it
          }
        }
        audio.onended = () => {
          setIsSpeaking(false)
          stopAnalysis()
          cleanup()
          resolve()
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          stopAnalysis()
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

  return { speak, speakChunked, isSpeaking, cancel, waveform, energy }
}
