import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { PersonPanel } from '../PersonPanel'
import type { Message } from '@/types/database'

// Mock child components
vi.mock('../MessageArea', () => ({
  MessageArea: () => <div data-testid="message-area">Messages</div>,
}))

vi.mock('../MessageInput', () => ({
  MessageInput: ({ onSend, placeholder }: { onSend: (s: string) => void; placeholder?: string }) => (
    <div data-testid="message-input">
      <input placeholder={placeholder} onChange={(e) => onSend(e.target.value)} />
    </div>
  ),
}))

vi.mock('../VoiceInput', () => ({
  VoiceInput: () => <div data-testid="voice-input">Voice</div>,
}))

vi.mock('../icons', () => ({
  MicIcon: ({ size }: { size?: number }) => <span data-testid="mic-icon">{size}</span>,
  KeyboardIcon: ({ size }: { size?: number }) => <span data-testid="keyboard-icon">{size}</span>,
}))

function makeProps(overrides = {}) {
  return {
    side: 'A' as const,
    name: 'Alice',
    otherName: 'Bob',
    isMyTurn: true,
    onSend: vi.fn(),
    inputMode: 'text' as const,
    onInputModeChange: vi.fn(),
    roomCode: 'ABC123',
    bothJoined: true,
    onEndSession: vi.fn(),
    endingSession: false,
    messages: [] as Message[],
    personAName: 'Alice',
    personBName: 'Bob',
    analyzingMessageId: null,
    mediationError: null,
    preJoinContent: <div data-testid="pre-join">Pre-join</div>,
    ...overrides,
  }
}

describe('PersonPanel', () => {
  it('renders person name in header', () => {
    const { container } = render(<PersonPanel {...makeProps()} />)
    const header = container.querySelector('.border-b')!
    expect(within(header as HTMLElement).getByText('Alice')).toBeInTheDocument()
  })

  it('renders room code in header', () => {
    const { container } = render(<PersonPanel {...makeProps()} />)
    const header = container.querySelector('.border-b')!
    expect(within(header as HTMLElement).getByText('ABC123')).toBeInTheDocument()
  })

  it('shows "Your turn" indicator when isMyTurn is true', () => {
    render(<PersonPanel {...makeProps({ isMyTurn: true })} />)
    expect(screen.getByText('Your turn')).toBeInTheDocument()
  })

  it('shows "Waiting" indicator when isMyTurn is false', () => {
    render(<PersonPanel {...makeProps({ isMyTurn: false })} />)
    expect(screen.getByText('Waiting')).toBeInTheDocument()
  })

  it('shows End button when both joined', () => {
    render(<PersonPanel {...makeProps()} />)
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('shows "Ending..." when endingSession is true', () => {
    render(<PersonPanel {...makeProps({ endingSession: true })} />)
    expect(screen.getByText('Ending...')).toBeInTheDocument()
  })

  it('calls onEndSession when End button clicked', () => {
    const onEndSession = vi.fn()
    render(<PersonPanel {...makeProps({ onEndSession })} />)
    fireEvent.click(screen.getByText('End'))
    expect(onEndSession).toHaveBeenCalledOnce()
  })

  it('shows pre-join content when not both joined', () => {
    render(<PersonPanel {...makeProps({ bothJoined: false })} />)
    expect(screen.getByTestId('pre-join')).toBeInTheDocument()
    expect(screen.queryByTestId('message-area')).not.toBeInTheDocument()
  })

  it('shows message area and input when both joined', () => {
    render(<PersonPanel {...makeProps()} />)
    expect(screen.getByTestId('message-area')).toBeInTheDocument()
    expect(screen.getByTestId('message-input')).toBeInTheDocument()
  })

  it('shows mediation error when present', () => {
    render(<PersonPanel {...makeProps({ mediationError: 'Analysis unavailable' })} />)
    expect(screen.getByText('Analysis unavailable')).toBeInTheDocument()
  })

  it('has input mode toggle button', () => {
    render(<PersonPanel {...makeProps()} />)
    // The toggle button exists with aria-label
    const toggleButton = screen.getByLabelText('Switch to voice')
    expect(toggleButton).toBeInTheDocument()
  })
})
