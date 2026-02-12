import { vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock Supabase module — all API route tests and hooks import this
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
  createServerClient: vi.fn(),
}))

// Clean up rendered components between tests
afterEach(() => {
  cleanup()
})

// Reset all mocks between tests to prevent state leakage
beforeEach(() => {
  vi.restoreAllMocks()
})

// Polyfill Web Audio API (not in happy-dom)
if (typeof globalThis.AudioContext === 'undefined') {
  const mockAnalyserNode = {
    fftSize: 2048,
    frequencyBinCount: 1024,
    getFloatTimeDomainData: vi.fn((array: Float32Array) => {
      for (let i = 0; i < array.length; i++) array[i] = 0
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockSourceNode = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  globalThis.AudioContext = vi.fn().mockImplementation(() => ({
    createAnalyser: vi.fn(() => mockAnalyserNode),
    createMediaStreamSource: vi.fn(() => mockSourceNode),
    close: vi.fn(),
    state: 'running',
  })) as unknown as typeof AudioContext
}

// Polyfill MediaStream
if (typeof globalThis.MediaStream === 'undefined') {
  globalThis.MediaStream = vi.fn().mockImplementation(() => ({
    getTracks: vi.fn(() => []),
    getAudioTracks: vi.fn(() => [{ stop: vi.fn() }]),
  })) as unknown as typeof MediaStream
}

// Polyfill SpeechRecognition — use a class so `new SpeechRecognition()` survives vi.restoreAllMocks()
if (typeof (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition === 'undefined') {
  class MockSpeechRecognition {
    static instances: MockSpeechRecognition[] = []
    start = vi.fn()
    stop = vi.fn()
    abort = vi.fn()
    continuous = false
    interimResults = false
    lang = 'en-US'
    onresult: ((event: unknown) => void) | null = null
    onerror: ((event: unknown) => void) | null = null
    onend: (() => void) | null = null
    onstart: (() => void) | null = null
    constructor() {
      MockSpeechRecognition.instances.push(this)
    }
  }
  ;(globalThis as Record<string, unknown>).webkitSpeechRecognition = MockSpeechRecognition
  ;(globalThis as Record<string, unknown>).SpeechRecognition = MockSpeechRecognition
}

// Polyfill SpeechSynthesis
if (typeof globalThis.speechSynthesis === 'undefined') {
  ;(globalThis as Record<string, unknown>).speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
  }
  ;(globalThis as Record<string, unknown>).SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
    text: '',
    lang: 'en-US',
    rate: 1,
    pitch: 1,
    volume: 1,
  }))
}

// Stub fetch globally — individual tests override as needed
globalThis.fetch = vi.fn(() =>
  Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
) as unknown as typeof fetch
