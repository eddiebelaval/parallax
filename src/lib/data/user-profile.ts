import { cache } from 'react'
import { createServerClient } from '@/lib/supabase'
import type { UserProfile, BehavioralSignal, Session } from '@/types/database'

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

export const getUserData = cache(async (userId: string) => {
  const [profile, signals, sessions] = await Promise.all([
    getUserProfile(userId),
    getUserSignals(userId),
    getUserSessions(userId),
  ])

  return { profile, signals, sessions }
})
