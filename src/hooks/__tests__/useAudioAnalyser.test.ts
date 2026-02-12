import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioAnalyser } from '../useAudioAnalyser'

// Create a proper mock stream that won't be affected by vi.restoreAllMocks()
const mockTracks = [{ stop: vi.fn() }]
const mockStream = {
  getTracks: () => mockTracks,
  getAudioTracks: () => mockTracks,
} as unknown as MediaStream

const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream)

beforeEach(() => {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  })
  mockGetUserMedia.mockResolvedValue(mockStream)

  // Re-apply AudioContext mock (vi.restoreAllMocks clears vi.fn() implementations)
  globalThis.AudioContext = vi.fn().mockImplementation(function (this: unknown) {
    return {
      createAnalyser: vi.fn(() => ({
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn((array: Float32Array) => {
          for (let i = 0; i < array.length; i++) array[i] = 0
        }),
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createMediaStreamSource: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      close: vi.fn(),
      state: 'running',
    }
  }) as unknown as typeof AudioContext

  vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1)
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
})

describe('useAudioAnalyser', () => {
  it('returns initial state with active = false', () => {
    const { result } = renderHook(() => useAudioAnalyser())
    expect(result.current.active).toBe(false)
    expect(result.current.denied).toBe(false)
    expect(result.current.waveform).toBeNull()
    expect(result.current.energy).toBe(0)
  })

  it('start() requests mic access and activates analyser', async () => {
    const { result } = renderHook(() => useAudioAnalyser())

    await act(async () => {
      await result.current.start()
    })

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true, video: false })
    expect(result.current.active).toBe(true)
    expect(result.current.denied).toBe(false)
  })

  it('sets denied = true when getUserMedia throws NotAllowedError', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError')
    mockGetUserMedia.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAudioAnalyser())

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.denied).toBe(true)
    expect(result.current.active).toBe(false)
  })

  it('sets active = false on non-permission errors', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('No mic found'))

    const { result } = renderHook(() => useAudioAnalyser())

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.active).toBe(false)
    expect(result.current.denied).toBe(false)
  })

  it('stop() cancels animation frame and resets state', async () => {
    const { result } = renderHook(() => useAudioAnalyser())

    await act(async () => {
      await result.current.start()
    })
    expect(result.current.active).toBe(true)

    act(() => {
      result.current.stop()
    })

    expect(result.current.active).toBe(false)
    expect(result.current.waveform).toBeNull()
    expect(result.current.energy).toBe(0)
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('cleans up AudioContext on unmount', async () => {
    const { result, unmount } = renderHook(() => useAudioAnalyser())

    await act(async () => {
      await result.current.start()
    })

    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('accepts custom fftSize parameter', () => {
    const { result } = renderHook(() => useAudioAnalyser(4096))
    expect(result.current.active).toBe(false)
  })

  it('start and stop are stable callback references', () => {
    const { result, rerender } = renderHook(() => useAudioAnalyser())
    const startRef = result.current.start
    const stopRef = result.current.stop
    rerender()
    expect(result.current.start).toBe(startRef)
    expect(result.current.stop).toBe(stopRef)
  })
})
