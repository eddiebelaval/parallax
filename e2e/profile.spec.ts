import { test, expect, Page } from '@playwright/test'

/**
 * Profile Page E2E Tests
 *
 * Tests the profile page flow including:
 * - Profile header display
 * - Signals list rendering
 * - Empty state when no signals
 * - Profile actions visibility
 * - Loading states
 */

/* ─── Mock Data ─── */

const MOCK_USER = {
  id: 'test-user-profile-123',
  email: 'test@parallax.space',
  user_metadata: {
    full_name: 'Test User',
    name: 'Test User',
  },
}

const MOCK_SESSION = {
  access_token: 'mock-access-token-profile',
  refresh_token: 'mock-refresh-token-profile',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_USER,
}

const MOCK_PROFILE = {
  user_id: MOCK_USER.id,
  display_name: 'Test User',
  interview_completed: true,
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

const MOCK_SIGNALS = [
  {
    id: 'signal-1',
    user_id: MOCK_USER.id,
    signal_type: 'attachment_style',
    signal_value: {
      primary: 'secure',
      secondary: 'anxious',
    },
    confidence: 0.85,
    created_at: new Date('2024-02-10').toISOString(),
    session_id: 'session-abc-123',
  },
  {
    id: 'signal-2',
    user_id: MOCK_USER.id,
    signal_type: 'conflict_mode',
    signal_value: {
      primary: 'collaborating',
      assertiveness: 7.5,
      cooperativeness: 8.2,
    },
    confidence: 0.78,
    created_at: new Date('2024-02-12').toISOString(),
    session_id: 'session-def-456',
  },
  {
    id: 'signal-3',
    user_id: MOCK_USER.id,
    signal_type: 'values',
    signal_value: {
      core: ['honesty', 'growth', 'connection'],
    },
    confidence: 0.92,
    created_at: new Date('2024-02-13').toISOString(),
    session_id: 'session-ghi-789',
  },
]

// Supabase storage key for auth session
const SUPABASE_STORAGE_KEY = 'sb-kzozdtgunuigcdmqqojw-auth-token'

/* ─── Helpers ─── */

/**
 * Seeds a mock Supabase session into localStorage BEFORE page scripts run
 */
async function seedAuthSession(page: Page) {
  const session = {
    access_token: 'mock-access-token-profile',
    refresh_token: 'mock-refresh-token-profile',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: MOCK_USER,
  }
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    { key: SUPABASE_STORAGE_KEY, value: session }
  )
}

async function mockAuthenticatedUser(page: Page) {
  // Block Realtime WebSocket connections
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })

  // Mock Supabase auth endpoints
  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION),
    })
  })

  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    })
  })
}

async function mockProfileData(
  page: Page,
  profile: typeof MOCK_PROFILE | null,
  signals: typeof MOCK_SIGNALS = []
) {
  // Mock profile query
  await page.route('**/rest/v1/user_profiles**', async (route) => {
    if (profile) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(profile),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }
  })

  // Mock behavioral signals query
  await page.route('**/rest/v1/behavioral_signals**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(signals),
    })
  })

  // Mock sessions query
  await page.route('**/rest/v1/sessions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })
}

async function mockUnauthenticatedUser(page: Page) {
  await page.route('**/realtime/**', async (route) => {
    await route.abort()
  })

  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not_authenticated' }),
    })
  })
}

/* ─── Profile Header Tests ─── */

test.describe('Profile Header', () => {
  test('displays user name and stats when authenticated with profile', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Profile name visible
    await expect(page.getByText('Test User')).toBeVisible()

    // Signals count visible (3 signals in MOCK_SIGNALS)
    await expect(page.getByText(/3 signals?/i)).toBeVisible()
  })

  test('shows "Create Profile" button when not authenticated', async ({ page }) => {
    await mockUnauthenticatedUser(page)
    await page.goto('/profile')

    // Should show call-to-action to create profile
    await expect(page.getByText(/Create Your Profile|Sign In|Get Started/i)).toBeVisible()
  })

  test('displays profile creation date', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // Profile creation date should be visible
    await expect(page.getByText(/Member since|Joined/i)).toBeVisible()
  })
})

/* ─── Signals List Tests ─── */

