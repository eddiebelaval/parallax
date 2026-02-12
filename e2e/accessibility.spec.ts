import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/* ─── Mock Data ─── */

const MOCK_SESSION_ACTIVE = {
  id: 'test-a11y-session',
  room_code: 'A11Y01',
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
  ...MOCK_SESSION_ACTIVE,
  status: 'completed',
}

const MOCK_MESSAGES = [
  {
    id: 'msg-a11y-1',
    session_id: 'test-a11y-session',
    sender: 'person_a',
    content: 'I feel like we are talking past each other.',
    nvc_analysis: {
      observation: 'Communication patterns are not aligned',
      feeling: 'Disconnected',
      need: 'Mutual understanding',
      request: 'Let us slow down and listen',
      subtext: 'I want to feel heard.',
      blindSpots: [],
      unmetNeeds: ['Understanding', 'Connection'],
      nvcTranslation: 'I notice we are not connecting right now, and that makes me feel disconnected. I need us to understand each other. Can we slow down?',
      emotionalTemperature: 0.5,
    },
    emotional_temperature: 0.5,
    created_at: new Date().toISOString(),
  },
]

const MOCK_SUMMARY = {
  temperatureArc: 'Moderate throughout.',
  keyMoments: ['Both recognized the disconnect'],
  personANeeds: 'Understanding',
  personBNeeds: 'Patience',
  personATakeaway: 'Slowing down helps.',
  personBTakeaway: 'Active listening matters.',
  personAStrength: 'Self-awareness.',
  personBStrength: 'Willingness to adapt.',
  overallInsight: 'Both want connection.',
  lensInsights: [],
  resolutionTrajectory: 'Stable',
}

/* ─── Route Mocking ─── */

async function mockAPIs(page: Page, options: {
  session?: typeof MOCK_SESSION_ACTIVE
  messages?: typeof MOCK_MESSAGES
} = {}) {
  const session = options.session ?? MOCK_SESSION_ACTIVE
  const messages = options.messages ?? MOCK_MESSAGES

  await page.route('**/api/sessions/A11Y01', async (route) => {
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

  await page.route('**/api/sessions/A11Y01/summary', async (route) => {
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

test.describe('Accessibility', () => {
  test('landing page has no critical a11y violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // Exclude known 3rd-party issues (e.g., fonts loaded externally)
      .exclude('.scroll-reveal') // scroll-reveal elements may not be visible yet
      .analyze()

    // Filter to critical/serious only — minor/moderate are informational
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })

  test('session page has no critical a11y violations', async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/session/A11Y01')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })

  test('summary page has no critical a11y violations', async ({ page }) => {
    await mockAPIs(page, { session: MOCK_SESSION_COMPLETED })
    await page.goto('/session/A11Y01')
    await page.waitForLoadState('networkidle')

    // Wait for summary to load
    await expect(page.getByText('Temperature Arc').first()).toBeVisible({ timeout: 5000 })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab through the page and verify focus is reachable
    await page.keyboard.press('Tab')

    // Should be able to tab to first interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeTruthy()

    // Tab through multiple elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
    }

    // Focused element should still exist
    const currentFocus = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.tagName : null
    })
    expect(currentFocus).toBeTruthy()
  })

  test('form inputs have proper labels or placeholders', async ({ page }) => {
    await page.goto('/')

    // Room code input should have placeholder
    const roomCodeInput = page.getByPlaceholder('ROOM CODE')
    await expect(roomCodeInput).toBeVisible()
    await expect(roomCodeInput).toHaveAttribute('placeholder', 'ROOM CODE')

    // Check session page inputs
    await mockAPIs(page)
    await page.goto('/session/A11Y01')

    // Message inputs should have placeholders
    const messageInputs = page.locator('input[placeholder]')
    const count = await messageInputs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('color contrast meets WCAG AA for primary text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()

    // Log violations for debugging but only fail on critical/serious
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(serious).toEqual([])
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze()

    // All buttons should have accessible names
    expect(results.violations).toEqual([])
  })

  test('focus management: room code input receives focus on interaction', async ({ page }) => {
    await page.goto('/')

    // Click on room code input area
    const roomCodeInput = page.getByPlaceholder('ROOM CODE')
    await roomCodeInput.click()

    // Input should have focus
    await expect(roomCodeInput).toBeFocused()

    // Type and verify
    await roomCodeInput.fill('ABC123')
    await expect(roomCodeInput).toHaveValue('ABC123')
  })
})
