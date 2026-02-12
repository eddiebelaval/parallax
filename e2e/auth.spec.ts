import { test, expect, Page } from '@playwright/test'

/* ─── Mock Data ─── */

const MOCK_USER = {
  id: 'test-user-id-123',
  email: 'test@parallax.space',
  user_metadata: {
    full_name: 'Test User',
    name: 'Test User',
  },
}

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_USER,
}

const MOCK_PROFILE_NEW = null

const MOCK_PROFILE_INCOMPLETE = {
  user_id: MOCK_USER.id,
  display_name: 'Test User',
  interview_completed: false,
}

const MOCK_PROFILE_COMPLETE = {
  user_id: MOCK_USER.id,
  display_name: 'Test User',
  interview_completed: true,
}

/* ─── Helpers ─── */

async function mockSupabaseAuth(page: Page) {
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

  await page.route('**/auth/v1/signup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_SESSION,
        user: { ...MOCK_USER, identities: [] },
      }),
    })
  })

  // Trailing ** catches the ?redirect_to= query param that auth-js appends
  await page.route('**/auth/v1/otp**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })

  await page.route('**/auth/v1/authorize**', async (route) => {
    // OAuth redirects to Google — simulate by redirecting to callback
    await route.fulfill({
      status: 302,
      headers: {
        location: '/auth/callback?code=mock-oauth-code',
      },
    })
  })
}

async function mockProfileQuery(page: Page, profile: typeof MOCK_PROFILE_COMPLETE | typeof MOCK_PROFILE_INCOMPLETE | null) {
  await page.route('**/rest/v1/user_profiles**', async (route) => {
    if (route.request().method() === 'GET') {
      if (profile === null) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(profile),
        })
      }
    } else {
      // POST/PATCH (upsert)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(profile ?? MOCK_PROFILE_INCOMPLETE),
      })
    }
  })
}

async function mockUnauthenticated(page: Page) {
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

  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'invalid_grant' }),
    })
  })
}

// Supabase stores sessions in localStorage under this key.
// Derived from NEXT_PUBLIC_SUPABASE_URL hostname: sb-{project_ref}-auth-token
const SUPABASE_STORAGE_KEY = 'sb-kzozdtgunuigcdmqqojw-auth-token'

/**
 * Seeds a mock Supabase session into localStorage BEFORE page scripts run.
 * Required because supabase.auth.getUser() reads localStorage first — if no
 * stored session exists, it returns null without ever hitting the network.
 */
async function seedAuthSession(page: Page) {
  const session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: MOCK_USER,
  }
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, { key: SUPABASE_STORAGE_KEY, value: session })
}

/* ─── Auth Page Rendering ─── */

test.describe('Auth Page', () => {
  test('renders sign-up mode by default with Google + magic link', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    // Heading
    await expect(page.getByRole('heading', { name: 'Create Your Profile' })).toBeVisible()

    // Google OAuth button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()

    // Magic link email input
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()

    // Send link button
    await expect(page.getByRole('button', { name: /Send link/i })).toBeVisible()

    // Password toggle visible
    await expect(page.getByText('Use email + password instead')).toBeVisible()

    // Privacy notice
    await expect(page.getByText(/encrypted at rest/i)).toBeVisible()
  })

  test('toggles to password mode', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    await page.getByText('Use email + password instead').click()

    // Password form visible
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('At least 6 characters')).toBeVisible()
    await expect(page.getByRole('button', { name: /Create Profile/i })).toBeVisible()

    // Toggle back link visible
    await expect(page.getByText('Use magic link instead')).toBeVisible()

    // Sign-in toggle visible
    await expect(page.getByText('Already have a profile?')).toBeVisible()
  })

  test('toggles between sign-up and sign-in in password mode', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    // Switch to password mode
    await page.getByText('Use email + password instead').click()
    await expect(page.getByRole('button', { name: /Create Profile/i })).toBeVisible()

    // Switch to sign-in
    await page.getByText('Already have a profile?').click()
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()

    // Switch back to sign-up
    await page.getByText('Need a profile?').click()
    await expect(page.getByRole('heading', { name: 'Create Your Profile' })).toBeVisible()
  })

  test('toggles back from password to magic link mode', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    await page.getByText('Use email + password instead').click()
    await expect(page.getByPlaceholder('At least 6 characters')).toBeVisible()

    await page.getByText('Use magic link instead').click()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /Send link/i })).toBeVisible()
  })
})

/* ─── OAuth Error Display ─── */

test.describe('Auth Error Display', () => {
  test('shows oauth_failed error from URL', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth?error=oauth_failed')

    await expect(page.getByText(/Google sign-in failed/i)).toBeVisible()
  })

  test('shows no_code error from URL', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth?error=no_code')

    await expect(page.getByText(/Authentication interrupted/i)).toBeVisible()
  })

  test('clears error when switching auth modes', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth?error=oauth_failed')

    await expect(page.getByText(/Google sign-in failed/i)).toBeVisible()

    // Switch to password mode — should clear error
    await page.getByText('Use email + password instead').click()
    await expect(page.getByText(/Google sign-in failed/i)).not.toBeVisible()
  })
})

