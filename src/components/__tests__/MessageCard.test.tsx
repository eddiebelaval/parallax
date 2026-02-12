import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageCard } from '../MessageCard'
import type { NvcAnalysis, ConflictAnalysis, LensId } from '@/types/database'

// Mock TheMelt — we test it separately
vi.mock('../TheMelt', () => ({
  useMelt: vi.fn().mockReturnValue('settled'),
  MeltText: ({ content, className }: { content: string; className?: string }) => (
    <p className={className} data-testid="melt-text">{content}</p>
  ),
}))

// Mock LensBar
vi.mock('../lenses/LensBar', () => ({
  LensBar: ({ activeLenses }: { activeLenses: LensId[] }) => (
    <div data-testid="lens-bar">Lenses: {activeLenses.join(',')}</div>
  ),
}))

// Mock temperature module
vi.mock('@/lib/temperature', () => ({
  getTemperatureColor: vi.fn().mockImplementation((t: number) => t > 0.7 ? 'hot-color' : 'cool-color'),
  getTemperatureLabel: vi.fn().mockImplementation((t: number) => t > 0.7 ? 'hot' : 'cool'),
  getBacklitClass: vi.fn().mockImplementation((t: number, strong: boolean) => strong ? `backlit-strong-${t}` : `backlit-${t}`),
}))

function makeNvcAnalysis(overrides: Partial<NvcAnalysis> = {}): NvcAnalysis {
  return {
    observation: 'They said something',
    feeling: 'Frustrated',
    need: 'Understanding',
    request: 'Could you listen?',
    subtext: 'I feel unheard',
    blindSpots: ['Assumes intent'],
    unmetNeeds: ['Respect', 'Recognition'],
    nvcTranslation: 'I need to feel heard',
    emotionalTemperature: 0.6,
    ...overrides,
  }
}

function makeConflictAnalysis(overrides: Partial<ConflictAnalysis> = {}): ConflictAnalysis {
  return {
    ...makeNvcAnalysis(),
    lenses: { nvc: makeNvcAnalysis() },
    meta: {
      contextMode: 'intimate',
      activeLenses: ['nvc', 'gottman'] as LensId[],
      primaryInsight: 'Both need to be heard',
      overallSeverity: 0.7,
      resolutionDirection: 'stable',
    },
    ...overrides,
  }
}

describe('MessageCard', () => {
  it('renders message content', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello there"
        timestamp="2:30 PM"
      />
    )
    expect(screen.getByTestId('melt-text')).toHaveTextContent('Hello there')
  })

  it('renders sender name for person_a', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders "Parallax" for mediator sender', () => {
    render(
      <MessageCard
        sender="mediator"
        senderName="Claude"
        content="Welcome"
        timestamp="2:30 PM"
      />
    )
    expect(screen.getByText('Parallax')).toBeInTheDocument()
  })

  it('renders timestamp', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
      />
    )
    expect(screen.getByText('2:30 PM')).toBeInTheDocument()
  })

  it('does not show temperature label when no analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
      />
    )
    expect(screen.queryByText('hot')).not.toBeInTheDocument()
    expect(screen.queryByText('cool')).not.toBeInTheDocument()
  })

  it('shows temperature label when analysis is present', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis()}
      />
    )
    expect(screen.getByText('cool')).toBeInTheDocument()
  })

  it('does not show "What\'s beneath" button when no analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
      />
    )
    expect(screen.queryByText("What's beneath")).not.toBeInTheDocument()
  })

  it('shows toggle button when analysis is present', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis()}
      />
    )
    expect(screen.getByText("What's beneath")).toBeInTheDocument()
  })

  it('toggles analysis sections on click', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis()}
      />
    )
    const toggle = screen.getByText("What's beneath")
    fireEvent.click(toggle)
    expect(screen.getByText('Hide analysis')).toBeInTheDocument()
    expect(screen.getByText('I feel unheard')).toBeInTheDocument() // subtext
  })

  it('shows subtext in analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis({ subtext: 'Deeper meaning' })}
      />
    )
    fireEvent.click(screen.getByText("What's beneath"))
    expect(screen.getByText('Deeper meaning')).toBeInTheDocument()
  })

  it('shows blind spots in analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis({ blindSpots: ['Blind spot 1'] })}
      />
    )
    fireEvent.click(screen.getByText("What's beneath"))
    expect(screen.getByText('Blind spot 1')).toBeInTheDocument()
  })

  it('shows unmet needs as tags in analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis({ unmetNeeds: ['Respect', 'Trust'] })}
      />
    )
    fireEvent.click(screen.getByText("What's beneath"))
    expect(screen.getByText('Respect')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
  })

  it('shows NVC translation in analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeNvcAnalysis({ nvcTranslation: 'Translated message' })}
      />
    )
    fireEvent.click(screen.getByText("What's beneath"))
    expect(screen.getByText('Translated message')).toBeInTheDocument()
  })

  it('handles null analysis gracefully', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={null}
      />
    )
    expect(screen.queryByText("What's beneath")).not.toBeInTheDocument()
  })

  it('renders LensBar when ConflictAnalysis (V3) is present', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeConflictAnalysis()}
      />
    )
    fireEvent.click(screen.getByText("What's beneath"))
    expect(screen.getByTestId('lens-bar')).toBeInTheDocument()
  })

  it('shows primary insight for V3 analysis in settled phase', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeConflictAnalysis({ meta: {
          contextMode: 'intimate',
          activeLenses: ['nvc'],
          primaryInsight: 'Core insight text',
          overallSeverity: 0.5,
          resolutionDirection: 'stable',
        }})}
      />
    )
    expect(screen.getByText('Core insight text')).toBeInTheDocument()
  })

  it('shows direction indicator for V3 analysis', () => {
    render(
      <MessageCard
        sender="person_a"
        senderName="Alice"
        content="Hello"
        timestamp="2:30 PM"
        nvcAnalysis={makeConflictAnalysis({ meta: {
          contextMode: 'intimate',
          activeLenses: ['nvc'],
          primaryInsight: 'Insight',
          overallSeverity: 0.5,
          resolutionDirection: 'escalating',
        }})}
      />
    )
    expect(screen.getByTitle('escalating')).toBeInTheDocument()
  })
})
