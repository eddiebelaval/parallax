import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionView } from '../SessionView'
import type { Session, Message, MessageSender } from '@/types/database'

// Mock hooks with persistent implementations
const mockCreateSession = vi.fn()
const mockJoinSession = vi.fn()
const mockAdvanceOnboarding = vi.fn()
const mockRefreshSession = vi.fn()
const mockSendMessage = vi.fn()

let mockSessionReturn: { session: Session | null; loading: boolean } = {
  session: null,
  loading: true,
}

vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    ...mockSessionReturn,
    error: null,
    createSession: mockCreateSession,
    joinSession: mockJoinSession,
    advanceOnboarding: mockAdvanceOnboarding,
    refreshSession: mockRefreshSession,
  }),
}))

vi.mock('@/hooks/useMessages', () => ({
  useMessages: () => ({
    messages: [] as Message[],
    sendMessage: mockSendMessage,
    currentTurn: 'person_a' as MessageSender,
  }),
}))

// Mock child components to isolate SessionView logic
vi.mock('../PersonPanel', () => ({
  PersonPanel: ({ name, side }: { name: string; side: string }) => (
    <div data-testid={`person-panel-${side}`}>{name}</div>
  ),
}))

vi.mock('../OrbStrip', () => ({
  OrbStrip: () => <div data-testid="orb-strip">Orb Strip</div>,
}))

vi.mock('../NameEntry', () => ({
  NameEntry: ({ side }: { side: string }) => <div data-testid={`name-entry-${side}`}>Enter name for {side}</div>,
}))

vi.mock('../WaitingState', () => ({
  WaitingState: ({ roomCode }: { roomCode: string }) => <div data-testid="waiting-state">{roomCode}</div>,
}))

vi.mock('../SessionSummary', () => ({
  SessionSummary: () => <div data-testid="session-summary">Summary</div>,
}))

vi.mock('../inperson/XRayGlanceView', () => ({
  XRayGlanceView: () => <div data-testid="xray-view">XRay View</div>,
}))

vi.mock('@/lib/context-modes', () => ({
  CONTEXT_MODE_INFO: {
    intimate: { name: 'Intimate Partners' },
    family: { name: 'Family' },
    professional_peer: { name: 'Professional Peers' },
    professional_hierarchical: { name: 'Professional Hierarchy' },
    transactional: { name: 'Transactional' },
    civil_structural: { name: 'Civil / Structural' },
  },
}))

const mockActiveSession: Session = {
  id: 'sess-1',
  room_code: 'ABC123',
  person_a_name: 'Alice',
  person_b_name: 'Bob',
  status: 'active',
  mode: 'remote',
  context_mode: 'intimate',
  onboarding_step: null,
  onboarding_context: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('SessionView', () => {
  beforeEach(() => {
    mockSessionReturn = { session: null, loading: true }
  })

  it('shows loading state when session is loading', () => {
    mockSessionReturn = { session: null, loading: true }
    const { container } = render(<SessionView roomCode="ABC123" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders remote mode with two PersonPanels when active', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('person-panel-A')).toBeInTheDocument()
    expect(screen.getByTestId('person-panel-B')).toBeInTheDocument()
  })

  it('renders OrbStrip when both joined in remote mode', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('orb-strip')).toBeInTheDocument()
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

  it('shows PersonPanels when session has no person_a_name', () => {
    mockSessionReturn = {
      session: { ...mockActiveSession, person_a_name: null, person_b_name: null, status: 'waiting' },
      loading: false,
    }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByTestId('person-panel-A')).toBeInTheDocument()
  })

  it('shows context mode label when both joined', () => {
    mockSessionReturn = { session: mockActiveSession, loading: false }
    render(<SessionView roomCode="ABC123" />)
    expect(screen.getByText('Intimate Partners')).toBeInTheDocument()
  })
})
