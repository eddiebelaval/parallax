import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrbStrip } from '../OrbStrip'

// Mock the hooks
vi.mock('@/hooks/useAudioAnalyser', () => ({
  useAudioAnalyser: vi.fn(() => ({
    waveform: null,
    energy: 0,
    active: false,
    denied: false,
    start: vi.fn(),
    stop: vi.fn(),
  })),
}))

vi.mock('@/hooks/useSyntheticWaveform', () => ({
  useSyntheticWaveform: vi.fn(() => ({
    waveform: null,
    energy: 0,
    active: false,
  })),
}))

// Mock AudioWaveformOrb to inspect props
vi.mock('../AudioWaveformOrb', () => ({
  AudioWaveformOrb: ({ name, role }: { name: string; role: string }) => (
    <div data-testid={`orb-${role}`}>{name}</div>
  ),
}))

describe('OrbStrip', () => {
  it('renders three orbs: person A, Ava, person B', () => {
    render(
      <OrbStrip
        personAName="Alice"
        personBName="Bob"
        currentTurn="person_a"
        isAnalyzing={false}
      />
    )
    expect(screen.getByTestId('orb-a')).toHaveTextContent('Alice')
    expect(screen.getByTestId('orb-claude')).toHaveTextContent('Ava')
    expect(screen.getByTestId('orb-b')).toHaveTextContent('Bob')
  })

  it('renders person names correctly', () => {
    render(
      <OrbStrip
        personAName="Maya"
        personBName="Jordan"
        currentTurn="person_b"
        isAnalyzing={false}
      />
    )
    expect(screen.getByText('Maya')).toBeInTheDocument()
    expect(screen.getByText('Jordan')).toBeInTheDocument()
  })

  it('calls analyser.start on mount', async () => {
    const { useAudioAnalyser } = await import('@/hooks/useAudioAnalyser')
    const mockStart = vi.fn()
    vi.mocked(useAudioAnalyser).mockReturnValue({
      waveform: null,
      energy: 0,
      active: false,
      denied: false,
      start: mockStart,
      stop: vi.fn(),
    })

    render(
      <OrbStrip
        personAName="Alice"
        personBName="Bob"
        currentTurn="person_a"
        isAnalyzing={false}
      />
    )
    expect(mockStart).toHaveBeenCalledOnce()
  })
})