/* ─── Magic Link Flow ─── */

test.describe('Magic Link Flow', () => {
  test('sends magic link and shows success message', async ({ page }) => {
    await mockUnauthenticated(page)
    // Only mock the OTP endpoint — don't use mockSupabaseAuth which would
    // make the user appear authenticated (LIFO route ordering) and trigger redirect.
    // Trailing ** catches the ?redirect_to= query param that auth-js appends.
    await page.route('**/auth/v1/otp**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })
    await page.goto('/auth')

    const emailInput = page.getByPlaceholder('your@email.com')
    await emailInput.fill('eddie@id8labs.app')
    // WebKit may not fire React's synthetic onChange from fill() — dispatch explicitly
    await emailInput.dispatchEvent('input')
    await page.getByRole('button', { name: /Send link/i }).click()

    await expect(page.getByText(/Check your email/i)).toBeVisible()
  })

  test('disables send button when email is empty', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    const sendButton = page.getByRole('button', { name: /Send link/i })
    await expect(sendButton).toBeDisabled()
  })

  test('shows error when magic link request fails', async ({ page }) => {
    await mockUnauthenticated(page)
    // Trailing ** catches the ?redirect_to= query param that auth-js appends
    await page.route('**/auth/v1/otp**', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limit', message: 'Email rate limit exceeded' }),
      })
    })
    await page.goto('/auth')

    const emailInput = page.getByPlaceholder('your@email.com')
    await emailInput.fill('eddie@id8labs.app')
    // WebKit may not fire React's synthetic onChange from fill() — dispatch explicitly
    await emailInput.dispatchEvent('input')
    await page.getByRole('button', { name: /Send link/i }).click()

    await expect(page.getByText(/Failed to send magic link|rate limit/i)).toBeVisible()
  })
})

/* ─── Password Auth Flow ─── */

test.describe('Password Sign-Up Flow', () => {
  test('signs up and redirects to interview', async ({ page }) => {
    await mockUnauthenticated(page)
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, null)
    await page.goto('/auth')

    // Switch to password mode
    await page.getByText('Use email + password instead').click()

    await page.getByPlaceholder('you@example.com').fill('test@parallax.space')
    await page.getByPlaceholder('At least 6 characters').fill('secure123')
    await page.getByRole('button', { name: /Create Profile/i }).click()

    await page.waitForURL('**/interview', { timeout: 5000 })
    expect(page.url()).toContain('/interview')
  })

  test('shows error on sign-up failure', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.route('**/realtime/**', (route) => route.abort())
    await page.route('**/auth/v1/signup', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'user_already_exists', message: 'User already registered' }),
      })
    })
    await page.goto('/auth')

    await page.getByText('Use email + password instead').click()
    await page.getByPlaceholder('you@example.com').fill('existing@parallax.space')
    await page.getByPlaceholder('At least 6 characters').fill('secure123')
    await page.getByRole('button', { name: /Create Profile/i }).click()

    await expect(page.getByText(/Authentication failed|already registered/i)).toBeVisible()
  })
})

test.describe('Password Sign-In Flow', () => {
  test('signs in existing user with completed interview — goes to home', async ({ page }) => {
    await mockUnauthenticated(page)
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_COMPLETE)
    await page.goto('/auth')

    // Switch to password → sign-in
    await page.getByText('Use email + password instead').click()
    await page.getByText('Already have a profile?').click()

    await page.getByPlaceholder('you@example.com').fill('test@parallax.space')
    await page.getByPlaceholder('At least 6 characters').fill('secure123')
    await page.getByRole('button', { name: /Sign In/i }).click()

    await page.waitForURL('**/home', { timeout: 5000 })
    expect(page.url()).toContain('/home')
  })

  test('signs in existing user without interview — goes to interview', async ({ page }) => {
    await mockUnauthenticated(page)
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_INCOMPLETE)
    await page.goto('/auth')

    await page.getByText('Use email + password instead').click()
    await page.getByText('Already have a profile?').click()

    await page.getByPlaceholder('you@example.com').fill('test@parallax.space')
    await page.getByPlaceholder('At least 6 characters').fill('secure123')
    await page.getByRole('button', { name: /Sign In/i }).click()

    await page.waitForURL('**/interview', { timeout: 5000 })
    expect(page.url()).toContain('/interview')
  })
})

/* ─── Callback Page (PKCE Exchange) ─── */

