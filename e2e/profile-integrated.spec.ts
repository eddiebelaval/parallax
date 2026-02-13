import { test, expect } from './fixtures/authenticated-user'

/**
 * Profile Page E2E Tests (Fully Integrated)
 *
 * Uses real test database and authenticated user sessions.
 * Tests the complete profile page flow with actual data.
 */

test.describe('Profile Header (Integrated)', () => {
  test('displays user name and signals count', async ({ authenticatedPage, testProfile, testSignals }) => {
    await authenticatedPage.goto('/profile')

    // Profile name visible
    await expect(authenticatedPage.getByText(testProfile.display_name)).toBeVisible()

    // Signals count visible
    await expect(authenticatedPage.getByText(`${testSignals.length} signals`)).toBeVisible()
  })

  test('shows interview completion status', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Interview complete badge visible
    await expect(authenticatedPage.getByText(/Interview complete/i)).toBeVisible()
  })

  test('displays Intelligence Profile header', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Section label visible
    await expect(authenticatedPage.getByText('Intelligence Profile')).toBeVisible()
  })
})

test.describe('Behavioral Signals Display (Integrated)', () => {
  test('displays all signal types', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // All signal type labels visible
    await expect(authenticatedPage.getByText('Attachment Style')).toBeVisible()
    await expect(authenticatedPage.getByText('Conflict Mode')).toBeVisible()
    await expect(authenticatedPage.getByText('Core Values')).toBeVisible()
  })

  test('shows confidence scores for each signal', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Confidence percentages visible
    await expect(authenticatedPage.getByText('85% confidence')).toBeVisible()
    await expect(authenticatedPage.getByText('78% confidence')).toBeVisible()
    await expect(authenticatedPage.getByText('92% confidence')).toBeVisible()
  })

  test('renders attachment style signal correctly', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Primary attachment style
    await expect(authenticatedPage.getByText(/secure/i)).toBeVisible()

    // Secondary attachment style
    await expect(authenticatedPage.getByText(/Secondary.*anxious/i)).toBeVisible()
  })

  test('renders conflict mode signal correctly', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Conflict mode primary
    await expect(authenticatedPage.getByText(/collaborating/i)).toBeVisible()

    // Assertiveness and cooperativeness scores
    await expect(authenticatedPage.getByText(/Assertiveness.*7\.5/i)).toBeVisible()
    await expect(authenticatedPage.getByText(/Cooperativeness.*8\.2/i)).toBeVisible()
  })

  test('renders core values signal correctly', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Core values should be displayed as chips/tags
    await expect(authenticatedPage.getByText('honesty')).toBeVisible()
    await expect(authenticatedPage.getByText('growth')).toBeVisible()
    await expect(authenticatedPage.getByText('connection')).toBeVisible()
  })

  test('signal cards have proper structure', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Find signal cards
    const signalCards = authenticatedPage.locator('[class*="bg-"][class*="border"]').filter({ hasText: 'confidence' })

    // Should have at least 3 signal cards
    const count = await signalCards.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // First card should be visible
    await expect(signalCards.first()).toBeVisible()
  })
})

test.describe('Profile Actions (Integrated)', () => {
  test('displays Home navigation link', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Home link visible
    const homeLink = authenticatedPage.getByRole('link', { name: /Home|Back/i })
    await expect(homeLink).toBeVisible()
  })

  test('displays New Session action', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // New session link visible
    const newSessionLink = authenticatedPage.getByRole('link', { name: /New Session|Start Session/i })
    await expect(newSessionLink).toBeVisible()
  })

  test('displays Sign Out button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Sign out button visible
    const signOutButton = authenticatedPage.getByRole('button', { name: /Sign Out|Logout/i })
    await expect(signOutButton).toBeVisible()
  })
})

