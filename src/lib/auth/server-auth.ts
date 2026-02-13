import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user on the server.
 * Returns null if not authenticated.
 *
 * Uses Next.js cookies() for server-side session access.
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = createServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Require authentication on the server.
 * Throws an error if not authenticated (will be caught by error boundary).
 */
export async function requireServerAuth(): Promise<User> {
  const user = await getServerUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}
