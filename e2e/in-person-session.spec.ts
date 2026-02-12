import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

const MOCK_SESSION_INPERSON_ONBOARDING = {
  id: 'test-ip-session',
  room_code: 'XYZ789',
  person_a_name: null,
  person_b_name: null,
  status: 'active',
  mode: 'in_person',
  context_mode: 'family',
  onboarding_step: 'introductions',
  onboarding_context: { conductorPhase: 'onboarding' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_SESSION_INPERSON_ACTIVE = {
  ...MOCK_SESSION_INPERSON_ONBOARDING,
  person_a_name: 'Maya',
  person_b_name: 'James',
  onboarding_step: 'complete',
  onboarding_context: {
    conductorPhase: 'active',
    stageDescription: 'Discussing household responsibilities',
    goals: ['Understand each other\'s perspective', 'Find common ground'],
  },
}

const MOCK_GREETING_MESSAGE = {
  id: 'msg-greeting',
  session_id: 'test-ip-session',
  sender: 'mediator',
  content: 'Welcome to Parallax. I\'m here to help you both see beneath the surface of this conversation. Who would like to start by sharing what brings you here today?',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_PERSON_A_INTRO = {
  id: 'msg-a-intro',
  session_id: 'test-ip-session',
  sender: 'person_a',
  content: 'I\'m Maya. We\'re here because we keep arguing about who does what around the house.',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_PERSON_B_INTRO = {
  id: 'msg-b-intro',
  session_id: 'test-ip-session',
  sender: 'person_b',
  content: 'I\'m James. I feel like nothing I do is ever enough.',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_SYNTHESIS_MESSAGE = {
  id: 'msg-synthesis',
  session_id: 'test-ip-session',
  sender: 'mediator',
  content: 'Thank you both. Maya, you feel the burden of household tasks falls unevenly. James, you feel your contributions go unnoticed. Let\'s explore that together.',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_ACTIVE_MESSAGE = {
  id: 'msg-active-1',
  session_id: 'test-ip-session',
  sender: 'person_a',
  content: 'I just wish you would see how much I do without me having to ask.',
  nvc_analysis: {
    observation: 'Household tasks are not shared equally',
    feeling: 'Exhausted and unappreciated',
    need: 'Recognition and partnership',
    request: 'Notice and volunteer for tasks proactively',
    subtext: 'I want to feel like a partner, not a manager.',
    blindSpots: ['Assuming partner can\'t see — they may see differently'],
    unmetNeeds: ['Recognition', 'Partnership', 'Equity'],
    nvcTranslation: 'When I handle most of the household tasks, I feel overwhelmed. I need us to be equal partners. Could we create a shared task list together?',
    emotionalTemperature: 0.65,
  },
  emotional_temperature: 0.65,
  created_at: new Date().toISOString(),
}

const MOCK_ISSUES = [
  {
    id: 'issue-1',
    session_id: 'test-ip-session',
    raised_by: 'person_a',
    source_message_id: 'msg-active-1',
    label: 'Unequal household labor',
    description: 'Maya feels the division of household tasks is unfair',
    status: 'unaddressed',
    addressed_by_message_id: null,
    grading_rationale: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'issue-2',
    session_id: 'test-ip-session',
    raised_by: 'person_b',
    source_message_id: 'msg-b-intro',
    label: 'Feeling unappreciated',
    description: 'James feels his efforts are never acknowledged',
    status: 'unaddressed',
    addressed_by_message_id: null,
    grading_rationale: null,
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/* ─── Route Mocking ─── */

async function mockInPersonAPIs(page: Page, options: {
  session?: typeof MOCK_SESSION_INPERSON_ONBOARDING
  messages?: (typeof MOCK_GREETING_MESSAGE)[]
  issues?: typeof MOCK_ISSUES
} = {}) {
  const session = options.session ?? MOCK_SESSION_INPERSON_ONBOARDING
  const messages = options.messages ?? []
  const issues = options.issues ?? []

  // POST /api/sessions — create in-person session
  await page.route('**/api/sessions', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION_INPERSON_ONBOARDING),
      })
    }
  })

  // GET /api/sessions/[code]
  await page.route('**/api/sessions/XYZ789', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(session),
      })
    } else {
      await route.continue()
    }
  })

  // GET/POST /api/messages
  await page.route('**/api/messages**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      })
    } else if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `msg-${Date.now()}`,
          session_id: 'test-ip-session',
          sender: body.sender,
          content: body.content,
          nvc_analysis: null,
          emotional_temperature: null,
          created_at: new Date().toISOString(),
        }),
      })
    }
  })

  // POST /api/conductor
  await page.route('**/api/conductor', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ directed_to: 'person_a', phase: 'onboarding' }),
    })
  })

  // POST /api/mediate
  await page.route('**/api/mediate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  // POST /api/issues/analyze
  await page.route('**/api/issues/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ issues: issues }),
    })
  })

  // GET /api/issues (query param session_id)
  await page.route('**/api/issues**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(issues),
    })
  })

  // POST /api/sessions/[code]/end
  await page.route('**/api/sessions/XYZ789/end', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...session, status: 'completed' }),
    })
  })

  // POST /api/sessions/[code]/summary
  await page.route('**/api/sessions/XYZ789/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: {
          temperatureArc: 'Moderate to calm',
          keyMoments: ['Maya named the core issue', 'James acknowledged the imbalance'],
          personANeeds: 'Partnership',
          personBNeeds: 'Recognition',
          personATakeaway: 'Specific asks work better than broad frustration.',
          personBTakeaway: 'Acknowledging effort validates Maya.',
          personAStrength: 'Directness',
          personBStrength: 'Willingness to listen',
          overallInsight: 'Both want the same thing: a team.',
          lensInsights: [],
          resolutionTrajectory: 'De-escalating',
        },
      }),
    })
  })

  // Suppress Supabase realtime
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })
}

