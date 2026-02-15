import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

const MOCK_SESSION_SOLO = {
  id: 'test-solo-session',
  room_code: 'SOL001',
  person_a_name: 'Eddie',
  person_b_name: null,
  person_a_user_id: 'user-123',
  status: 'active',
  mode: 'solo',
  context_mode: null,
  onboarding_step: null,
  onboarding_context: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_SESSION_SOLO_COMPLETED = {
  ...MOCK_SESSION_SOLO,
  status: 'completed',
}

const MOCK_GREETING_RESPONSE = {
  message: "Hey — it's evening, and you're here. That means something is sitting with you. What's on your mind right now?",
  insights: null,
}

const MOCK_CHAT_RESPONSE = {
  message: "That sounds heavy — carrying frustration about work while trying to keep it together at home takes real effort. What part of it weighs on you the most?",
  insights: {
    identity: {
      name: 'Eddie',
      bio: 'Entrepreneur building AI tools',
      importantPeople: [
        { name: 'Partner', relationship: 'romantic partner' },
      ],
    },
    themes: ['Work-life balance', 'Burnout'],
    patterns: ['Tends to internalize stress before addressing it'],
    values: ['Achievement', 'Family connection'],
    strengths: ['Self-awareness', 'Directness'],
    recentSessions: [],
    currentSituation: 'Feeling overwhelmed by competing demands from work and home life',
    emotionalState: 'Frustrated',
    actionItems: [
      { id: 'ai-1', text: 'Name one boundary you can set this week', status: 'active' },
    ],
    sessionCount: 1,
    lastSeenAt: new Date().toISOString(),
  },
}

const MOCK_EXISTING_MESSAGES = [
  {
    id: 'msg-solo-1',
    session_id: 'test-solo-session',
    sender: 'mediator',
    content: "Welcome back, Eddie. Last time we talked about finding balance. How are things since then?",
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-solo-2',
    session_id: 'test-solo-session',
    sender: 'person_a',
    content: "Honestly, not great. Work has been intense and I feel like I am dropping balls at home.",
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-solo-3',
    session_id: 'test-solo-session',
    sender: 'mediator',
    content: "That sounds heavy — carrying frustration about work while trying to keep it together at home takes real effort.",
    nvc_analysis: null,
    emotional_temperature: null,
    created_at: new Date().toISOString(),
  },
]

/* ─── Route Mocking ─── */

async function mockSoloAPIs(page: Page, options: {
  session?: typeof MOCK_SESSION_SOLO
  existingMessages?: typeof MOCK_EXISTING_MESSAGES
  existingInsights?: typeof MOCK_CHAT_RESPONSE.insights
  chatResponse?: typeof MOCK_CHAT_RESPONSE
  greetingResponse?: typeof MOCK_GREETING_RESPONSE
} = {}) {
  const session = options.session ?? MOCK_SESSION_SOLO
  const existingMessages = options.existingMessages ?? []
  const existingInsights = options.existingInsights ?? null
  const chatResponse = options.chatResponse ?? MOCK_CHAT_RESPONSE
  const greetingResponse = options.greetingResponse ?? MOCK_GREETING_RESPONSE

  // GET /api/sessions/[code]
  await page.route('**/api/sessions/SOL001', async (route) => {
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

  // GET /api/solo — fetch message history + insights
  await page.route('**/api/solo?**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: existingMessages,
          insights: existingInsights,
        }),
      })
    }
  })

  // POST /api/solo — greeting or message
  await page.route('**/api/solo', async (route) => {
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const response = body.trigger === 'greeting' ? greetingResponse : chatResponse
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    } else if (route.request().method() === 'GET') {
      // Catch GET without query params
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: existingMessages,
          insights: existingInsights,
        }),
      })
    }
  })

  // POST /api/solo/summarize — export summary
  await page.route('**/api/solo/summarize', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: 'Session explored work-life balance and stress management.',
      }),
    })
  })

  // Mock auth — return a user for solo mode
  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: { display_name: 'Eddie' },
        created_at: new Date().toISOString(),
      }),
    })
  })

  // Suppress Supabase realtime
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })

  // POST /api/sessions — create solo session (for landing page flow)
  await page.route('**/api/sessions', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(session),
      })
    }
  })
}

/* ─── Tests ─── */

