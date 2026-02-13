/**
 * Profile Concierge Types
 *
 * Defines the voice-driven profile management system where
 * Parallax can manage the entire user account on their behalf.
 */

export interface ProfileSettings {
  // Display settings
  display_name: string
  preferred_name?: string
  pronouns?: string

  // Communication preferences
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean

  // Session preferences
  default_session_mode: 'in-person' | 'remote'
  auto_record_sessions: boolean
  enable_live_transcription: boolean

  // Privacy settings
  share_behavioral_signals: boolean
  allow_research_data_use: boolean
  public_profile: boolean

  // Voice preferences
  voice_speed: number // 0.5 to 2.0
  voice_enabled: boolean
  preferred_voice_id?: string

  // Interview settings
  interview_completed: boolean
  allow_reinterview: boolean
  last_interview_date?: string

  // Accessibility
  high_contrast_mode: boolean
  reduce_motion: boolean
  screen_reader_mode: boolean

  // Advanced
  experimental_features: boolean
  beta_access: boolean
}

export interface ProfileConciergeAction {
  action:
    | 'update_display_name'
    | 'update_pronouns'
    | 'toggle_notifications'
    | 'update_session_preferences'
    | 'update_privacy_settings'
    | 'update_voice_settings'
    | 'update_accessibility'
    | 'enable_beta_features'
    | 'delete_account'
    | 'export_data'
    | 'reset_interview'
  parameters: Record<string, unknown>
  confirmation_required: boolean
  reason?: string
}

export interface ProfileConciergeResponse {
  success: boolean
  message: string
  updated_settings?: Partial<ProfileSettings>
  requires_confirmation?: boolean
  confirmation_prompt?: string
  error?: string
}

// Voice command patterns for profile management
export const PROFILE_COMMANDS = {
  // Display name
  CHANGE_NAME: /change (?:my )?(?:display )?name to (.+)/i,
  SET_PRONOUNS: /(?:my )?pronouns are (.+)/i,

  // Notifications
  ENABLE_NOTIFICATIONS: /(?:turn on|enable) (.+) notifications/i,
  DISABLE_NOTIFICATIONS: /(?:turn off|disable|stop) (.+) notifications/i,
  MANAGE_NOTIFICATIONS: /(?:manage|configure|set up) notifications/i,

  // Session preferences
  SET_DEFAULT_MODE: /(?:set|make) default (?:session )?mode (?:to )?(.+)/i,
  AUTO_RECORD: /(?:automatically|always) record (?:my )?sessions/i,
  STOP_AUTO_RECORD: /(?:stop|don't) (?:automatically )?record(?:ing)? (?:my )?sessions/i,

  // Privacy
  MAKE_PROFILE_PUBLIC: /make (?:my )?profile public/i,
  MAKE_PROFILE_PRIVATE: /make (?:my )?profile private/i,
  SHARE_DATA: /(?:share|allow|enable) (?:my )?(?:data|behavioral signals?|research data)/i,
  STOP_SHARING: /(?:stop|don't) shar(?:e|ing) (?:my )?(?:data|behavioral signals?|research data)/i,

  // Voice settings
  CHANGE_VOICE_SPEED: /(?:change|set) voice speed (?:to )?(.+)/i,
  ENABLE_VOICE: /(?:turn on|enable) voice/i,
  DISABLE_VOICE: /(?:turn off|disable|mute) voice/i,

  // Accessibility
  HIGH_CONTRAST: /(?:turn on|enable) high contrast/i,
  REDUCE_MOTION: /reduce (?:animations?|motion)/i,
  SCREEN_READER: /(?:turn on|enable) screen reader (?:mode|support)/i,

  // Advanced
  ENABLE_BETA: /(?:join|enable|activate) beta/i,
  ENABLE_EXPERIMENTAL: /(?:turn on|enable) experimental features/i,

  // Account actions
  DELETE_ACCOUNT: /delete (?:my )?account/i,
  EXPORT_DATA: /(?:export|download) (?:my )?data/i,
  RESET_INTERVIEW: /(?:reset|redo|retake) (?:my )?interview/i,
}

// Confirmation prompts for destructive actions
export const CONFIRMATION_PROMPTS = {
  DELETE_ACCOUNT:
    'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data, sessions, and behavioral signals.',
  RESET_INTERVIEW:
    'Resetting your interview will clear all your existing behavioral signals and start fresh. Are you sure?',
  STOP_SHARING:
    'Stopping data sharing will prevent future analysis and may limit the quality of insights Parallax can provide. Continue?',
} as const

// Natural language responses for successful actions
export const SUCCESS_MESSAGES = {
  NAME_UPDATED: (name: string) => `Got it — I've updated your name to ${name}.`,
  PRONOUNS_UPDATED: (pronouns: string) => `Perfect. I'll use ${pronouns} pronouns from now on.`,
  NOTIFICATIONS_ENABLED: (type: string) => `${type} notifications are now enabled.`,
  NOTIFICATIONS_DISABLED: (type: string) => `${type} notifications are now disabled.`,
  PROFILE_PUBLIC: 'Your profile is now public and can be discovered by others.',
  PROFILE_PRIVATE: 'Your profile is now private.',
  VOICE_SPEED_UPDATED: (speed: number) => `Voice speed set to ${speed}x.`,
  SETTINGS_UPDATED: 'Settings updated successfully.',
  DATA_EXPORTED: 'Your data export has been started. You'll receive a download link via email shortly.',
  INTERVIEW_RESET: 'Interview reset. You can retake it whenever you're ready.',
} as const
