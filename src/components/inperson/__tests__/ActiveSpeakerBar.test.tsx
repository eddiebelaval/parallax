import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ActiveSpeakerBar } from '../ActiveSpeakerBar'

// Mock icons
vi.mock('@/components/icons', () => ({
  MicIcon: ({ size, className }: { size?: number; className?: string }) => (
    <span data-testid="mic-icon" className={className}>{size}</span>
  ),
  KeyboardIcon: ({ size, className }: { size?: number; className?: string }) => (
    <span data-testid="keyboard-icon" className={className}>{size}</span>
  ),
}))

describe('ActiveSpeakerBar', () => {
  let onSend: (content: string) => void

  beforeEach(() => {
    onSend = vi.fn()
  })

  it('shows active speaker name', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    // Speaker name appears in the indicator area
    const speakerNames = screen.getAllByText('Alice')
    expect(speakerNames.length).toBeGreaterThanOrEqual(1)
  })

  it('defaults to voice mode with "Tap to talk" label', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    expect(screen.getByText('Tap to talk')).toBeInTheDocument()
  })

  it('can switch to text mode', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    fireEvent.click(screen.getByLabelText('Switch to text input'))
    expect(screen.getByPlaceholderText('Alice, speak your truth...')).toBeInTheDocument()
  })

  it('sends text message when Enter pressed in text mode', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    fireEvent.click(screen.getByLabelText('Switch to text input'))

    const input = screen.getByPlaceholderText('Alice, speak your truth...')
    fireEvent.change(input, { target: { value: 'Hello there' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('Hello there')
  })

  it('sends text message when Send button clicked', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    fireEvent.click(screen.getByLabelText('Switch to text input'))

    const input = screen.getByPlaceholderText('Alice, speak your truth...')
    fireEvent.change(input, { target: { value: 'Hello there' } })
    fireEvent.click(screen.getByText('Send'))
    expect(onSend).toHaveBeenCalledWith('Hello there')
  })

  it('disables Send button when text is empty', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    fireEvent.click(screen.getByLabelText('Switch to text input'))
    expect(screen.getByText('Send')).toBeDisabled()
  })

  it('disables controls when disabled prop is true', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} disabled />)
    const tapButton = screen.getByLabelText('Tap to talk')
    expect(tapButton).toBeDisabled()
  })

  it('calls onMicStateChange when mic starts', () => {
    const onMicStateChange = vi.fn()
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} onMicStateChange={onMicStateChange} />)
    fireEvent.click(screen.getByLabelText('Tap to talk'))
    expect(onMicStateChange).toHaveBeenCalledWith(true)
  })

  it('shows "Tap to send" and "Mic live" when recording', () => {
    render(<ActiveSpeakerBar activeSpeakerName="Alice" onSend={onSend} />)
    fireEvent.click(screen.getByLabelText('Tap to talk'))
    expect(screen.getByText('Tap to send')).toBeInTheDocument()
    expect(screen.getByText('Mic live')).toBeInTheDocument()
  })
})