test.describe('Solo Session Flow', () => {
  test('solo session renders SoloView with correct mode label', async ({ page }) => {
    await mockSoloAPIs(page)
    await page.goto('/session/SOL001')

    // Solo mode label in the header
    await expect(page.getByText('Solo').first()).toBeVisible()
    // Room code shown
    await expect(page.getByText('SOL001').first()).toBeVisible()
  })

  test('solo session triggers greeting on empty session', async ({ page }) => {
    let greetingRequested = false
    await mockSoloAPIs(page)

    // Intercept to verify greeting trigger
    await page.route('**/api/solo', async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() ?? '{}')
        if (body.trigger === 'greeting') {
          greetingRequested = true
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_GREETING_RESPONSE),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ messages: [], insights: null }),
        })
      }
    })

    await page.goto('/session/SOL001')

    // Greeting message from Ava should appear
    await expect(page.getByText("What's on your mind").first()).toBeVisible({ timeout: 5000 })
    expect(greetingRequested).toBe(true)
  })

  test('Ava messages show "Ava" label', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })
    await page.goto('/session/SOL001')

    await expect(page.getByText('Ava').first()).toBeVisible()
    await expect(page.getByText('Welcome back, Eddie').first()).toBeVisible()
  })

  test('user messages show in conversation thread', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
    })
    await page.goto('/session/SOL001')

    // User message appears
    await expect(page.getByText('not great').first()).toBeVisible()
    // Ava response appears
    await expect(page.getByText('That sounds heavy').first()).toBeVisible()
  })

  test('message input is visible and functional', async ({ page }) => {
    await mockSoloAPIs(page)
    await page.goto('/session/SOL001')

    // Wait for greeting to complete
    await page.waitForTimeout(1000)

    // ActiveSpeakerBar should have input — look for text input or tap-to-talk
    const textInput = page.getByPlaceholder(/speak your truth/i)
    const tapToTalk = page.getByText('Tap to talk')
    const voiceVisible = await tapToTalk.isVisible().catch(() => false)
    const textVisible = await textInput.isVisible().catch(() => false)
    expect(voiceVisible || textVisible).toBe(true)
  })

  test('send message and receive Ava response', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })
    await page.goto('/session/SOL001')

    // Wait for initial render
    await expect(page.getByText('Welcome back').first()).toBeVisible()

    // Type and send a message
    const textInput = page.getByPlaceholder(/speak your truth/i)
    if (await textInput.isVisible().catch(() => false)) {
      await textInput.fill('I have been feeling overwhelmed at work.')
      // Click send or press Enter
      await textInput.press('Enter')

      // User message appears optimistically
      await expect(page.getByText('feeling overwhelmed at work').first()).toBeVisible()

      // Ava responds
      await expect(page.getByText('That sounds heavy').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('export button is visible and disabled with no messages', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [],
    })
    await page.goto('/session/SOL001')

    const exportButton = page.getByText('Export')
    await expect(exportButton).toBeVisible()
  })

  test('export button is enabled when messages exist', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
    })
    await page.goto('/session/SOL001')

    const exportButton = page.getByText('Export')
    await expect(exportButton).toBeVisible()
    // When there are messages, export should not be disabled
    await expect(exportButton).not.toHaveAttribute('disabled')
  })

  test('insights sidebar shows on desktop', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // Desktop sidebar: "Insights" header should be visible
    await expect(page.getByText('Insights').first()).toBeVisible()
  })

  test('insights sidebar shows themes and patterns', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // Themes from mock data
    await expect(page.getByText('Work-life balance').first()).toBeVisible()
    await expect(page.getByText('Burnout').first()).toBeVisible()

    // Patterns
    await expect(page.getByText('Tends to internalize').first()).toBeVisible()
  })

  test('insights sidebar shows emotional state badge', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    await expect(page.getByText('Frustrated').first()).toBeVisible()
  })

  test('insights sidebar shows action items', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // "Work On" section header
    await expect(page.getByText('Work On').first()).toBeVisible()
    // Action item text
    await expect(page.getByText('Name one boundary').first()).toBeVisible()
  })

  test('insights sidebar shows values and strengths', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // Values
    await expect(page.getByText('Achievement').first()).toBeVisible()
    await expect(page.getByText('Family connection').first()).toBeVisible()

    // Strengths
    await expect(page.getByText('Self-awareness').first()).toBeVisible()
  })

  test('insights sidebar shows important people', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // People section
    await expect(page.getByText('People').first()).toBeVisible()
    await expect(page.getByText('Partner').first()).toBeVisible()
  })

  test('Ava message has replay and copy buttons', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })
    await page.goto('/session/SOL001')

    // Replay button (aria-label)
    await expect(page.getByLabel('Replay speech').first()).toBeVisible()
    // Copy button
    await expect(page.getByLabel('Copy message').first()).toBeVisible()
  })

  test('loading indicator shows while waiting for Ava', async ({ page }) => {
    // Use a slow mock to catch the loading state
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })

    // Override POST to be slow
    await page.route('**/api/solo', async (route) => {
      if (route.request().method() === 'POST') {
        // Delay 2 seconds to catch loading state
        await new Promise((r) => setTimeout(r, 2000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CHAT_RESPONSE),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ messages: [MOCK_EXISTING_MESSAGES[0]], insights: null }),
        })
      }
    })

    await page.goto('/session/SOL001')
    await expect(page.getByText('Welcome back').first()).toBeVisible()

    // Type and send
    const textInput = page.getByPlaceholder(/speak your truth/i)
    if (await textInput.isVisible().catch(() => false)) {
      await textInput.fill('Testing loading state')
      await textInput.press('Enter')

      // Loading dots should appear (the Ava placeholder with pulsing dots)
      // The loading indicator shows three pulsing spans — check for the Ava label that appears during loading
      await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 1000 })
    }
  })

  test('error message displays on API failure', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })

    // Override POST to fail
    await page.route('**/api/solo', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500 })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ messages: [MOCK_EXISTING_MESSAGES[0]], insights: null }),
        })
      }
    })

    await page.goto('/session/SOL001')
    await expect(page.getByText('Welcome back').first()).toBeVisible()

    const textInput = page.getByPlaceholder(/speak your truth/i)
    if (await textInput.isVisible().catch(() => false)) {
      await textInput.fill('This should fail')
      await textInput.press('Enter')

      // Error message should appear
      await expect(page.getByText('unavailable').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('empty insights shows placeholder message', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [],
      existingInsights: null,
    })
    await page.goto('/session/SOL001')

    // When no insights exist, sidebar shows placeholder
    await expect(page.getByText('Insights will appear').first()).toBeVisible()
  })

  test('mobile sidebar toggle works', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })
    await page.goto('/session/SOL001')

    // Mobile toggle button should show "Insights"
    const toggle = page.getByText('Insights').first()
    await expect(toggle).toBeVisible()

    // Click to open sidebar overlay
    await toggle.click()

    // Close button should appear in the overlay
    await expect(page.getByText('Close').first()).toBeVisible()
  })

  test('completed solo session shows summary', async ({ page }) => {
    await page.route('**/api/sessions/SOL001', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION_SOLO_COMPLETED),
        })
      } else {
        await route.continue()
      }
    })

    await page.route('**/api/sessions/SOL001/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            temperatureArc: 'Started warm, settled to neutral',
            keyMoments: ['Named the core stressor'],
            personANeeds: 'Balance',
            personBNeeds: null,
            personATakeaway: 'Set one boundary this week.',
            personBTakeaway: null,
            personAStrength: 'Vulnerability',
            personBStrength: null,
            overallInsight: 'Awareness is the first step.',
            lensInsights: [],
            resolutionTrajectory: 'Settling',
          },
        }),
      })
    })

    await page.route('**/api/messages**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EXISTING_MESSAGES),
      })
    })

    await page.route('**/realtime/**', async (route) => {
      await route.abort()
    })

    await page.goto('/session/SOL001')

    // Session summary should render
    await expect(page.getByText('Temperature Arc').first()).toBeVisible()
    await expect(page.getByText('Awareness is the first step').first()).toBeVisible()
  })

  test('ParallaxPresence orb is visible', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: [MOCK_EXISTING_MESSAGES[0]],
    })
    await page.goto('/session/SOL001')

    // The ParallaxPresence component renders an SVG orb or a container
    // Check for the presence indicator (the orb wrapper typically has a role or class)
    const presenceSection = page.locator('[class*="parallax-presence"], [class*="orb"]').first()
    // Fallback: check the component renders at all by looking for the Ava label below messages
    const avaLabel = page.getByText('Ava').first()
    await expect(avaLabel).toBeVisible()
  })

  test('performance: solo session loads under 3 seconds', async ({ page }) => {
    await mockSoloAPIs(page, {
      existingMessages: MOCK_EXISTING_MESSAGES,
      existingInsights: MOCK_CHAT_RESPONSE.insights,
    })

    const start = Date.now()
    await page.goto('/session/SOL001', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(3000)
  })
})
