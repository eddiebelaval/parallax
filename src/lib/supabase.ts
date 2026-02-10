import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Browser client — uses anon key + RLS
// NEXT_PUBLIC_ vars are inlined at build time by Next.js, so they're always available
// in production. Empty string fallback prevents build-time crashes during static analysis.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server client — uses service role key, bypasses RLS
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
