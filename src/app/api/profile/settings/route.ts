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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get profile settings
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Map database fields to ProfileSettings interface
    const settings: ProfileSettings = {
      display_name: profile.display_name || user.email || 'User',
      preferred_name: profile.preferred_name,
      pronouns: profile.pronouns,
      email_notifications: profile.email_notifications ?? true,
      sms_notifications: profile.sms_notifications ?? false,
      push_notifications: profile.push_notifications ?? true,
      default_session_mode: profile.default_session_mode || 'in-person',
      auto_record_sessions: profile.auto_record_sessions ?? false,
      enable_live_transcription: profile.enable_live_transcription ?? false,
      share_behavioral_signals: profile.share_behavioral_signals ?? false,
      allow_research_data_use: profile.allow_research_data_use ?? false,
      public_profile: profile.public_profile ?? false,
      voice_speed: profile.voice_speed ?? 1.0,
      voice_enabled: profile.voice_enabled ?? true,
      preferred_voice_id: profile.preferred_voice_id,
      interview_completed: profile.interview_completed ?? false,
      allow_reinterview: profile.allow_reinterview ?? true,
      last_interview_date: profile.last_interview_date,
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates: Partial<ProfileSettings> = await request.json()

    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update profile settings
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error resetting profile settings:', error)
      return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 })
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
