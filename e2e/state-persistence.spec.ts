import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

const MOCK_SESSION = {
  id: 'test-persist-session',
  room_code: 'PER001',
  person_a_name: 'Alice',
  person_b_name: 'Bob',
  status: 'active',
  mode: 'remote',
  context_mode: 'intimate',
  onboarding_step: null,
  onboarding_context: { conductorPhase: 'active' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_SESSION_COMPLETED = {
  ...MOCK_SESSION,
  status: 'completed',
}

const MOCK_MESSAGES = [
  {
    id: 'msg-persist-1',
    session_id: 'test-persist-session',
    sender: 'person_a',
    content: 'I need us to talk about what happened yesterday.',
    nvc_analysis: {
      observation: 'Something happened yesterday that needs discussion',
      feeling: 'Concerned',
      need: 'Resolution',
      request: 'Let us talk about it',
      subtext: 'Something is bothering me and I cannot move past it alone.',
      blindSpots: [],
      unmetNeeds: ['Resolution', 'Understanding'],
      nvcTranslation: 'Something happened yesterday that I am still thinking about. I need us to talk through it so I can understand and move forward.',
      emotionalTemperature: 0.45,
    },
    emotional_temperature: 0.45,
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-persist-2',
    session_id: 'test-persist-session',
    sender: 'person_b',
    content: 'I know. I have been thinking about it too.',
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
  },
]

const MOCK_SUMMARY = {
  temperatureArc: 'Started moderate, ended calm.',
  keyMoments: ['Both acknowledged the need to talk'],
  personANeeds: 'Resolution and understanding',
  personBNeeds: 'Time to process',
  personATakeaway: 'Initiating conversation was the right move.',
  personBTakeaway: 'Acknowledging the issue built trust.',
  personAStrength: 'Courage to bring it up.',
  personBStrength: 'Openness to discuss.',
  overallInsight: 'Both were ready to work through it.',
  lensInsights: [],
  resolutionTrajectory: 'De-escalating',
}

/* ─── Route Mocking ─── */

async function mockAPIs(page: Page, options: {
  session?: typeof MOCK_SESSION
  messages?: typeof MOCK_MESSAGES
} = {}) {
  const session = options.session ?? MOCK_SESSION
  const messages = options.messages ?? MOCK_MESSAGES

  await page.route('**/api/sessions/PER001', async (route) => {
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

  await page.route('**/api/messages**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      })
    }
  })

  await page.route('**/api/conductor', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ phase: 'active' }),
    })
  })

  await page.route('**/api/sessions/PER001/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: MOCK_SUMMARY }),
    })
  })

  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })
}

/* ─── Tests ─── */

test.describe('State Persistence', () => {
  test('refreshing page reloads session state', async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/session/PER001')

    // Session should load with both names
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()

    // Reload and verify state persists
    await page.reload()
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()
  })

  test('messages persist across page reload', async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/session/PER001')

    // Messages should be visible
    await expect(page.getByText('I need us to talk about what happened yesterday.').first()).toBeVisible()
    await expect(page.getByText('I know. I have been thinking about it too.').first()).toBeVisible()

    // Reload
    await page.reload()

    // Messages should still be there
    await expect(page.getByText('I need us to talk about what happened yesterday.').first()).toBeVisible()
    await expect(page.getByText('I know. I have been thinking about it too.').first()).toBeVisible()
  })

  test('session status persists as active', async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/session/PER001')

    // Active indicators should be present
    await expect(page.getByText('Your turn').first()).toBeVisible()

    await page.reload()

    // Still active after reload
    await expect(page.getByText('Your turn').first()).toBeVisible()
  })

  test('room code in URL matches session', async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/session/PER001')

    // URL contains the room code
    expect(page.url()).toContain('PER001')

    // Room code is also shown in the UI
    await expect(page.getByText('PER001').first()).toBeVisible()
  })

  test('completed session shows summary on reload', async ({ page }) => {
    await mockAPIs(page, { session: MOCK_SESSION_COMPLETED })
    await page.goto('/session/PER001')

    // Summary should load
    await expect(page.getByText('Temperature Arc').first()).toBeVisible()
    await expect(page.getByText('Both were ready to work through it.').first()).toBeVisible()

    // Reload
    await page.reload()

    // Summary should persist
    await expect(page.getByText('Temperature Arc').first()).toBeVisible()
  })

  test('back button navigation works from session to landing', async ({ page }) => {
    await mockAPIs(page)

    // Go to landing first, then session
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('See the conversation')

    await page.goto('/session/PER001')
    await expect(page.getByText('Alice').first()).toBeVisible()

    // Go back
    await page.goBack()
    await expect(page.locator('h1')).toContainText('See the conversation')
  })
})
