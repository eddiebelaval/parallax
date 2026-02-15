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
  onboarding_context: { conductorPhase: 'waiting_for_b' },
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

  // POST /api/issues/analyze
  await page.route('**/api/issues/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ issues: [] }),
    })
  })

  // GET /api/issues
  await page.route('**/api/issues**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }
  })

  // POST /api/sessions/[code]/summary
  await page.route('**/api/sessions/ABC234/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: MOCK_SUMMARY }),
    })
  })

  // Supabase PostgREST: messages (useMessages fetches from Supabase directly)
  await page.route('**/rest/v1/messages**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      })
    } else {
      await route.continue()
    }
  })

  // Supabase PostgREST: issues (useIssues fetches from Supabase directly)
  await page.route('**/rest/v1/issues**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    } else {
      await route.continue()
    }
  })

  // Supabase realtime — prevent actual WS connections
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })
}

/* ─── Helpers ─── */

/** Set localStorage side identity before page load (must be called before goto) */
async function setRemoteSide(page: Page, roomCode: string, side: 'a' | 'b') {
  await page.addInitScript(
    ({ code, s }: { code: string; s: string }) => {
      localStorage.setItem(`parallax-side-${code}`, s)
    },
    { code: roomCode, s: side },
  )
}

/* ─── Tests ─── */

test.describe('Remote Session Flow', () => {
  test('landing page loads and shows mode selection', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('See the conversation')
    // Mode cards visible in TheDoor section
    await expect(page.getByText('In-Person').first()).toBeVisible()
    await expect(page.getByText('Remote').first()).toBeVisible()
    await expect(page.getByText('Solo').first()).toBeVisible()
  })

  test('remote join flow shows room code input', async ({ page }) => {
    await page.goto('/')

    // Click Remote mode card → intermediate Create/Join choice
    await page.locator('button').filter({ hasText: 'Remote' }).first().click()
    await expect(page.getByText('Create New Session')).toBeVisible()
    await expect(page.getByText('Join Existing Session')).toBeVisible()

    // Click Join Existing Session → room code input
    await page.getByText('Join Existing Session').click()
    await expect(page.getByPlaceholder('ROOM CODE')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Join' })).toBeVisible()
  })

  test('create remote session redirects to session page', async ({ page }) => {
    await mockLandingAPIs(page)
    await page.goto('/')

    // Remote → Create New Session → Context picker → Start
    await page.locator('button').filter({ hasText: 'Remote' }).first().click()
    await page.getByText('Create New Session').click()

    // Context mode picker should appear
    await expect(page.getByText('What kind of conflict is this?')).toBeVisible()

    // Start with default context mode
    await page.getByRole('button', { name: /Start remote session/i }).click()

    // Should redirect to session page
    await page.waitForURL('**/session/ABC234')
    expect(page.url()).toContain('/session/ABC234')
  })

  test('session page shows waiting state with room code', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page, { session: MOCK_SESSION_WAITING })
    await page.goto('/session/ABC234')

    // Waiting message and prominent room code display
    await expect(page.getByText('Waiting for them to join...').first()).toBeVisible()
    await expect(page.getByText('ABC234').first()).toBeVisible()
  })

  test('session page shows room code and context mode in header', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Room code in header
    await expect(page.getByText('ABC234').first()).toBeVisible()
    // Context mode label
    await expect(page.getByText('Intimate Partners').first()).toBeVisible()
  })

  test('both people present shows active state', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith('mobile'), 'person orb labels use hidden md:block')
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Both person names visible in orb labels
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()
  })

  test('message input is available in active session', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // ActiveSpeakerBar renders in one of three modes (auto/voice/text)
    // depending on browser capabilities. Poll until one becomes visible.
    await expect.poll(async () => {
      const tapVisible = await page.getByText('Tap to talk').first().isVisible().catch(() => false)
      const textVisible = await page.getByPlaceholder(/speak your truth/i).first().isVisible().catch(() => false)
      const autoVisible = await page.getByText(/Listening|Waiting|Tap to send/i).first().isVisible().catch(() => false)
      return tapVisible || textVisible || autoVisible
    }, { timeout: 5000 }).toBe(true)
  })

  test('conversation and private coach tabs visible', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // Tabbed input area with Conversation and Private coach
    await expect(page.getByText('Conversation').first()).toBeVisible()
    await expect(page.getByText('Private coach').first()).toBeVisible()
  })

  test('messages appear in the message area', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page, { messages: [MOCK_MESSAGE_A] })
    await page.goto('/session/ABC234')

    await expect(
      page.getByText('You never listen to me when I try to explain how I feel.').first()
    ).toBeVisible()
  })

  test('NVC analysis appears after mediation', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
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
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page, { messages: [MOCK_MESSAGE_A_ANALYZED] })
    await page.goto('/session/ABC234')

    // Temperature 0.72 maps to "hot" (> 0.7 threshold)
    await expect(page.getByText(/hot/i).first()).toBeVisible()
  })

  test('multiple messages create conversation thread', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
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

  test('end session button visible in active session', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // End button only visible during active phase
    await expect(page.getByRole('button', { name: 'End' }).first()).toBeVisible()
  })

  test('phase label shows during onboarding phases', async ({ page }) => {
    const waitingSession = {
      ...MOCK_SESSION_WAITING,
      onboarding_context: { conductorPhase: 'waiting_for_b' },
    }
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page, { session: waitingSession })
    await page.goto('/session/ABC234')

    // Phase label in header: "Waiting for the other person to join"
    await expect(
      page.getByText('Waiting for the other person to join').first()
    ).toBeVisible()
  })

  test('side chooser shown for direct URL visit without side identity', async ({ page }) => {
    // No localStorage set — direct URL visit
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // SideChooser should show
    await expect(page.getByText('How are you joining this conversation?')).toBeVisible()
    await expect(page.getByText('I started this')).toBeVisible()
    await expect(page.getByText('I was invited')).toBeVisible()
  })

  test('performance: page load under 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(3000)
  })

  test('room code validation rejects invalid codes', async ({ page }) => {
    await page.goto('/')

    // Navigate to Remote → Join flow
    await page.locator('button').filter({ hasText: 'Remote' }).first().click()
    await page.getByText('Join Existing Session').click()

    // Type invalid code (too short)
    await page.getByPlaceholder('ROOM CODE').fill('AB')
    await page.getByRole('button', { name: 'Join' }).click()

    // Error message should appear
    await expect(page.getByText('Enter a valid 6-character room code')).toBeVisible()
  })

  test('Ava presence indicator visible in session', async ({ page }) => {
    await setRemoteSide(page, 'ABC234', 'a')
    await mockSessionAPIs(page)
    await page.goto('/session/ABC234')

    // ParallaxPresence renders an SVG orb with the "parallax-orb" animation
    // Check for the SVG canvas or the presence container
    await expect.poll(async () => {
      // Look for any SVG element (the orb) or canvas in the presence section
      const svg = await page.locator('svg').first().isVisible().catch(() => false)
      const canvas = await page.locator('canvas').first().isVisible().catch(() => false)
      return svg || canvas
    }, { timeout: 5000 }).toBe(true)
  })
})
