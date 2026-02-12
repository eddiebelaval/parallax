import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ContextModePicker } from '../ContextModePicker'

// Mock context-modes with CONTEXT_MODE_INFO
vi.mock('@/lib/context-modes', () => ({
  CONTEXT_MODE_INFO: {
    intimate: {
      name: 'Intimate Partners',
      description: 'Romantic relationships',
      example: 'Never about the dishes',
      group: 'personal',
    },
    family: {
      name: 'Family',
      description: 'Parents, siblings',
      example: 'Mom always sides with you',
      group: 'personal',
    },
    professional_peer: {
      name: 'Professional Peers',
      description: 'Coworkers, team members',
      example: 'Taking credit for my work',
      group: 'professional',
    },
    professional_hierarchical: {
      name: 'Professional Hierarchy',
      description: 'Boss-employee dynamics',
      example: 'Passed over for promotion',
      group: 'professional',
    },
    transactional: {
      name: 'Transactional',
      description: 'Customer-vendor disputes',
      example: 'Promised delivery by Friday',
      group: 'formal',
    },
    civil_structural: {
      name: 'Civil / Structural',
      description: 'Community disputes',
      example: 'HOA policy affects us differently',
      group: 'formal',
    },
  },
}))

describe('ContextModePicker', () => {
  const defaultProps = {
    sessionMode: 'remote' as const,
    onSelect: vi.fn(),
    onBack: vi.fn(),
    loading: false,
  }

  it('renders all 6 context modes', () => {
    render(<ContextModePicker {...defaultProps} />)
    expect(screen.getByText('Intimate Partners')).toBeInTheDocument()
    expect(screen.getByText('Family')).toBeInTheDocument()
    expect(screen.getByText('Professional Peers')).toBeInTheDocument()
    expect(screen.getByText('Professional Hierarchy')).toBeInTheDocument()
    expect(screen.getByText('Transactional')).toBeInTheDocument()
    expect(screen.getByText('Civil / Structural')).toBeInTheDocument()
  })

  it('groups modes by category labels', () => {
    render(<ContextModePicker {...defaultProps} />)
    // "Personal" appears as group label (and also as part of button text)
    // Use getAllByText since the word may appear in both group label and mode content
    expect(screen.getAllByText('Personal').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Professional').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Formal').length).toBeGreaterThanOrEqual(1)
  })

  it('displays description and example for each mode', () => {
    render(<ContextModePicker {...defaultProps} />)
    expect(screen.getByText('Romantic relationships')).toBeInTheDocument()
    expect(screen.getByText('Never about the dishes')).toBeInTheDocument()
    expect(screen.getByText('Community disputes')).toBeInTheDocument()
  })

  it('defaults to "intimate" as selected with accent border', () => {
    render(<ContextModePicker {...defaultProps} />)
    const intimateButton = screen.getByText('Intimate Partners').closest('button')
    expect(intimateButton?.className).toContain('border-accent')
  })

  it('highlights selected mode on click', () => {
    render(<ContextModePicker {...defaultProps} />)
    const familyButton = screen.getByText('Family').closest('button')!
    fireEvent.click(familyButton)
    expect(familyButton.className).toContain('border-accent')

    // Previous selection should lose highlight
    const intimateButton = screen.getByText('Intimate Partners').closest('button')!
    expect(intimateButton.className).not.toContain('border-accent bg-accent')
  })

  it('calls onSelect with selected mode when submit button clicked', () => {
    const onSelect = vi.fn()
    render(<ContextModePicker {...defaultProps} onSelect={onSelect} />)

    // Select family first
    fireEvent.click(screen.getByText('Family').closest('button')!)

    // Click submit
    const submitButton = screen.getByRole('button', { name: /start remote session/i })
    fireEvent.click(submitButton)
    expect(onSelect).toHaveBeenCalledWith('family')
  })

  it('shows "Creating session..." when loading', () => {
    render(<ContextModePicker {...defaultProps} loading={true} />)
    expect(screen.getByText('Creating session...')).toBeInTheDocument()
  })

  it('disables submit button when loading', () => {
    render(<ContextModePicker {...defaultProps} loading={true} />)
    const submitBtn = screen.getByText('Creating session...')
    expect(submitBtn).toBeDisabled()
  })

  it('shows "Start in-person session" for in_person mode', () => {
    render(<ContextModePicker {...defaultProps} sessionMode="in_person" />)
    expect(screen.getByText('Start in-person session')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<ContextModePicker {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
