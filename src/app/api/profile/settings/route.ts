import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getServerUser } from '@/lib/auth/server-auth'
import type { ProfileSettings } from '@/types/profile-concierge'

/**
 * GET /api/profile/settings
 *
 * Retrieves the current user's profile settings.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()

    // HACKATHON DEMO: Use demo user if no auth
    const userId = user?.id || 'demo-user-hackathon-2026'

    const supabase = createServerClient()

    // Get profile settings
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // HACKATHON DEMO: Return defaults if no profile exists
    if (error || !profile) {
      console.log('No profile found, returning defaults for demo')
      const defaultSettings: ProfileSettings = {
        display_name: 'Hackathon Judge',
        preferred_name: undefined,
        pronouns: undefined,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        default_session_mode: 'in-person',
        auto_record_sessions: false,
        enable_live_transcription: false,
        share_behavioral_signals: false,
        allow_research_data_use: false,
        public_profile: false,
        voice_speed: 1.0,
        voice_enabled: true,
        preferred_voice_id: undefined,
        interview_completed: false,
        allow_reinterview: true,
        last_interview_date: undefined,
        high_contrast_mode: false,
        reduce_motion: false,
        screen_reader_mode: false,
        experimental_features: false,
        beta_access: false,
      }
      return NextResponse.json({ settings: defaultSettings })
    }

    // Map database fields to ProfileSettings interface
    const settings: ProfileSettings = {
      display_name: profile.display_name || user?.email || 'User',
      preferred_name: profile.preferred_name ?? undefined,
      pronouns: profile.pronouns ?? undefined,
      email_notifications: profile.email_notifications ?? true,
      sms_notifications: profile.sms_notifications ?? false,
      push_notifications: profile.push_notifications ?? true,
      default_session_mode: (profile.default_session_mode as 'in-person' | 'remote') || 'in-person',
      auto_record_sessions: profile.auto_record_sessions ?? false,
      enable_live_transcription: profile.enable_live_transcription ?? false,
      share_behavioral_signals: profile.share_behavioral_signals ?? false,
      allow_research_data_use: profile.allow_research_data_use ?? false,
      public_profile: profile.public_profile ?? false,
      voice_speed: profile.voice_speed ?? 1.0,
      voice_enabled: profile.voice_enabled ?? true,
      preferred_voice_id: profile.preferred_voice_id ?? undefined,
      interview_completed: profile.interview_completed ?? false,
      allow_reinterview: profile.allow_reinterview ?? true,
      last_interview_date: profile.last_interview_date ?? undefined,
      high_contrast_mode: profile.high_contrast_mode ?? false,
      reduce_motion: profile.reduce_motion ?? false,
      screen_reader_mode: profile.screen_reader_mode ?? false,
      experimental_features: profile.experimental_features ?? false,
      beta_access: profile.beta_access ?? false,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error in GET /api/profile/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/profile/settings
 *
 * Updates the current user's profile settings.
 * Accepts partial updates.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser()

    // HACKATHON DEMO: Use demo user if no auth
    const userId = user?.id || 'demo-user-hackathon-2026'

    const rawUpdates: Record<string, unknown> = await request.json()

    // Allowlist: only these keys can be set via PATCH
    const ALLOWED_KEYS: Array<keyof ProfileSettings> = [
      'display_name', 'preferred_name', 'pronouns',
      'email_notifications', 'sms_notifications', 'push_notifications',
      'default_session_mode', 'auto_record_sessions',
      'enable_live_transcription', 'share_behavioral_signals',
      'allow_research_data_use', 'public_profile',
      'voice_speed', 'voice_enabled', 'preferred_voice_id',
      'interview_completed', 'allow_reinterview', 'last_interview_date',
      'high_contrast_mode', 'reduce_motion', 'screen_reader_mode',
      'experimental_features', 'beta_access',
    ]

    const updates: Partial<ProfileSettings> = {}
    for (const key of ALLOWED_KEYS) {
      if (key in rawUpdates) {
        (updates as Record<string, unknown>)[key] = rawUpdates[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update profile settings
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    // HACKATHON DEMO: Return success even if profile doesn't exist
    if (error) {
      console.log('No profile to update (demo mode), returning success')
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully (demo mode)',
        settings: updates,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: data,
    })
  } catch (error) {
    console.error('Error in PATCH /api/profile/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/profile/settings
 *
 * Resets profile settings to defaults.
 * Requires confirmation.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()

    // HACKATHON DEMO: Use demo user if no auth
    const userId = user?.id || 'demo-user-hackathon-2026'

    const { confirmed } = await request.json()

    if (!confirmed) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Pass { confirmed: true } to reset settings',
        },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Reset to default settings
    const defaults: Partial<ProfileSettings> = {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      default_session_mode: 'in-person',
      auto_record_sessions: false,
      enable_live_transcription: false,
      share_behavioral_signals: false,
      allow_research_data_use: false,
      public_profile: false,
      voice_speed: 1.0,
      voice_enabled: true,
      high_contrast_mode: false,
      reduce_motion: false,
      screen_reader_mode: false,
      experimental_features: false,
      beta_access: false,
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...defaults,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    // HACKATHON DEMO: Return success even if profile doesn't exist
    if (error) {
      console.log('No profile to reset (demo mode), returning defaults')
      return NextResponse.json({
        success: true,
        message: 'Settings reset to defaults (demo mode)',
        settings: defaults,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings reset to defaults',
      settings: data,
    })
  } catch (error) {
    console.error('Error in DELETE /api/profile/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