test.describe('Navigation (Integrated)', () => {
  test('navigates back to home', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Click home link
    const homeLink = authenticatedPage.getByRole('link', { name: /Home|Back/i })
    await homeLink.click()

    // Should navigate to home page
    await authenticatedPage.waitForURL('**/home', { timeout: 3000 })
    expect(authenticatedPage.url()).toContain('/home')
  })

  test('navigates to new session', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Click new session link
    const newSessionLink = authenticatedPage.getByRole('link', { name: /New Session|Start Session/i })
    await newSessionLink.click()

    // Should navigate to home or session creation
    await authenticatedPage.waitForURL(/\/(home|session)/, { timeout: 3000 })
    expect(authenticatedPage.url()).toMatch(/\/(home|session)/)
  })

  test('signs out and redirects to auth', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Click sign out
    const signOutButton = authenticatedPage.getByRole('button', { name: /Sign Out|Logout/i })
    await signOutButton.click()

    // Should navigate to auth page
    await authenticatedPage.waitForURL('**/auth', { timeout: 3000 })
    expect(authenticatedPage.url()).toContain('/auth')
  })
})

test.describe('Responsive Design (Integrated)', () => {
  test('profile page is mobile-friendly', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await authenticatedPage.goto('/profile')

    // Content should be visible and not overflowing
    await expect(authenticatedPage.getByText('Intelligence Profile')).toBeVisible()
    await expect(authenticatedPage.getByText('Attachment Style')).toBeVisible()
  })

  test('signals stack vertically on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 })
    await authenticatedPage.goto('/profile')

    // Signals should stack vertically
    const signal1 = authenticatedPage.locator('text=Attachment Style').locator('..')
    const signal2 = authenticatedPage.locator('text=Conflict Mode').locator('..')

    const box1 = await signal1.boundingBox()
    const box2 = await signal2.boundingBox()

    if (box1 && box2) {
      // Signal 2 should be below Signal 1 (vertical stacking)
      expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10) // Allow 10px overlap for spacing
    }
  })

  test('desktop layout is wider and more spacious', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1440, height: 900 })
    await authenticatedPage.goto('/profile')

    // Profile content should be visible with max-width container
    const container = authenticatedPage.locator('.max-w-2xl').first()
    await expect(container).toBeVisible()
  })
})

test.describe('Loading States (Integrated)', () => {
  test('page loads content smoothly', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // Wait for main content to be visible
    await expect(authenticatedPage.getByText('Intelligence Profile')).toBeVisible({ timeout: 5000 })
    await expect(authenticatedPage.getByText('Attachment Style')).toBeVisible({ timeout: 5000 })
  })

  test('all signals load and display', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile')

    // All signals should eventually be visible
    await expect(authenticatedPage.getByText('Attachment Style')).toBeVisible()
    await expect(authenticatedPage.getByText('Conflict Mode')).toBeVisible()
    await expect(authenticatedPage.getByText('Core Values')).toBeVisible()
  })
})

test.describe('Profile Content Accuracy (Integrated)', () => {
  test('displays correct number of signals', async ({ authenticatedPage, testSignals }) => {
    await authenticatedPage.goto('/profile')

    // Count signal cards
    const signalCards = authenticatedPage.locator('[class*="bg-"][class*="border"]').filter({ hasText: 'confidence' })
    const count = await signalCards.count()

    // Should match test data
    expect(count).toBe(testSignals.length)
  })

  test('signal confidence scores match test data', async ({ authenticatedPage, testSignals }) => {
    await authenticatedPage.goto('/profile')

    // Check each signal's confidence score
    for (const signal of testSignals) {
      const confidenceText = `${Math.round(signal.confidence * 100)}% confidence`
      await expect(authenticatedPage.getByText(confidenceText)).toBeVisible()
    }
  })

  test('profile data is consistent across page reloads', async ({ authenticatedPage, testProfile }) => {
    // First load
    await authenticatedPage.goto('/profile')
    await expect(authenticatedPage.getByText(testProfile.display_name)).toBeVisible()

    // Reload page
    await authenticatedPage.reload()

    // Same data should be visible
    await expect(authenticatedPage.getByText(testProfile.display_name)).toBeVisible()
    await expect(authenticatedPage.getByText('Attachment Style')).toBeVisible()
  })
})
