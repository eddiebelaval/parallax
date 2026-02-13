import type { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

/**
 * Test Data Helpers
 *
 * Manages test data seeding and cleanup for e2e tests.
 * Uses a dedicated test database to ensure isolation.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials for e2e tests')
}

// Service role client for test data management
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export interface TestUser {
  id: string
  email: string
  password: string
}

export interface TestProfile {
  user_id: string
  display_name: string
  interview_completed: boolean
}

export interface TestSignal {
  id: string
  user_id: string
  signal_type: string
  signal_value: Record<string, unknown>
  confidence: number
  source: string
  extracted_at: string
}

/**
 * Create a test user with profile and signals
 */
export async function createTestUser(
  email: string = `test-${Date.now()}@parallax.test`,
  password: string = 'test-password-123'
): Promise<{ user: TestUser; profile: TestProfile; signals: TestSignal[] }> {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message}`)
  }

  const userId = authData.user.id

  // Create profile
  const profile: TestProfile = {
    user_id: userId,
    display_name: email.split('@')[0],
    interview_completed: true,
  }

  const { error: profileError } = await supabase.from('user_profiles').insert(profile)

  if (profileError) {
    throw new Error(`Failed to create test profile: ${profileError.message}`)
  }

  // Create behavioral signals
  const now = new Date().toISOString()
  const signals: TestSignal[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      signal_type: 'attachment_style',
      signal_value: { primary: 'secure', secondary: 'anxious' },
      confidence: 0.85,
      source: 'session',
      extracted_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      signal_type: 'conflict_mode',
      signal_value: { primary: 'collaborating', assertiveness: 7.5, cooperativeness: 8.2 },
      confidence: 0.78,
      source: 'session',
      extracted_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      signal_type: 'values',
      signal_value: { core: ['honesty', 'growth', 'connection'] },
      confidence: 0.92,
      source: 'session',
      extracted_at: now,
    },
  ]

  const { error: signalsError } = await supabase.from('behavioral_signals').insert(signals)

  if (signalsError) {
    throw new Error(`Failed to create test signals: ${signalsError.message}`)
  }

  return {
    user: { id: userId, email, password },
    profile,
    signals,
  }
}

/**
 * Delete a test user and all associated data
 */
export async function deleteTestUser(userId: string): Promise<void> {
  // Delete signals
  await supabase.from('behavioral_signals').delete().eq('user_id', userId)

  // Delete profile
  await supabase.from('user_profiles').delete().eq('user_id', userId)

  // Delete sessions where user participated
  await supabase
    .from('sessions')
    .delete()
    .or(`person_a_user_id.eq.${userId},person_b_user_id.eq.${userId}`)

  // Delete auth user
  await supabase.auth.admin.deleteUser(userId)
}

/**
 * Sign in a test user and return session
 */
export async function signInTestUser(
  email: string,
  password: string
): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string } }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`)
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email!,
    },
  }
}

/**
 * Inject auth session into browser localStorage for authenticated e2e tests
 */
export async function injectAuthSession(
  page: Page,
  session: { access_token: string; refresh_token: string; user: { id: string; email: string } }
): Promise<void> {
  const storageKey = 'sb-kzozdtgunuigcdmqqojw-auth-token'

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    {
      key: storageKey,
      value: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: session.user,
      },
    }
  )
}

/**
 * Clean up all test users (for CI cleanup)
 */
export async function cleanupAllTestUsers(): Promise<void> {
  // Find all test users (emails ending in @parallax.test)
  const { data: users, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Failed to list users:', error)
    return
  }

  const testUsers = users.users.filter((u) => u.email?.endsWith('@parallax.test'))

  for (const user of testUsers) {
    await deleteTestUser(user.id)
  }

  console.log(`Cleaned up ${testUsers.length} test users`)
}
