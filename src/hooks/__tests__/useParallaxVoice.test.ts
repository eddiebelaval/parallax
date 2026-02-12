import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useParallaxVoice } from '../useParallaxVoice'

beforeEach(() => {
  // Re-apply SpeechSynthesisUtterance constructor (vi.restoreAllMocks clears it)
  ;(globalThis as Record<string, unknown>).SpeechSynthesisUtterance = vi.fn().mockImplementation(
    function (this: Record<string, unknown>, text: string) {
      this.text = text
      this.lang = 'en-US'
      this.rate = 1
      this.pitch = 1
      this.volume = 1
      this.onstart = null
      this.onend = null
      this.onerror = null
    }
  )

  // Ensure speechSynthesis has all needed methods
  const synthMock = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speaking: false,
    pending: false,
    paused: false,
  }
  ;(globalThis as Record<string, unknown>).speechSynthesis = synthMock
})

describe('useParallaxVoice', () => {
  it('returns initial state with isSpeaking = false', () => {
    const { result } = renderHook(() => useParallaxVoice())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('speak() calls speechSynthesis.speak', () => {
    const { result } = renderHook(() => useParallaxVoice())

    act(() => {
      result.current.speak('Hello world')
    })

    expect(globalThis.speechSynthesis.cancel).toHaveBeenCalled()
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('cancel() calls speechSynthesis.cancel and sets isSpeaking to false', () => {
    const { result } = renderHook(() => useParallaxVoice())

    act(() => {
      result.current.cancel()
    })

    expect(globalThis.speechSynthesis.cancel).toHaveBeenCalled()
    expect(result.current.isSpeaking).toBe(false)
  })

  it('speak and cancel are stable callback references', () => {
    const { result, rerender } = renderHook(() => useParallaxVoice())
    const speakRef = result.current.speak
    const cancelRef = result.current.cancel
    rerender()
    expect(result.current.speak).toBe(speakRef)
    expect(result.current.cancel).toBe(cancelRef)
  })

  it('loads voices on mount', () => {
    renderHook(() => useParallaxVoice())
    expect(globalThis.speechSynthesis.getVoices).toHaveBeenCalled()
  })

  it('adds voiceschanged event listener', () => {
    renderHook(() => useParallaxVoice())
    expect(globalThis.speechSynthesis.addEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function)
    )
  })

  it('removes voiceschanged event listener on unmount', () => {
    const { unmount } = renderHook(() => useParallaxVoice())
    unmount()
    expect(globalThis.speechSynthesis.removeEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function)
    )
  })
})