test.describe('Auth Callback (PKCE)', () => {
  test('callback page shows loading state', async ({ page }) => {
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_COMPLETE)

    // Stall the token exchange to see loading state
    await page.route('**/auth/v1/token**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      })
    })

    await page.goto('/auth/callback?code=mock-auth-code')
    await expect(page.getByText(/Completing sign-in/i)).toBeVisible()
  })

  test('callback with valid code exchanges and redirects to home (completed interview)', async ({ page }) => {
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_COMPLETE)
    await page.goto('/auth/callback?code=mock-auth-code')

    await page.waitForURL('**/home', { timeout: 5000 })
    expect(page.url()).toContain('/home')
  })

  test('callback with valid code redirects to interview (incomplete profile)', async ({ page }) => {
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_INCOMPLETE)
    await page.goto('/auth/callback?code=mock-auth-code')

    await page.waitForURL('**/interview', { timeout: 5000 })
    expect(page.url()).toContain('/interview')
  })

  test('callback for new user creates profile and goes to interview', async ({ page }) => {
    let profileCreated = false
    await mockSupabaseAuth(page)

    await page.route('**/rest/v1/user_profiles**', async (route) => {
      if (route.request().method() === 'GET') {
        // First call: no profile exists (single returns error)
        await route.fulfill({
          status: 406,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'no rows returned' }),
        })
      } else {
        // POST/PATCH: profile upsert
        profileCreated = true
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_PROFILE_INCOMPLETE),
        })
      }
    })

    await page.goto('/auth/callback?code=mock-oauth-code')

    await page.waitForURL('**/interview', { timeout: 5000 })
    expect(page.url()).toContain('/interview')
  })

  test('callback with no code redirects to auth with error', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth/callback')

    await page.waitForURL('**/auth?error=no_code', { timeout: 5000 })
    expect(page.url()).toContain('error=no_code')
  })

  test('callback with failed exchange redirects to auth with error', async ({ page }) => {
    await page.route('**/realtime/**', (route) => route.abort())
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid code verifier',
        }),
      })
    })

    await page.goto('/auth/callback?code=expired-code')

    await page.waitForURL('**/auth?error=oauth_failed', { timeout: 5000 })
    expect(page.url()).toContain('error=oauth_failed')
  })
})

/* ─── Authenticated User Redirect ─── */

test.describe('Auth Redirect (Already Signed In)', () => {
  test('authenticated user with completed interview redirects to home', async ({ page }) => {
    // Seed localStorage so supabase.auth.getUser() finds a stored session
    // (without this, getUser() returns null without making a network request)
    await seedAuthSession(page)
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_COMPLETE)
    await page.goto('/auth')

    await page.waitForURL('**/home', { timeout: 5000 })
    expect(page.url()).toContain('/home')
  })

  test('authenticated user without interview redirects to interview', async ({ page }) => {
    await seedAuthSession(page)
    await mockSupabaseAuth(page)
    await mockProfileQuery(page, MOCK_PROFILE_INCOMPLETE)
    await page.goto('/auth')

    await page.waitForURL('**/interview', { timeout: 5000 })
    expect(page.url()).toContain('/interview')
  })
})

/* ─── Google OAuth Button ─── */

test.describe('Google OAuth', () => {
  test('Google button initiates OAuth redirect with correct params', async ({ page }) => {
    await mockUnauthenticated(page)

    // signInWithOAuth triggers window.location.assign() — a full page navigation.
    // Playwright's click() waits for navigations to complete, so we must intercept
    // the authorize request to prevent it from hanging on the real Supabase server.
    let capturedOAuthUrl = ''
    await page.route('**/auth/v1/authorize**', async (route) => {
      capturedOAuthUrl = route.request().url()
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>OAuth redirect intercepted</body></html>',
      })
    })

    await page.goto('/auth')
    await page.getByRole('button', { name: /Continue with Google/i }).click()

    // After click completes (navigation fulfilled), verify the OAuth URL
    expect(capturedOAuthUrl).toContain('provider=google')
    expect(capturedOAuthUrl).toContain('redirect_to=')
  })

  test('Google OAuth callback error displays on auth page', async ({ page }) => {
    // signInWithOAuth does a browser navigation (not fetch), so server errors
    // can't be caught by React. Instead, OAuth errors arrive via URL params
    // when the callback page redirects to /auth?error=oauth_failed.
    // This test verifies that flow end-to-end.
    await mockUnauthenticated(page)
    await page.goto('/auth?error=oauth_failed')

    await expect(page.getByText(/Google sign-in failed/i)).toBeVisible()

    // Verify the error clears when user tries a different auth method
    await page.getByText('Use email + password instead').click()
    await expect(page.getByText(/Google sign-in failed/i)).not.toBeVisible()
  })
})

/* ─── UI Polish ─── */

test.describe('Auth Page UI', () => {
  test('email input has correct type for mobile keyboards', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('password input has minLength validation', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    await page.getByText('Use email + password instead').click()

    const passwordInput = page.getByPlaceholder('At least 6 characters')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(passwordInput).toHaveAttribute('minlength', '6')
  })

  test('privacy notice is always visible', async ({ page }) => {
    await mockUnauthenticated(page)
    await page.goto('/auth')

    await expect(page.getByText(/encrypted at rest/i)).toBeVisible()
    await expect(page.getByText(/row-level security/i)).toBeVisible()
  })
})
