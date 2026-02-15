import { createServerClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export async function getServerUser(): Promise<User | null> {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

export async function requireServerAuth(): Promise<User> {
  const user = await getServerUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}
