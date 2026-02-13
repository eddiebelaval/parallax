import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { SignalRail } from '../SignalRail'
import type { Message } from '@/types/database'

vi.mock('@/lib/temperature', () => ({
  getTemperatureColor: (t: number) => {
    if (t <= 0.1) return '#ebe1d4'
    if (t <= 0.4) return '#6aab8e'
    if (t <= 0.7) return '#d4a040'
    return '#c45c3c'
  },
  getTemperatureLabel: (t: number) => {
    if (t <= 0.1) return 'Neutral'
    if (t <= 0.4) return 'Cool'
    if (t <= 0.7) return 'Warm'
    return 'Hot'
  },
}))

let messageCounter = 0
function makeMessage(overrides: Partial<Message> = {}): Message {
  messageCounter++
  return {
    id: `msg-${messageCounter}-${Date.now()}`,
    session_id: 'sess-1',
    sender: 'person_a',
    content: 'Test message',
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('SignalRail', () => {
  it('returns null for empty message list', () => {
    const { container } = render(<SignalRail messages={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders one segment per message', () => {
    const messages = [makeMessage(), makeMessage(), makeMessage()]
    const { container } = render(<SignalRail messages={messages} />)
    const segments = container.querySelectorAll('.signal-segment')
    expect(segments.length).toBe(3)
  })

  it('uses temperature color for messages with emotional_temperature', () => {
    const messages = [makeMessage({ emotional_temperature: 0.8 })]
    const { container } = render(<SignalRail messages={messages} />)
    const segment = container.querySelector('.signal-segment') as HTMLElement
    const style = segment.getAttribute('style') || ''
    expect(style).toContain('#c45c3c')
  })

  it('uses default color for messages without emotional_temperature', () => {
    const messages = [makeMessage({ emotional_temperature: null })]
    const { container } = render(<SignalRail messages={messages} />)
    const segment = container.querySelector('.signal-segment') as HTMLElement
    const style = segment.getAttribute('style') || ''
    expect(style).toContain('var(--ember-800)')
  })

  it('marks the last segment as latest with box-shadow', () => {
    const messages = [
      makeMessage({ emotional_temperature: 0.3 }),
      makeMessage({ emotional_temperature: 0.9 }),
    ]
    const { container } = render(<SignalRail messages={messages} />)
    const segments = container.querySelectorAll('.signal-segment')
    const last = segments[1] as HTMLElement
    expect(last).toHaveClass('signal-segment-latest')
    expect(last.style.boxShadow).toBeTruthy()
  })

  it('does not apply box-shadow to non-latest segments', () => {
    const messages = [
      makeMessage({ emotional_temperature: 0.5 }),
      makeMessage({ emotional_temperature: 0.5 }),
    ]
    const { container } = render(<SignalRail messages={messages} />)
    const segments = container.querySelectorAll('.signal-segment')
    const first = segments[0] as HTMLElement
    expect(first).not.toHaveClass('signal-segment-latest')
  })
})
