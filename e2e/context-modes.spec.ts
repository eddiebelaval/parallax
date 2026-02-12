import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

function makeSession(contextMode: string) {
  return {
    id: 'test-ctx-session',
    room_code: 'CTX001',
    person_a_name: 'Alice',
    person_b_name: 'Bob',
    status: 'active',
    mode: 'remote',
    context_mode: contextMode,
    onboarding_step: null,
    onboarding_context: { conductorPhase: 'active' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function mockSessionWithContext(page: Page, contextMode: string) {
  const session = makeSession(contextMode)

  await page.route('**/api/sessions/CTX001', async (route) => {
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
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
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
}

/* ─── Tests ─── */

test.describe('Context Modes', () => {
  test('all 6 context modes are displayed on creation flow', async ({ page }) => {
    await page.goto('/')

    // Click Remote to trigger context mode picker
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // All 6 modes should be visible
    await expect(page.getByText('Intimate Partners')).toBeVisible()
    await expect(page.getByText('Family')).toBeVisible()
    await expect(page.getByText('Professional Peers')).toBeVisible()
    await expect(page.getByText('Professional Hierarchy')).toBeVisible()
    await expect(page.getByText('Transactional')).toBeVisible()
    await expect(page.getByText('Civil / Structural')).toBeVisible()
  })

  test('context modes are grouped into Personal, Professional, Formal', async ({ page }) => {
    await page.goto('/')
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    await expect(page.getByText('Personal').first()).toBeVisible()
    await expect(page.getByText('Professional').first()).toBeVisible()
    await expect(page.getByText('Formal').first()).toBeVisible()
  })

  test('selecting a context mode highlights it', async ({ page }) => {
    await page.goto('/')
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // Click "Professional Peers" mode
    await page.getByText('Professional Peers').click()

    // The selected button should have the accent border class
    const selectedButton = page.locator('button').filter({ hasText: 'Professional Peers' })
    await expect(selectedButton).toHaveClass(/border-accent/)
  })

  test('session created with selected context mode', async ({ page }) => {
    let capturedBody: string | null = null

    await page.route('**/api/sessions', async (route) => {
      if (route.request().method() === 'POST') {
        capturedBody = route.request().postData()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-ctx-session',
            room_code: 'CTX001',
            person_a_name: 'Alice',
            person_b_name: null,
            status: 'waiting',
            mode: 'remote',
            context_mode: 'professional_peer',
            onboarding_step: null,
            onboarding_context: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.goto('/')
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // Select Professional Peers
    await page.getByText('Professional Peers').click()
    await page.getByRole('button', { name: /Start remote session/i }).click()

    // Verify the POST body includes the right context mode
    expect(capturedBody).toBeTruthy()
    const parsed = JSON.parse(capturedBody!)
    expect(parsed.context_mode).toBe('professional_peer')
  })

  test('mode name shown in session view', async ({ page }) => {
    await mockSessionWithContext(page, 'professional_peer')
    await page.goto('/session/CTX001')

    await expect(page.getByText('Professional Peers').first()).toBeVisible()
  })

  test('default mode is intimate if none selected', async ({ page }) => {
    await page.goto('/')
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // "Intimate Partners" should have the selected styling by default
    const intimateButton = page.locator('button').filter({ hasText: 'Intimate Partners' })
    await expect(intimateButton).toHaveClass(/border-accent/)
  })
})
