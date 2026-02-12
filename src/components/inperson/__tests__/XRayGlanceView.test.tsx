import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { XRayGlanceView } from '../XRayGlanceView'
import type { Session, Message, Issue } from '@/types/database'

// Track mock return values
let mockMessages: Message[] = []
let mockMessagesLoading = false

// Mock all hooks
vi.mock('@/hooks/useMessages', () => ({
  useMessages: () => ({
    messages: mockMessages,
    loading: mockMessagesLoading,
    sendMessage: vi.fn(),
    currentTurn: 'person_a',
    refreshMessages: vi.fn(),
  }),
}))

vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    session: null,
    refreshSession: vi.fn(),
  }),
}))

vi.mock('@/hooks/useIssues', () => ({
  useIssues: () => ({
    personAIssues: [] as Issue[],
    personBIssues: [] as Issue[],
    refreshIssues: vi.fn(),
    updateIssueStatus: vi.fn(),
  }),
}))

vi.mock('@/hooks/useParallaxVoice', () => ({
  useParallaxVoice: () => ({
    speak: vi.fn(),
    isSpeaking: false,
    cancel: vi.fn(),
  }),
}))

// Mock child components
vi.mock('../ParallaxPresence', () => ({
  ParallaxPresence: () => <div data-testid="parallax-presence">Presence</div>,
}))

vi.mock('../SignalCard', () => ({
  SignalCard: () => <div data-testid="signal-card">Signal</div>,
}))

vi.mock('../ActionPanel', () => ({
  ActionPanel: ({ personName }: { personName: string }) => (
    <div data-testid={`action-panel-${personName}`}>Actions for {personName}</div>
  ),
}))

vi.mock('../IssueDrawer', () => ({
  IssueDrawer: ({ open }: { open: boolean }) => (
    open ? <div data-testid="issue-drawer">Drawer</div> : null
  ),
}))

vi.mock('../ActiveSpeakerBar', () => ({
  ActiveSpeakerBar: ({ activeSpeakerName }: { activeSpeakerName: string }) => (
    <div data-testid="active-speaker-bar">{activeSpeakerName}</div>
  ),
}))

const mockSession: Session = {
  id: 'sess-1',
  room_code: 'XYZ789',
  person_a_name: 'Alice',
  person_b_name: 'Bob',
  status: 'active',
  mode: 'in_person',
  context_mode: 'intimate',
  onboarding_step: null,
  onboarding_context: { conductorPhase: 'active' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('XRayGlanceView', () => {
  beforeEach(() => {
    mockMessages = []
    mockMessagesLoading = false
    vi.mocked(globalThis.fetch).mockReset()
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    )
  })

  it('renders room code in header', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    expect(screen.getByText('XYZ789')).toBeInTheDocument()
  })

  it('shows End button', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('renders ParallaxPresence component', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    expect(screen.getByTestId('parallax-presence')).toBeInTheDocument()
  })

  it('renders ActiveSpeakerBar', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    expect(screen.getByTestId('active-speaker-bar')).toBeInTheDocument()
  })

  it('shows Issues button in active phase', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    // Issues button exists (might have count suffix)
    const issuesButton = screen.getByText('Issues')
    expect(issuesButton).toBeInTheDocument()
  })

  it('renders messages in the center column', () => {
    mockMessages = [{
      id: 'msg-1',
      session_id: 'sess-1',
      sender: 'person_a',
      content: 'I feel frustrated',
      nvc_analysis: null,
      emotional_temperature: null,
      created_at: new Date().toISOString(),
    }]

    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    expect(screen.getByText('I feel frustrated')).toBeInTheDocument()
  })

  it('hides Issues button during onboarding phase', () => {
    const onboardingSession = {
      ...mockSession,
      onboarding_context: { conductorPhase: 'onboarding' as const },
    }
    render(<XRayGlanceView session={onboardingSession} roomCode="XYZ789" />)
    expect(screen.queryByText('Issues')).not.toBeInTheDocument()
  })

  it('renders action panels for both people', () => {
    render(<XRayGlanceView session={mockSession} roomCode="XYZ789" />)
    // Action panels are in the desktop sidebar (hidden md:block but still rendered)
    expect(screen.getAllByTestId(/action-panel-/).length).toBeGreaterThanOrEqual(2)
  })
})
