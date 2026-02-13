import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionView } from '../SessionView'
import type { Session } from '@/types/database'

// Mock hooks with persistent implementations
let mockSessionReturn: { session: Session | null; loading: boolean } = {
  session: null,
  loading: true,
}

vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    ...mockSessionReturn,
    error: null,
    createSession: vi.fn(),
    joinSession: vi.fn(),
    advanceOnboarding: vi.fn(),
    refreshSession: vi.fn(),
  }),
}))

// Mock child components to isolate SessionView logic
vi.mock('../RemoteView', () => ({
  RemoteView: ({ session, localSide }: { session: Session; localSide: string }) => (
    <div data-testid="remote-view">RemoteView side={localSide} name={session.person_a_name}</div>
  ),
}))

vi.mock('../SoloView', () => ({
  SoloView: () => <div data-testid="solo-view">Solo View</div>,
}))

vi.mock('../SessionSummary', () => ({
  SessionSummary: () => <div data-testid="session-summary">Summary</div>,
}))

vi.mock('../inperson/XRayGlanceView', () => ({
  XRayGlanceView: () => <div data-testid="xray-view">XRay View</div>,
}))

const mockActiveSession: Session = {
  id: 'sess-1',
  room_code: 'ABC123',
  person_a_name: 'Alice',
  person_b_name: 'Bob',
  person_a_user_id: null,
  person_b_user_id: null,
  status: 'active',
  mode: 'remote',
  context_mode: 'intimate',
  onboarding_step: null,
  onboarding_context: null,
  timer_duration_ms: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('SessionView', () => {
  beforeEach(() => {
    mockSessionReturn = { session: null, loading: true }
    // Clear localStorage
    localStorage.clear()
  })

  it('shows loading state when session is loading', () => {
    mockSessionReturn = { session: null, loading: true }
    const { container } = render(<SessionView roomCode="ABC123" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders SideChooser for remote mode without localStorage side', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    // SideChooser shows "How are you joining this conversation?"
    expect(screen.getByText('How are you joining this conversation?')).toBeInTheDocument()
  })

  it('renders RemoteView for remote mode when localSide is set', () => {
    localStorage.setItem('parallax-side-ABC123', 'a')
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('remote-view')).toBeInTheDocument()
  })

  it('renders SessionSummary when session is completed (remote)', () => {
    mockSessionReturn = { session: { ...mockActiveSession, status: 'completed' }, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('session-summary')).toBeInTheDocument()
  })

  it('renders XRayGlanceView for in_person mode', () => {
    mockSessionReturn = { session: { ...mockActiveSession, mode: 'in_person' }, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('xray-view')).toBeInTheDocument()
  })

  it('renders SessionSummary for completed in_person session', () => {
    mockSessionReturn = { session: { ...mockActiveSession, mode: 'in_person', status: 'completed' }, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('session-summary')).toBeInTheDocument()
  })

  it('allows side selection via SideChooser buttons', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    // Click "I started this" to choose side A
    fireEvent.click(screen.getByText('I started this'))
    expect(screen.getByTestId('remote-view')).toBeInTheDocument()
  })

  it('shows session room code in SideChooser', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByText(/ABC123/)).toBeInTheDocument()
  })
})
