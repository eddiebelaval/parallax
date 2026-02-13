import type {
  Session,
  Message,
  Issue,
  NvcAnalysis,
  ConflictAnalysis,
  SessionSummaryData,
  OnboardingContext,
  ContextMode,
} from '@/types/database'

let counter = 0
function uuid(): string {
  counter++
  return `test-uuid-${counter.toString().padStart(4, '0')}`
}

export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: uuid(),
    room_code: 'ABC234',
    person_a_name: 'Alice',
    person_b_name: 'Bob',
    person_a_user_id: null,
    person_b_user_id: null,
    status: 'active',
    mode: 'remote',
    context_mode: 'intimate',
    onboarding_step: 'complete',
    onboarding_context: null,
    timer_duration_ms: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: uuid(),
    session_id: 'test-session-id',
    sender: 'person_a',
    content: 'I feel like you never listen to me.',
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: uuid(),
    session_id: 'test-session-id',
    raised_by: 'person_a',
    source_message_id: 'test-message-id',
    label: 'Communication breakdown',
    description: 'Person A feels unheard during discussions',
    status: 'unaddressed',
    addressed_by_message_id: null,
    grading_rationale: null,
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function makeNvcAnalysis(overrides: Partial<NvcAnalysis> = {}): NvcAnalysis {
  return {
    observation: 'The speaker described feeling ignored during conversations.',
    feeling: 'frustrated and lonely',
    need: 'connection and to be heard',
    request: 'Could you put your phone down when we talk?',
    subtext: 'I miss feeling connected to you.',
    blindSpots: ['May not realize their tone comes across as accusatory'],
    unmetNeeds: ['connection', 'respect', 'presence'],
    nvcTranslation: 'When we talk and I notice you looking at your phone, I feel lonely because I need connection. Would you be willing to put it down during our conversations?',
    emotionalTemperature: 0.65,
    ...overrides,
  }
}

export function makeConflictAnalysis(
  overrides: Partial<ConflictAnalysis> = {},
  contextMode: ContextMode = 'intimate',
): ConflictAnalysis {
  const nvc = makeNvcAnalysis(overrides)
  return {
    ...nvc,
    lenses: {
      nvc,
      gottman: {
        horsemen: [{ type: 'criticism', evidence: 'You never listen' }],
        repairAttempts: [],
        positiveToNegativeRatio: '1:3',
        startupType: 'harsh',
      },
      ...overrides.lenses,
    },
    meta: {
      contextMode,
      activeLenses: ['nvc', 'gottman', 'cbt', 'dramaTriangle', 'attachment', 'narrative'],
      primaryInsight: 'Underlying need for connection masked by accusatory language.',
      overallSeverity: 0.65,
      resolutionDirection: 'stable',
      ...overrides.meta,
    },
    ...overrides,
  }
}

export function makeSessionSummaryData(
  overrides: Partial<SessionSummaryData> = {},
): SessionSummaryData {
  return {
    temperatureArc: 'Started hot (0.8), cooled to warm (0.5) by the end.',
    keyMoments: [
      'Alice acknowledged Bob\'s perspective on household chores',
      'Bob expressed vulnerability about feeling overwhelmed',
    ],
    personANeeds: 'To feel heard and valued in the partnership',
    personBNeeds: 'To feel appreciated and not overwhelmed by expectations',
    personATakeaway: 'Bob is not ignoring you — he is overwhelmed and needs support',
    personBTakeaway: 'Alice\'s frustration comes from love, not criticism',
    personAStrength: 'Willingness to be vulnerable about her feelings',
    personBStrength: 'Openness to hearing feedback without shutting down',
    overallInsight: 'Both partners want the same thing — connection — but are expressing it in ways that push the other away.',
    lensInsights: [
      'Gottman: criticism-defensiveness cycle appeared in 3 of 5 messages',
      'Attachment: anxious-avoidant dynamic with pursue-withdraw pattern',
    ],
    resolutionTrajectory: 'Began escalating, stabilized after message 4, de-escalated by the end.',
    ...overrides,
  }
}

export function makeOnboardingContext(
  overrides: Partial<OnboardingContext> = {},
): OnboardingContext {
  return {
    conductorPhase: 'active',
    personAContext: 'I feel like we never talk anymore',
    personBContext: 'I\'m exhausted from work and need space',
    sessionGoals: [
      'Understand what each person needs around quality time',
      'Find a compromise between togetherness and alone time',
    ],
    contextSummary: 'Alice needs more quality time; Bob needs space to recharge. Both care but express it differently.',
    ...overrides,
  }
}

/** Reset the UUID counter between test suites */
export function resetFixtureCounter(): void {
  counter = 0
}
