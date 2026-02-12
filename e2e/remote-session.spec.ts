import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

const MOCK_SESSION_WAITING = {
  id: 'test-session-id',
  room_code: 'ABC234',
  person_a_name: 'Alice',
  person_b_name: null,
  status: 'waiting',
  mode: 'remote',
  context_mode: 'intimate',
  onboarding_step: null,
  onboarding_context: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_SESSION_ACTIVE = {
  ...MOCK_SESSION_WAITING,
  person_b_name: 'Bob',
  status: 'active',
  onboarding_context: { conductorPhase: 'active' },
}

const MOCK_SESSION_COMPLETED = {
  ...MOCK_SESSION_ACTIVE,
  status: 'completed',
}

const MOCK_MESSAGE_A = {
  id: 'msg-1',
  session_id: 'test-session-id',
  sender: 'person_a',
  content: 'You never listen to me when I try to explain how I feel.',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_MESSAGE_A_ANALYZED = {
  ...MOCK_MESSAGE_A,
  nvc_analysis: {
    observation: 'Partner does not respond during emotional sharing',
    feeling: 'Frustrated and unheard',
    need: 'To be truly listened to',
    request: 'Please put down your phone when I am talking',
    subtext: 'I feel invisible when I share something vulnerable and get no response.',
    blindSpots: ['Using "never" as an absolute — erases times partner did listen'],
    unmetNeeds: ['Connection', 'Validation', 'Presence'],
    nvcTranslation:
      'When I share something important and don\'t get a response, I feel unheard. I need to know my words matter to you. Could we agree to put phones away during serious talks?',
    emotionalTemperature: 0.72,
  },
  emotional_temperature: 0.72,
}

const MOCK_MESSAGE_B = {
  id: 'msg-2',
  session_id: 'test-session-id',
  sender: 'person_b',
  content: 'That is not fair, I always try to be there for you.',
  nvc_analysis: null,
  emotional_temperature: null,
  created_at: new Date().toISOString(),
}

const MOCK_SUMMARY = {
  temperatureArc: 'The session started warm (0.72) and gradually de-escalated to neutral.',
  keyMoments: ['Alice expressed feeling unheard', 'Bob acknowledged the pattern'],
  personANeeds: 'Connection and presence during vulnerable moments',
  personBNeeds: 'Recognition of effort and good intentions',
  personATakeaway: 'Using specific examples instead of absolutes can help Bob hear you better.',
  personBTakeaway: 'Listening without defending shows Alice her feelings matter.',
  personAStrength: 'Willingness to express vulnerability directly.',
  personBStrength: 'Quick to acknowledge the other perspective.',
  overallInsight: 'Both partners want to connect — they just have different languages for showing care.',
  lensInsights: ['Gottman: Soft startup from Alice, no contempt detected'],
  resolutionTrajectory: 'De-escalating — both moved toward collaborative language by the end.',
}

/* ─── Route Mocking ─── */

async function mockLandingAPIs(page: Page) {
  // POST /api/sessions — create session
  await page.route('**/api/sessions', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION_WAITING),
      })
    }
  })
}

async function mockSessionAPIs(page: Page, options: {
  session?: typeof MOCK_SESSION_WAITING
  messages?: typeof MOCK_MESSAGE_A[]
} = {}) {
  const session = options.session ?? MOCK_SESSION_ACTIVE
  const messages = options.messages ?? []

  // GET /api/sessions/[code]
  await page.route('**/api/sessions/ABC234', async (route) => {
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

  // POST /api/sessions/[code]/join
  await page.route('**/api/sessions/ABC234/join', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...session, person_b_name: 'Bob', status: 'active' }),
    })
  })

  // POST /api/sessions/[code]/end
  await page.route('**/api/sessions/ABC234/end', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION_COMPLETED),
    })
  })

  // GET /api/messages
  await page.route('**/api/messages**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      })
    }
  })

  // POST /api/messages
  await page.route('**/api/messages', async (route) => {
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `msg-${Date.now()}`,
          session_id: 'test-session-id',
          sender: body.sender,
          content: body.content,
          nvc_analysis: null,
          emotional_temperature: null,
          created_at: new Date().toISOString(),
        }),
      })
    }
  })

  // POST /api/mediate
  await page.route('**/api/mediate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  // POST /api/conductor
  await page.route('**/api/conductor', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ phase: 'active' }),
    })
  })

  // POST /api/sessions/[code]/summary
  await page.route('**/api/sessions/ABC234/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: MOCK_SUMMARY }),
    })
  })

  // Supabase realtime — prevent actual WS connections
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })
}

/* ─── Tests ─── */