test.describe('Signals List', () => {
  test('displays all signals when they exist', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Signal type labels should be visible
    await expect(page.getByText('Attachment Style')).toBeVisible()
    await expect(page.getByText('Conflict Mode')).toBeVisible()
    await expect(page.getByText('Core Values')).toBeVisible()
  })

  test('shows signal confidence scores', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Confidence percentages visible
    await expect(page.getByText('85% confidence')).toBeVisible()
    await expect(page.getByText('78% confidence')).toBeVisible()
    await expect(page.getByText('92% confidence')).toBeVisible()
  })

  test('displays signal values correctly', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Attachment style values
    await expect(page.getByText(/secure/i)).toBeVisible()
    await expect(page.getByText(/Secondary.*anxious/i)).toBeVisible()

    // Conflict mode values
    await expect(page.getByText(/collaborating/i)).toBeVisible()

    // Core values
    await expect(page.getByText('honesty')).toBeVisible()
    await expect(page.getByText('growth')).toBeVisible()
    await expect(page.getByText('connection')).toBeVisible()
  })

  test('renders signal cards with proper styling', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Signal cards should have the expected structure
    const signalCards = page.locator('[class*="bg-"][class*="border"]').filter({ hasText: 'confidence' })
    await expect(signalCards.first()).toBeVisible()

    // Should have at least 3 signal cards
    const count = await signalCards.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

/* ─── Empty State Tests ─── */

test.describe('Empty Signals State', () => {
  test('shows empty state when no signals exist', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // Empty state message visible
    await expect(page.getByText(/No signals yet|haven't participated/i)).toBeVisible()

    // Should suggest creating a session
    await expect(page.getByText(/Start.*session|Create.*session/i)).toBeVisible()
  })

  test('empty state has call-to-action button', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // CTA button to create session
    const ctaButton = page.getByRole('link', { name: /Start.*Session|New Session/i })
    await expect(ctaButton).toBeVisible()
  })

  test('empty state shows for new users', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // New user messaging
    await expect(page.getByText(/first|new/i)).toBeVisible()
  })
})

/* ─── Profile Actions Tests ─── */

test.describe('Profile Actions', () => {
  test('displays action buttons', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // Should have navigation actions
    await expect(page.getByRole('link', { name: /Home|Dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /New Session|Start Session/i })).toBeVisible()
  })

  test('sign out button is visible', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    // Sign out action
    await expect(page.getByRole('button', { name: /Sign Out|Logout/i })).toBeVisible()
  })

  test('actions section is at bottom of page', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Actions should be after signals
    const actionsSection = page.locator('text=/Sign Out|Logout/i').locator('..')
    await expect(actionsSection).toBeVisible()

    // Verify it's below the signals
    const signalsSection = page.locator('text=Attachment Style').locator('..')
    const actionsBox = await actionsSection.boundingBox()
    const signalsBox = await signalsSection.boundingBox()

    if (actionsBox && signalsBox) {
      expect(actionsBox.y).toBeGreaterThan(signalsBox.y)
    }
  })
})

/* ─── Loading States Tests ─── */

test.describe('Loading States', () => {
  test('shows loading skeleton on initial load', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)

    // Delay the profile/signals response to see loading state
    await page.route('**/rest/v1/user_profiles**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PROFILE),
      })
    })

    await page.route('**/rest/v1/behavioral_signals**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.route('**/rest/v1/sessions**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/profile')

    // Loading indicator visible (skeleton or spinner)
    await expect(page.locator('[class*="animate-pulse"]').first()).toBeVisible({ timeout: 500 })
  })

  test('transitions from loading to content smoothly', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Wait for content to load
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Attachment Style')).toBeVisible()
  })
})

/* ─── Error Handling Tests ─── */

test.describe('Error Handling', () => {
  test('shows error state when profile fetch fails', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)

    // Mock profile fetch failure
    await page.route('**/rest/v1/user_profiles**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'internal_server_error' }),
      })
    })

    await page.goto('/profile')

    // Error message visible
    await expect(page.getByText(/error|failed|couldn't load/i)).toBeVisible()
  })

  test('handles missing profile gracefully', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, null, [])
    await page.goto('/profile')

    // Should show option to create profile
    await expect(page.getByText(/Create|Complete.*Profile/i)).toBeVisible()
  })
})

/* ─── Navigation Tests ─── */

test.describe('Navigation', () => {
  test('back to home navigation works', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, [])
    await page.goto('/profile')

    const homeLink = page.getByRole('link', { name: /Home|Back/i })
    await homeLink.click()

    await page.waitForURL('**/home', { timeout: 3000 })
    expect(page.url()).toContain('/home')
  })

  test('signal cards display without navigation links', async ({ page }) => {
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Signals are displayed as cards, not clickable links
    const signalCard = page.locator('text=Attachment Style').locator('..')
    await expect(signalCard).toBeVisible()

    // Verify the card structure
    await expect(signalCard.locator('text=secure')).toBeVisible()
  })
})

/* ─── Responsive Design Tests ─── */

test.describe('Responsive Design', () => {
  test('profile page is mobile-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Content should be visible and not overflowing
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('Attachment Style')).toBeVisible()
  })

  test('signals stack properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await seedAuthSession(page)
    await mockAuthenticatedUser(page)
    await mockProfileData(page, MOCK_PROFILE, MOCK_SIGNALS)
    await page.goto('/profile')

    // Signals should stack vertically
    const signal1 = page.locator('text=Attachment Style').locator('..')
    const signal2 = page.locator('text=Conflict Mode').locator('..')

    const box1 = await signal1.boundingBox()
    const box2 = await signal2.boundingBox()

    if (box1 && box2) {
      // Signal 2 should be below Signal 1
      expect(box2.y).toBeGreaterThan(box1.y + box1.height)
    }
  })
})