/* ─── Tests ─── */

test.describe('In-Person Session Flow', () => {
  test('create in-person session from landing page', async ({ page }) => {
    await page.route('**/api/sessions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION_INPERSON_ONBOARDING),
        })
      }
    })

    await page.goto('/')
    const inPersonButton = page.locator('button').filter({ hasText: 'In-Person' }).first()
    await inPersonButton.click()

    // Context mode picker appears
    await expect(page.getByText('What kind of conflict is this?')).toBeVisible()

    // Select Family context and start
    await page.getByText('Family').first().click()
    await page.getByRole('button', { name: /Start in-person session/i }).click()

    await page.waitForURL('**/session/XYZ789')
  })

  test('in-person view shows XRayGlanceView with conductor greeting', async ({ page }) => {
    await mockInPersonAPIs(page, {
      messages: [MOCK_GREETING_MESSAGE],
    })
    await page.goto('/session/XYZ789')

    // Should show the greeting from Parallax
    await expect(page.getByText('Welcome to Parallax').first()).toBeVisible()
    // Sender label should show "Parallax"
    await expect(page.getByText('Parallax').first()).toBeVisible()
  })

  test('person A introduces themselves', async ({ page }) => {
    await mockInPersonAPIs(page, {
      messages: [MOCK_GREETING_MESSAGE, MOCK_PERSON_A_INTRO],
    })
    await page.goto('/session/XYZ789')

    await expect(page.getByText("I'm Maya").first()).toBeVisible()
  })

  test('person B introduces themselves', async ({ page }) => {
    await mockInPersonAPIs(page, {
      messages: [MOCK_GREETING_MESSAGE, MOCK_PERSON_A_INTRO, MOCK_PERSON_B_INTRO],
    })
    await page.goto('/session/XYZ789')

    await expect(page.getByText("I'm James").first()).toBeVisible()
  })

  test('conductor synthesizes and shows mediator message', async ({ page }) => {
    await mockInPersonAPIs(page, {
      messages: [
        MOCK_GREETING_MESSAGE,
        MOCK_PERSON_A_INTRO,
        MOCK_PERSON_B_INTRO,
        MOCK_SYNTHESIS_MESSAGE,
      ],
    })
    await page.goto('/session/XYZ789')

    await expect(page.getByText('Thank you both').first()).toBeVisible()
  })

  test('active phase shows message input available', async ({ page }) => {
    await mockInPersonAPIs(page, {
      session: MOCK_SESSION_INPERSON_ACTIVE,
      messages: [MOCK_GREETING_MESSAGE, MOCK_PERSON_A_INTRO, MOCK_PERSON_B_INTRO, MOCK_SYNTHESIS_MESSAGE],
    })
    await page.goto('/session/XYZ789')

    // ActiveSpeakerBar should have a voice "Tap to talk" or text input
    const tapToTalk = page.getByText('Tap to talk')
    const textInput = page.getByPlaceholder(/speak your truth/i)
    // One of these should be visible depending on mode
    const voiceVisible = await tapToTalk.isVisible().catch(() => false)
    const textVisible = await textInput.isVisible().catch(() => false)
    expect(voiceVisible || textVisible).toBe(true)
  })

  test('active phase shows speaker turn indicator', async ({ page }) => {
    await mockInPersonAPIs(page, {
      session: MOCK_SESSION_INPERSON_ACTIVE,
      messages: [MOCK_SYNTHESIS_MESSAGE, MOCK_ACTIVE_MESSAGE],
    })
    await page.goto('/session/XYZ789')

    // Active speaker name should be visible in the header area
    const speakerIndicator = page.locator('.font-mono.uppercase').filter({ hasText: /Maya|James/ })
    await expect(speakerIndicator.first()).toBeVisible()
  })

  test('issue cards appear as issues are extracted', async ({ page }) => {
    await mockInPersonAPIs(page, {
      session: MOCK_SESSION_INPERSON_ACTIVE,
      messages: [MOCK_SYNTHESIS_MESSAGE, MOCK_ACTIVE_MESSAGE],
      issues: MOCK_ISSUES,
    })
    await page.goto('/session/XYZ789')

    // Issues button should show count
    // On desktop, issues button is visible
    const issuesButton = page.getByText(/Issues/i).first()
    await expect(issuesButton).toBeVisible()
  })

  test('XRay view shows end session button', async ({ page }) => {
    await mockInPersonAPIs(page, {
      session: MOCK_SESSION_INPERSON_ACTIVE,
      messages: [MOCK_SYNTHESIS_MESSAGE],
    })
    await page.goto('/session/XYZ789')

    await expect(page.getByRole('button', { name: /End/i }).first()).toBeVisible()
  })

  test('in-person completed session shows summary', async ({ page }) => {
    const completedSession = {
      ...MOCK_SESSION_INPERSON_ACTIVE,
      status: 'completed' as const,
    }
    await mockInPersonAPIs(page, {
      session: completedSession,
      messages: [MOCK_SYNTHESIS_MESSAGE, MOCK_ACTIVE_MESSAGE],
    })
    await page.goto('/session/XYZ789')

    // Summary should show since session is completed
    await expect(page.getByText('Temperature Arc').first()).toBeVisible()
    await expect(page.getByText('Both want the same thing').first()).toBeVisible()
  })
})