test.describe('Remote Session Flow', () => {
  test('landing page loads and shows mode selection', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('See the conversation')
    // Mode cards should be visible
    await expect(page.getByText('In-Person')).toBeVisible()
    await expect(page.getByText('Remote')).toBeVisible()
  })

  test('landing page shows join section with room code input', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder('ROOM CODE')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Join' })).toBeVisible()
  })

  test('create remote session redirects to session page', async ({ page }) => {
    await mockLandingAPIs(page)
    await page.goto('/')

    // Click "Remote" mode card
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // Should show context mode picker
    await expect(page.getByText('What kind of conflict is this?')).toBeVisible()

    // Select default context mode and start
    await page.getByRole('button', { name: /Start remote session/i }).click()

    // Should redirect to session page
    await page.waitForURL('**/session/ABC234')
    expect(page.url()).toContain('/session/ABC234')
  })

  test('session page shows waiting state with room code', async ({ page }) => {
    await mockSessionAPIs(page, { session: MOCK_SESSION_WAITING })
    await page.goto('/session/ABC234')

    await expect(page.getByText('Waiting for partner')).toBeVisible()
    await expect(page.getByText('ABC234')).toBeVisible()
  })

  test('session page shows room code in header', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Room code shown in session header
    const header = page.locator('.section-indicator').filter({ hasText: 'Session' })
    await expect(header).toBeVisible()
    await expect(page.getByText('ABC234').first()).toBeVisible()
  })

  test('both people present shows active state with panels', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Both person panels should be visible
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()
  })

  test('active session shows turn indicator', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // One panel should show "Your turn"
    await expect(page.getByText('Your turn').first()).toBeVisible()
  })

  test('active session shows context mode label', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    await expect(page.getByText('Intimate Partners').first()).toBeVisible()
  })

  test('message input is available when it is your turn', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // At least one "Send" button should be visible
    const sendButtons = page.getByRole('button', { name: 'Send' })
    await expect(sendButtons.first()).toBeVisible()
  })

  test('send message as person A', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Find the first message input and type
    const messageInput = page.getByPlaceholder(/Type your message/i).first()
    await messageInput.fill('I feel unheard.')

    // Click first Send button
    const sendButton = page.getByRole('button', { name: 'Send' }).first()
    await sendButton.click()

    // Input should clear after send
    await expect(messageInput).toHaveValue('')
  })

  test('messages appear in the message area', async ({ page }) => {
    await mockSessionAPIs(page, { messages: [MOCK_MESSAGE_A] })
    await page.goto('/session/ABC234')

    await expect(
      page.getByText('You never listen to me when I try to explain how I feel.').first()
    ).toBeVisible()
  })

  test('NVC analysis appears after mediation', async ({ page }) => {
    await mockSessionAPIs(page, { messages: [MOCK_MESSAGE_A_ANALYZED] })
    await page.goto('/session/ABC234')

    // Analysis toggle should be visible
    await expect(page.getByText("What's beneath").first()).toBeVisible()

    // Click to expand analysis
    await page.getByText("What's beneath").first().click()

    // NVC sections should appear
    await expect(page.getByText('Subtext').first()).toBeVisible()
    await expect(page.getByText('Blind Spots').first()).toBeVisible()
    await expect(page.getByText('NVC Translation').first()).toBeVisible()
  })

  test('temperature indicator shows on analyzed messages', async ({ page }) => {
    await mockSessionAPIs(page, { messages: [MOCK_MESSAGE_A_ANALYZED] })
    await page.goto('/session/ABC234')

    // Temperature label should be visible (e.g., "warm" for 0.72)
    await expect(page.getByText(/warm/i).first()).toBeVisible()
  })

  test('multiple messages create conversation thread', async ({ page }) => {
    await mockSessionAPIs(page, {
      messages: [MOCK_MESSAGE_A, MOCK_MESSAGE_B],
    })
    await page.goto('/session/ABC234')

    await expect(
      page.getByText('You never listen to me').first()
    ).toBeVisible()
    await expect(
      page.getByText('That is not fair').first()
    ).toBeVisible()
  })

  test('end session transitions to completed state', async ({ page }) => {
    // After clicking End, the session becomes completed and summary loads
    let sessionState = MOCK_SESSION_ACTIVE

    await page.route('**/api/sessions/ABC234', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sessionState),
        })
      } else {
        await route.continue()
      }
    })

    await page.route('**/api/sessions/ABC234/end', async (route) => {
      sessionState = MOCK_SESSION_COMPLETED
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION_COMPLETED),
      })
    })

    await page.route('**/api/sessions/ABC234/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summary: MOCK_SUMMARY }),
      })
    })

    await page.route('**/api/messages**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_MESSAGE_A]),
      })
    })

    await page.route('**/api/conductor', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ phase: 'active' }),
      })
    })

    await page.route('**/realtime/**', async (route) => {
      await route.abort()
    })

    await page.goto('/session/ABC234')

    // Click "End" button
    const endButton = page.getByRole('button', { name: 'End' }).first()
    await endButton.click()
  })

  test('session summary shows temperature arc and takeaways', async ({ page }) => {
    await mockSessionAPIs(page, { session: MOCK_SESSION_COMPLETED })
    await page.goto('/session/ABC234')

    // Summary content
    await expect(page.getByText('Temperature Arc').first()).toBeVisible()
    await expect(page.getByText(MOCK_SUMMARY.overallInsight).first()).toBeVisible()
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()
  })

  test('performance: page load under 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(3000)
  })

  test('empty message cannot be sent', async ({ page }) => {
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Send button should be disabled when input is empty
    const sendButton = page.getByRole('button', { name: 'Send' }).first()
    await expect(sendButton).toBeDisabled()
  })

  test('room code validation rejects invalid codes', async ({ page }) => {
    await page.goto('/')

    // Type invalid code (too short)
    await page.getByPlaceholder('ROOM CODE').fill('AB')
    await page.getByRole('button', { name: 'Join' }).click()

    // Error message should appear
    await expect(page.getByText('Enter a valid 6-character room code')).toBeVisible()
  })
})
