import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IssueCard } from '../IssueCard'
import type { Issue } from '@/types/database'

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'issue-1',
    session_id: 'sess-1',
    raised_by: 'person_a',
    source_message_id: 'msg-1',
    label: 'Communication gap',
    description: 'They feel unheard during discussions',
    status: 'unaddressed',
    addressed_by_message_id: null,
    grading_rationale: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('IssueCard', () => {
  it('renders issue label', () => {
    render(<IssueCard issue={makeIssue({ label: 'Trust issue' })} />)
    expect(screen.getByText('Trust issue')).toBeInTheDocument()
  })

  it('renders issue description', () => {
    render(<IssueCard issue={makeIssue({ description: 'Feels left out' })} />)
    expect(screen.getByText('Feels left out')).toBeInTheDocument()
  })

  it('shows status label for unaddressed', () => {
    const { container } = render(<IssueCard issue={makeIssue({ status: 'unaddressed' })} />)
    // The status label is "Unaddressed" in a span at the bottom
    const statusLabels = container.querySelectorAll('.tracking-widest')
    const labelTexts = Array.from(statusLabels).map(el => el.textContent?.trim())
    expect(labelTexts).toContain('Unaddressed')
  })

  it('shows "Addressed" label for well_addressed status', () => {
    render(<IssueCard issue={makeIssue({ status: 'well_addressed' })} />)
    expect(screen.getByText('Addressed')).toBeInTheDocument()
  })

  it('shows "Made worse" label for poorly_addressed status', () => {
    render(<IssueCard issue={makeIssue({ status: 'poorly_addressed' })} />)
    expect(screen.getByText('Made worse')).toBeInTheDocument()
  })

  it('shows grading rationale for non-unaddressed statuses', () => {
    render(
      <IssueCard
        issue={makeIssue({
          status: 'well_addressed',
          grading_rationale: 'Both acknowledged the issue',
        })}
      />
    )
    expect(screen.getByText('Both acknowledged the issue')).toBeInTheDocument()
  })

  it('does not show grading rationale for unaddressed status', () => {
    render(
      <IssueCard
        issue={makeIssue({
          status: 'unaddressed',
          grading_rationale: 'Should not appear',
        })}
      />
    )
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument()
  })

  it('applies correct border class for well_addressed', () => {
    const { container } = render(
      <IssueCard issue={makeIssue({ status: 'well_addressed' })} />
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-success/40')
  })
})
