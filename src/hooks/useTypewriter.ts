'use client'

import { useState, useCallback, useRef } from 'react'

const DEFAULT_CHAR_DELAY = 30
const SENTENCE_PAUSE = 400

function isSentenceEnd(char: string, next: string | undefined): boolean {
  return (char === '.' || char === '?' || char === '!') && (next === ' ' || next === undefined)
}

export function useTypewriter(charDelay = DEFAULT_CHAR_DELAY) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const fullTextRef = useRef('')
  const rafRef = useRef<number>(0)
  const indexRef = useRef(0)
  const lastTimeRef = useRef(0)
  const pauseUntilRef = useRef(0)

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const skipToEnd = useCallback(() => {
    stop()
    setDisplayedText(fullTextRef.current)
    setIsTyping(false)
  }, [stop])

  const reset = useCallback(() => {
    stop()
    setDisplayedText('')
    setIsTyping(false)
    fullTextRef.current = ''
    indexRef.current = 0
  }, [stop])

  const start = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        stop()
        fullTextRef.current = text
        indexRef.current = 0
        lastTimeRef.current = 0
        pauseUntilRef.current = 0
        setDisplayedText('')
        setIsTyping(true)

        function tick(time: number) {
          // Respect sentence pauses
          if (time < pauseUntilRef.current) {
            rafRef.current = requestAnimationFrame(tick)
            return
          }

          if (!lastTimeRef.current) lastTimeRef.current = time
          const elapsed = time - lastTimeRef.current

          if (elapsed >= charDelay) {
            lastTimeRef.current = time
            const fullText = fullTextRef.current
            const i = indexRef.current

            if (i < fullText.length) {
              indexRef.current = i + 1
              setDisplayedText(fullText.slice(0, i + 1))

              // Pause at sentence boundaries
              if (isSentenceEnd(fullText[i], fullText[i + 1])) {
                pauseUntilRef.current = time + SENTENCE_PAUSE
              }

              rafRef.current = requestAnimationFrame(tick)
            } else {
              setIsTyping(false)
              rafRef.current = 0
              resolve()
            }
          } else {
            rafRef.current = requestAnimationFrame(tick)
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      })
    },
    [charDelay, stop],
  )

  return { displayedText, isTyping, start, skipToEnd, reset }
}
