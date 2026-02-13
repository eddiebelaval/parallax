import { cache } from 'react'
import { createServerClient } from '@/lib/supabase'
import type { UserProfile, BehavioralSignal, Session } from '@/types/database'

/**
 * Cached data access layer for user profile data.
 * Uses React cache() for request-level deduplication.
 * These functions run only on the server and use the service role key.
 */

/**
 * Get user profile by user ID.
 * Cached per request to avoid duplicate queries.
 */
export const getUserProfile = cache(async (userId: string): Promise<UserProfile | null> => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as UserProfile
})

/**
 * Get behavioral signals for a user.
 * Cached per request to avoid duplicate queries.
 */
export const getUserSignals = cache(async (userId: string): Promise<BehavioralSignal[]> => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('behavioral_signals')
    .select('*')
    .eq('user_id', userId)
    .order('signal_type')

  if (error) {
    console.error('Error fetching behavioral signals:', error)
    return []
  }

  return (data ?? []) as BehavioralSignal[]
})

/**
 * Get all sessions for a user (where they are person_a or person_b).
 * Cached per request to avoid duplicate queries.
 */
export const getUserSessions = cache(async (userId: string): Promise<Session[]> => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .or(`person_a_user_id.eq.${userId},person_b_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user sessions:', error)
    return []
  }

  return data ?? []
})

/**
 * Get combined user data (profile + signals + sessions).
 * Uses cached functions above for optimal deduplication.
 */
export const getUserData = cache(async (userId: string) => {
  const [profile, signals, sessions] = await Promise.all([
    getUserProfile(userId),
    getUserSignals(userId),
    getUserSessions(userId),
  ])

  return { profile, signals, sessions }
})
