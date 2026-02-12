import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MeltText, useMelt } from '../TheMelt'

// Test helper: component to exercise useMelt hook
function MeltHarness({ analysisArrived, severity = 0.5 }: { analysisArrived: boolean; severity?: number }) {
  const phase = useMelt(analysisArrived, severity)
  return <div data-testid="phase">{phase}</div>
}

describe('MeltText', () => {
  it('renders content as plain text in idle phase', () => {
    render(<MeltText content="Hello world" phase="idle" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders content as plain text in settled phase', () => {
    render(<MeltText content="Settled message" phase="settled" />)
    expect(screen.getByText('Settled message')).toBeInTheDocument()
  })

  it('applies melt-reform class during crystallizing phase', () => {
    render(<MeltText content="Reforming" phase="crystallizing" />)
    const el = screen.getByText('Reforming')
    expect(el).toHaveClass('melt-reform')
  })

  it('does not apply melt-reform in idle phase', () => {
    render(<MeltText content="Idle text" phase="idle" />)
    const el = screen.getByText('Idle text')
    expect(el).not.toHaveClass('melt-reform')
  })

  it('renders character-level particles during dissolving phase', () => {
    render(<MeltText content="AB" phase="dissolving" />)
    const particles = document.querySelectorAll('.melt-particle')
    expect(particles.length).toBe(2)
    expect(particles[0].textContent).toBe('A')
    expect(particles[1].textContent).toBe('B')
  })

  it('sets aria-label on container during dissolving phase', () => {
    render(<MeltText content="Test content" phase="dissolving" />)
    expect(screen.getByLabelText('Test content')).toBeInTheDocument()
  })

  it('replaces spaces with non-breaking spaces during dissolving', () => {
    const { container } = render(<MeltText content="a b" phase="dissolving" />)
    const particles = container.querySelectorAll('.melt-particle')
    expect(particles.length).toBe(3)
    // Middle character (index 1) should be NBSP
    expect(particles[1].textContent).toBe('\u00A0')
  })

  it('applies custom className', () => {
    render(<MeltText content="Styled" phase="idle" className="custom-class" />)
    expect(screen.getByText('Styled')).toHaveClass('custom-class')
  })

  it('sets melt CSS custom properties on particles during dissolving', () => {
    const { container } = render(
      <MeltText content="X" phase="dissolving" temperatureColor="#ff0000" />
    )
    const particle = container.querySelector('.melt-particle') as HTMLElement
    // happy-dom may not support getPropertyValue for custom props; check via style attribute
    const style = particle.getAttribute('style') || ''
    expect(style).toContain('--melt-color')
    expect(style).toContain('#ff0000')
  })

  it('uses default temperature color when not provided', () => {
    const { container } = render(<MeltText content="X" phase="dissolving" />)
    const particle = container.querySelector('.melt-particle') as HTMLElement
    const style = particle.getAttribute('style') || ''
    expect(style).toContain('#eeeeee')
  })

  it('sets melt-delay CSS property on particles', () => {
    const { container } = render(<MeltText content="XY" phase="dissolving" />)
    const particle = container.querySelector('.melt-particle') as HTMLElement
    const style = particle.getAttribute('style') || ''
    expect(style).toContain('--melt-delay')
  })
})

describe('useMelt', () => {
  it('returns "idle" when analysis has not arrived', () => {
    render(<MeltHarness analysisArrived={false} />)
    expect(screen.getByTestId('phase').textContent).toBe('idle')
  })

  it('returns "settled" immediately when analysis is present on mount', () => {
    render(<MeltHarness analysisArrived={true} />)
    expect(screen.getByTestId('phase').textContent).toBe('settled')
  })

  it('transitions through dissolving → crystallizing → settled when analysis arrives', () => {
    vi.useFakeTimers()

    const { rerender } = render(<MeltHarness analysisArrived={false} severity={0} />)
    expect(screen.getByTestId('phase').textContent).toBe('idle')

    // Trigger analysis arrival
    rerender(<MeltHarness analysisArrived={true} severity={0} />)
    expect(screen.getByTestId('phase').textContent).toBe('dissolving')

    // For severity=0: dissolveMs = 800, crystallizeMs = 920, totalMs = 1720
    act(() => { vi.advanceTimersByTime(800) })
    expect(screen.getByTestId('phase').textContent).toBe('crystallizing')

    act(() => { vi.advanceTimersByTime(920) })
    expect(screen.getByTestId('phase').textContent).toBe('settled')

    vi.useRealTimers()
  })
})
