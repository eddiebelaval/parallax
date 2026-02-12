import { test, expect, Page } from '@playwright/test'

/* ─── Helpers ─── */

const MOCK_SESSION_ACTIVE = {
  id: 'test-err-session',
  room_code: 'ERR404',
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

async function mockBaseAPIs(page: Page) {
  await page.route('**/api/messages**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    } else if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `msg-${Date.now()}`,
          session_id: 'test-err-session',
          sender: body.sender,
          content: body.content,
          nvc_analysis: null,
          emotional_temperature: null,
          created_at: new Date().toISOString(),
        }),
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

  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })
}

/* ─── Tests ─── */

test.describe('Error Handling', () => {
  test('invalid room code shows error on landing page', async ({ page }) => {
    await page.goto('/')

    // Enter invalid code (too short)
    await page.getByPlaceholder('ROOM CODE').fill('XY')
    await page.getByRole('button', { name: 'Join' }).click()

    await expect(page.getByText('Enter a valid 6-character room code')).toBeVisible()
  })

  test('network failure on session creation shows error', async ({ page }) => {
    await page.route('**/api/sessions', async (route) => {
      await route.abort('connectionrefused')
    })

    await page.goto('/')

    // Select remote mode
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()

    // Start session — should fail
    await page.getByRole('button', { name: /Start remote session/i }).click()

    // Error message should appear
    await expect(page.getByText('Failed to create session')).toBeVisible()
  })

  test('Claude API failure shows graceful mediation error', async ({ page }) => {
    await page.route('**/api/sessions/ERR404', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION_ACTIVE),
        })
      } else {
        await route.continue()
      }
    })

    await mockBaseAPIs(page)

    // Override mediate to fail
    await page.route('**/api/mediate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Claude API error' }),
      })
    })

    await page.goto('/session/ERR404')

    // Send a message to trigger mediation
    const messageInput = page.getByPlaceholder(/Type your message/i).first()
    await messageInput.fill('Test message')
    const sendButton = page.getByRole('button', { name: 'Send' }).first()
    await sendButton.click()

    // Error message should appear (graceful degradation)
    await expect(page.getByText(/analysis unavailable/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('rate limited request shows appropriate message', async ({ page }) => {
    await page.route('**/api/sessions/ERR404', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION_ACTIVE),
        })
      } else {
        await route.continue()
      }
    })

    await mockBaseAPIs(page)

    // Override mediate to return 429
    await page.route('**/api/mediate', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Rate limited' }),
      })
    })

    await page.goto('/session/ERR404')

    const messageInput = page.getByPlaceholder(/Type your message/i).first()
    await messageInput.fill('Another test')
    await page.getByRole('button', { name: 'Send' }).first().click()

    // Should show error about unavailable analysis
    await expect(page.getByText(/analysis unavailable/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('session not found shows appropriate state', async ({ page }) => {
    await page.route('**/api/sessions/NOTFND', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session not found' }),
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

    await page.route('**/realtime/**', async (route) => {
      await route.abort()
    })

    await page.goto('/session/NOTFND')

    // Should show name entry (Person A) since session doesn't exist
    // The component falls through to NameEntry when no session is found
    await expect(page.getByText('Person A').first()).toBeVisible()
  })

  test('recovery: can retry after session creation error', async ({ page }) => {
    let callCount = 0

    await page.route('**/api/sessions', async (route) => {
      callCount++
      if (callCount === 1) {
        // First attempt fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        })
      } else {
        // Second attempt succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'recovery-session',
            room_code: 'REC001',
            person_a_name: 'Alice',
            person_b_name: null,
            status: 'waiting',
            mode: 'remote',
            context_mode: 'intimate',
            onboarding_step: null,
            onboarding_context: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.goto('/')

    // First attempt — should fail
    const remoteButton = page.locator('button').filter({ hasText: 'Remote' }).first()
    await remoteButton.click()
    await page.getByRole('button', { name: /Start remote session/i }).click()
    await expect(page.getByText('Failed to create session')).toBeVisible()

    // Retry — should succeed
    await page.getByRole('button', { name: /Start remote session/i }).click()
    await page.waitForURL('**/session/REC001')
    expect(page.url()).toContain('/session/REC001')
  })
})
