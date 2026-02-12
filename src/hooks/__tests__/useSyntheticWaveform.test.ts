import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSyntheticWaveform } from '../useSyntheticWaveform'

beforeEach(() => {
  // Mock requestAnimationFrame to call the callback ONCE (non-recursively)
  let called = false
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    if (!called) {
      called = true
      cb(performance.now())
    }
    return 1
  })
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
})

describe('useSyntheticWaveform', () => {
  it('returns null waveform and 0 energy when inactive', () => {
    const { result } = renderHook(() => useSyntheticWaveform(false))
    expect(result.current.waveform).toBeNull()
    expect(result.current.energy).toBe(0)
    expect(result.current.active).toBe(false)
  })

  it('generates waveform data when active', () => {
    const { result } = renderHook(() => useSyntheticWaveform(true))
    expect(result.current.active).toBe(true)
    expect(result.current.waveform).toBeInstanceOf(Float32Array)
    expect(result.current.waveform!.length).toBe(256)
  })

  it('produces non-zero energy when active', () => {
    const { result } = renderHook(() => useSyntheticWaveform(true))
    expect(result.current.energy).toBeGreaterThan(0)
  })

  it('resets waveform and energy when deactivated', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useSyntheticWaveform(active),
      { initialProps: { active: true } }
    )
    expect(result.current.waveform).not.toBeNull()

    rerender({ active: false })
    expect(result.current.waveform).toBeNull()
    expect(result.current.energy).toBe(0)
  })

  it('cancels animation frame on unmount', () => {
    const { unmount } = renderHook(() => useSyntheticWaveform(true))
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
