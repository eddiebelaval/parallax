import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SessionSummary } from '../SessionSummary'
import type { SessionSummaryData } from '@/types/database'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/export-html', () => ({
  buildSessionSummaryHtml: vi.fn(() => '<html></html>'),
}))

function makeSummaryData(overrides: Partial<SessionSummaryData> = {}): SessionSummaryData {
  return {
    temperatureArc: 'Started hot, cooled down',
    keyMoments: ['Breakthrough at turn 5', 'Acknowledgment of feelings'],
    personANeeds: 'To feel heard and valued',
    personBNeeds: 'Clarity and respect',
    personATakeaway: 'Listen before responding',
    personBTakeaway: 'Express needs directly',
    personAStrength: 'Showed vulnerability',
    personBStrength: 'Stayed engaged despite frustration',
    overallInsight: 'Both partners need to feel heard',
    lensInsights: ['Gottman: No horsemen detected', 'Attachment: secure base'],
    resolutionTrajectory: 'De-escalating over the conversation',
    ...overrides,
  }
}

describe('SessionSummary', () => {
  beforeEach(() => {
    vi.mocked(globalThis.fetch).mockReset()
  })

  it('shows loading state initially', () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {})) // never resolves
    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)
    expect(screen.getByText('Generating summary...')).toBeInTheDocument()
  })

  it('renders summary data after successful fetch', async () => {
    const summaryData = makeSummaryData()
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ summary: summaryData }), { status: 200 })
    )

    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)

    await waitFor(() => {
      expect(screen.getByText('Both partners need to feel heard')).toBeInTheDocument()
    })
    expect(screen.getByText('Started hot, cooled down')).toBeInTheDocument()
    expect(screen.getByText('Breakthrough at turn 5')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows person-specific sections', async () => {
    const summaryData = makeSummaryData()
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ summary: summaryData }), { status: 200 })
    )

    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)

    await waitFor(() => {
      expect(screen.getByText('To feel heard and valued')).toBeInTheDocument()
    })
    expect(screen.getByText('Clarity and respect')).toBeInTheDocument()
    expect(screen.getByText('Listen before responding')).toBeInTheDocument()
    expect(screen.getByText('Express needs directly')).toBeInTheDocument()
    expect(screen.getByText('Showed vulnerability')).toBeInTheDocument()
    expect(screen.getByText('Stayed engaged despite frustration')).toBeInTheDocument()
  })

  it('shows lens insights and resolution trajectory', async () => {
    const summaryData = makeSummaryData()
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ summary: summaryData }), { status: 200 })
    )

    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)

    await waitFor(() => {
      expect(screen.getByText('Gottman: No horsemen detected')).toBeInTheDocument()
    })
    expect(screen.getByText('Attachment: secure base')).toBeInTheDocument()
    expect(screen.getByText('De-escalating over the conversation')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)

    await waitFor(() => {
      expect(screen.getByText('Failed to generate summary')).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows error state on non-OK response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
    )

    render(<SessionSummary roomCode="ABC123" personAName="Alice" personBName="Bob" />)

    await waitFor(() => {
      expect(screen.getByText('Failed to generate summary')).toBeInTheDocument()
    })
    expect(screen.getByText('Session not found')).toBeInTheDocument()
  })
})
