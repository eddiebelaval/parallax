import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { VoiceInput } from '../VoiceInput'

// Mock icons
vi.mock('../icons', () => ({
  MicIcon: ({ className }: { className?: string }) => (
    <span data-testid="mic-icon" className={className}>mic</span>
  ),
}))

// Helper to get the latest SpeechRecognition instance from the class-based mock
function getLatestRecognitionInstance() {
  const SR = window.SpeechRecognition as unknown as { instances: Array<Record<string, unknown>> }
  return SR.instances[SR.instances.length - 1]
}

function clearRecognitionInstances() {
  const SR = window.SpeechRecognition as unknown as { instances: unknown[] }
  if (SR.instances) SR.instances.length = 0
}

describe('VoiceInput', () => {
  const onTranscript = vi.fn()

  beforeEach(() => {
    onTranscript.mockClear()
    clearRecognitionInstances()
  })

  it('renders the microphone button', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument()
  })

  it('shows "Hold to speak" in the label area', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const elements = screen.getAllByText('Hold to speak')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Hold to speak" aria-label on the button', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Hold to speak')
  })

  it('starts listening on mouseDown and shows "Listening..." label', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const button = screen.getByRole('button')
    fireEvent.mouseDown(button)
    expect(screen.getByText('Listening...')).toBeInTheDocument()
  })

  it('stops listening on mouseUp and calls onTranscript with result', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const button = screen.getByRole('button')

    fireEvent.mouseDown(button)

    // Get the recognition instance created by the class-based mock
    const recognitionInstance = getLatestRecognitionInstance()
    expect(recognitionInstance).toBeTruthy()

    // Simulate a final result
    const onresult = recognitionInstance.onresult as (event: unknown) => void
    if (onresult) {
      act(() => {
        onresult({
          resultIndex: 0,
          results: {
            length: 1,
            0: {
              0: { transcript: 'Hello world' },
              isFinal: true,
              length: 1,
            },
          },
        })
      })
    }

    // Mouse up stops recognition
    fireEvent.mouseUp(button)

    // Simulate recognition end (which triggers onTranscript)
    const onend = recognitionInstance.onend as (() => void) | null
    if (onend) {
      act(() => {
        onend()
      })
    }

    expect(onTranscript).toHaveBeenCalledWith('Hello world')
  })

  it('shows pulsing ring when listening', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const button = screen.getByRole('button')
    fireEvent.mouseDown(button)
    const pulsing = button.querySelector('.animate-pulse')
    expect(pulsing).toBeTruthy()
  })

  it('disables button when disabled prop is true', () => {
    render(<VoiceInput onTranscript={onTranscript} disabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies opacity class when disabled', () => {
    const { container } = render(<VoiceInput onTranscript={onTranscript} disabled />)
    expect(container.firstChild).toHaveClass('opacity-40')
  })

  it('handles SpeechRecognition error gracefully', () => {
    render(<VoiceInput onTranscript={onTranscript} />)
    const button = screen.getByRole('button')
    fireEvent.mouseDown(button)

    const recognitionInstance = getLatestRecognitionInstance()
    const onerror = recognitionInstance?.onerror as ((event: unknown) => void) | null

    if (onerror) {
      act(() => {
        onerror({ error: 'not-allowed' })
      })
    }

    expect(screen.queryByText('Listening...')).not.toBeInTheDocument()
    expect(onTranscript).not.toHaveBeenCalled()
  })

  it('handles speech not supported by showing Chrome message', () => {
    const originalSR = window.SpeechRecognition
    const originalWebkit = window.webkitSpeechRecognition
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    render(<VoiceInput onTranscript={onTranscript} />)
    expect(screen.getByText('Voice requires Chrome')).toBeInTheDocument()

    ;(window as unknown as Record<string, unknown>).SpeechRecognition = originalSR
    ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = originalWebkit
  })
})
