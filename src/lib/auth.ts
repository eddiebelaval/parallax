import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  })

  if (error) throw error

  // Create user profile row (upsert to handle race conditions)
  if (data.user) {
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      user_id: data.user.id,
      display_name: displayName ?? null,
    }, {
      onConflict: 'user_id',
    })
    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (data as UserProfile) ?? null
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}
