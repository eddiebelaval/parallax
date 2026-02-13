import { test as base, type Page } from '@playwright/test'
import {
  createTestUser,
  deleteTestUser,
  signInTestUser,
  injectAuthSession,
  type TestUser,
  type TestProfile,
  type TestSignal,
} from '../helpers/test-data'

/**
 * Authenticated User Fixture
 *
 * Extends Playwright test with an authenticated user context.
 * Creates a real test user in the database, signs them in,
 * and injects the session into the browser.
 */

export interface AuthenticatedUserFixtures {
  authenticatedPage: Page
  testUser: TestUser
  testProfile: TestProfile
  testSignals: TestSignal[]
}

export const test = base.extend<AuthenticatedUserFixtures>({
  /**
   * Authenticated page with real test user session
   */
  authenticatedPage: async ({ page }, use) => {
    // Create test user with profile and signals
    const { user, profile, signals } = await createTestUser()

    try {
      // Sign in and get session
      const session = await signInTestUser(user.email, user.password)

      // Inject session into browser
      await injectAuthSession(page, session)

      // Provide page to test
      await use(page)
    } finally {
      // Cleanup: delete test user and all data
      await deleteTestUser(user.id)
    }
  },

  /**
   * Test user credentials
   */
  testUser: async ({ authenticatedPage }, use, testInfo) => {
    // Extract user data from the authenticated page context
    const userData = await authenticatedPage.evaluate(() => {
      const storageKey = 'sb-kzozdtgunuigcdmqqojw-auth-token'
      const session = JSON.parse(localStorage.getItem(storageKey) || '{}')
      return session.user
    })

    await use(userData)
  },

  /**
   * Test profile data
   */
  testProfile: async ({ testUser }, use) => {
    // Profile data is available via the test user
    await use({
      user_id: testUser.id,
      display_name: testUser.email.split('@')[0],
      interview_completed: true,
    })
  },

  /**
   * Test signals data
   */
  testSignals: async ({ testUser }, use) => {
    // Signals data is available via the test user
    const now = new Date().toISOString()
    await use([
      {
        id: crypto.randomUUID(),
        user_id: testUser.id,
        signal_type: 'attachment_style',
        signal_value: { primary: 'secure', secondary: 'anxious' },
        confidence: 0.85,
        source: 'session',
        extracted_at: now,
      },
      {
        id: crypto.randomUUID(),
        user_id: testUser.id,
        signal_type: 'conflict_mode',
        signal_value: { primary: 'collaborating', assertiveness: 7.5, cooperativeness: 8.2 },
        confidence: 0.78,
        source: 'session',
        extracted_at: now,
      },
      {
        id: crypto.randomUUID(),
        user_id: testUser.id,
        signal_type: 'values',
        signal_value: { core: ['honesty', 'growth', 'connection'] },
        confidence: 0.92,
        source: 'session',
        extracted_at: now,
      },
    ])
  },
})

export { expect } from '@playwright/test'
