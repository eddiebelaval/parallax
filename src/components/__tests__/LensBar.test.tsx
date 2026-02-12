import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LensBar } from '../lenses/LensBar'
import type { LensId, LensResults, GottmanResult, CbtResult } from '@/types/database'

// Mock LensDetailPanel
vi.mock('../lenses/LensDetailPanel', () => ({
  LensDetailPanel: ({ lensId, onClose }: { lensId: LensId; onClose: () => void }) => (
    <div data-testid={`detail-${lensId}`}>
      <button onClick={onClose}>Close</button>
      Detail for {lensId}
    </div>
  ),
}))

// Mock context-modes to provide LENS_METADATA
vi.mock('@/lib/context-modes', () => ({
  LENS_METADATA: {
    nvc: { name: 'NVC', shortName: 'NVC', category: 'communication', description: 'NVC desc' },
    gottman: { name: 'Gottman', shortName: 'Gottman', category: 'relational', description: 'Gottman desc' },
    cbt: { name: 'CBT', shortName: 'CBT', category: 'cognitive', description: 'CBT desc' },
    tki: { name: 'TKI', shortName: 'TKI', category: 'resolution', description: 'TKI desc' },
    dramaTriangle: { name: 'Drama', shortName: 'Drama', category: 'relational', description: 'Drama desc' },
    scarf: { name: 'SCARF', shortName: 'SCARF', category: 'systemic', description: 'SCARF desc' },
  },
}))

const gottmanResult: GottmanResult = {
  horsemen: [{ type: 'criticism', evidence: 'You always...' }],
  repairAttempts: [],
  positiveToNegativeRatio: '1:3',
  startupType: 'harsh',
}

const cbtResult: CbtResult = {
  distortions: [{ type: 'catastrophizing', evidence: 'Everything is ruined' }],
  coreBeliefHint: 'I am not good enough',
}

describe('LensBar', () => {
  it('renders nothing when no lenses have results', () => {
    const { container } = render(
      <LensBar activeLenses={['nvc', 'gottman']} lensResults={{}} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('excludes NVC from chip display (shown in root analysis)', () => {
    const results: LensResults = { nvc: {} as never }
    render(<LensBar activeLenses={['nvc']} lensResults={results} />)
    expect(screen.queryByText('NVC')).not.toBeInTheDocument()
  })

  it('renders chips for lenses with results (excluding NVC)', () => {
    const results: LensResults = { gottman: gottmanResult, cbt: cbtResult }
    render(
      <LensBar activeLenses={['nvc', 'gottman', 'cbt']} lensResults={results} />
    )
    expect(screen.getByText('Gottman')).toBeInTheDocument()
    expect(screen.getByText('CBT')).toBeInTheDocument()
  })

  it('does not render chips for lenses without results', () => {
    // Only gottman has results, cbt is null
    const results: LensResults = { gottman: gottmanResult, cbt: null }
    render(
      <LensBar activeLenses={['nvc', 'gottman', 'cbt']} lensResults={results} />
    )
    expect(screen.getByText('Gottman')).toBeInTheDocument()
    expect(screen.queryByText('CBT')).not.toBeInTheDocument()
  })

  it('expands lens detail panel on chip click', () => {
    const results: LensResults = { gottman: gottmanResult }
    render(
      <LensBar activeLenses={['nvc', 'gottman']} lensResults={results} />
    )
    fireEvent.click(screen.getByText('Gottman'))
    expect(screen.getByTestId('detail-gottman')).toBeInTheDocument()
  })

  it('collapses detail panel when same chip is clicked again', () => {
    const results: LensResults = { gottman: gottmanResult }
    render(
      <LensBar activeLenses={['nvc', 'gottman']} lensResults={results} />
    )
    fireEvent.click(screen.getByText('Gottman'))
    expect(screen.getByTestId('detail-gottman')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Gottman'))
    expect(screen.queryByTestId('detail-gottman')).not.toBeInTheDocument()
  })

  it('switches detail panel when different chip clicked', () => {
    const results: LensResults = { gottman: gottmanResult, cbt: cbtResult }
    render(
      <LensBar activeLenses={['nvc', 'gottman', 'cbt']} lensResults={results} />
    )
    fireEvent.click(screen.getByText('Gottman'))
    expect(screen.getByTestId('detail-gottman')).toBeInTheDocument()

    fireEvent.click(screen.getByText('CBT'))
    expect(screen.queryByTestId('detail-gottman')).not.toBeInTheDocument()
    expect(screen.getByTestId('detail-cbt')).toBeInTheDocument()
  })

  it('closes detail panel via onClose callback', () => {
    const results: LensResults = { gottman: gottmanResult }
    render(
      <LensBar activeLenses={['nvc', 'gottman']} lensResults={results} />
    )
    fireEvent.click(screen.getByText('Gottman'))
    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByTestId('detail-gottman')).not.toBeInTheDocument()
  })
})
