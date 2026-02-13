import {
  PROFILE_COMMANDS,
  CONFIRMATION_PROMPTS,
  SUCCESS_MESSAGES,
  type ProfileConciergeAction,
  type ProfileSettings,
} from '@/types/profile-concierge'

/**
 * Command Parser for Profile Concierge
 *
 * Parses natural language voice commands into structured actions
 * for profile settings management.
 */

export function parseProfileCommand(transcript: string): ProfileConciergeAction | null {
  const text = transcript.trim().toLowerCase()

  // Display name
  const nameMatch = text.match(PROFILE_COMMANDS.CHANGE_NAME)
  if (nameMatch) {
    return {
      action: 'update_display_name',
      parameters: { display_name: nameMatch[1].trim() },
      confirmation_required: false,
    }
  }

  // Pronouns
  const pronounsMatch = text.match(PROFILE_COMMANDS.SET_PRONOUNS)
  if (pronounsMatch) {
    return {
      action: 'update_pronouns',
      parameters: { pronouns: pronounsMatch[1].trim() },
      confirmation_required: false,
    }
  }

  // Enable notifications
  const enableNotifMatch = text.match(PROFILE_COMMANDS.ENABLE_NOTIFICATIONS)
  if (enableNotifMatch) {
    const type = enableNotifMatch[1].trim()
    return {
      action: 'toggle_notifications',
      parameters: { type, enabled: true },
      confirmation_required: false,
    }
  }

  // Disable notifications
  const disableNotifMatch = text.match(PROFILE_COMMANDS.DISABLE_NOTIFICATIONS)
  if (disableNotifMatch) {
    const type = disableNotifMatch[1].trim()
    return {
      action: 'toggle_notifications',
      parameters: { type, enabled: false },
      confirmation_required: false,
    }
  }

  // Set default session mode
  const modeMatch = text.match(PROFILE_COMMANDS.SET_DEFAULT_MODE)
  if (modeMatch) {
    const mode = modeMatch[1].trim()
    return {
      action: 'update_session_preferences',
      parameters: { default_session_mode: mode.includes('remote') ? 'remote' : 'in-person' },
      confirmation_required: false,
    }
  }

  // Auto-record sessions
  if (PROFILE_COMMANDS.AUTO_RECORD.test(text)) {
    return {
      action: 'update_session_preferences',
      parameters: { auto_record_sessions: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.STOP_AUTO_RECORD.test(text)) {
    return {
      action: 'update_session_preferences',
      parameters: { auto_record_sessions: false },
      confirmation_required: false,
    }
  }

  // Privacy settings
  if (PROFILE_COMMANDS.MAKE_PROFILE_PUBLIC.test(text)) {
    return {
      action: 'update_privacy_settings',
      parameters: { public_profile: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.MAKE_PROFILE_PRIVATE.test(text)) {
    return {
      action: 'update_privacy_settings',
      parameters: { public_profile: false },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.SHARE_DATA.test(text)) {
    return {
      action: 'update_privacy_settings',
      parameters: { share_behavioral_signals: true, allow_research_data_use: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.STOP_SHARING.test(text)) {
    return {
      action: 'update_privacy_settings',
      parameters: { share_behavioral_signals: false, allow_research_data_use: false },
      confirmation_required: true,
      reason: CONFIRMATION_PROMPTS.STOP_SHARING,
    }
  }

  // Voice settings
  const voiceSpeedMatch = text.match(PROFILE_COMMANDS.CHANGE_VOICE_SPEED)
  if (voiceSpeedMatch) {
    const speedText = voiceSpeedMatch[1].trim()
    let speed = 1.0

    if (speedText.includes('slow')) speed = 0.75
    else if (speedText.includes('fast')) speed = 1.5
    else if (speedText.includes('faster')) speed = 1.75
    else {
      const numMatch = speedText.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) speed = parseFloat(numMatch[1])
    }

    speed = Math.max(0.5, Math.min(2.0, speed)) // Clamp to 0.5-2.0

    return {
      action: 'update_voice_settings',
      parameters: { voice_speed: speed },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.ENABLE_VOICE.test(text)) {
    return {
      action: 'update_voice_settings',
      parameters: { voice_enabled: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.DISABLE_VOICE.test(text)) {
    return {
      action: 'update_voice_settings',
      parameters: { voice_enabled: false },
      confirmation_required: false,
    }
  }

  // Accessibility
  if (PROFILE_COMMANDS.HIGH_CONTRAST.test(text)) {
    return {
      action: 'update_accessibility',
      parameters: { high_contrast_mode: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.REDUCE_MOTION.test(text)) {
    return {
      action: 'update_accessibility',
      parameters: { reduce_motion: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.SCREEN_READER.test(text)) {
    return {
      action: 'update_accessibility',
      parameters: { screen_reader_mode: true },
      confirmation_required: false,
    }
  }

  // Advanced features
  if (PROFILE_COMMANDS.ENABLE_BETA.test(text)) {
    return {
      action: 'enable_beta_features',
      parameters: { beta_access: true },
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.ENABLE_EXPERIMENTAL.test(text)) {
    return {
      action: 'enable_beta_features',
      parameters: { experimental_features: true },
      confirmation_required: false,
    }
  }

  // Destructive actions
  if (PROFILE_COMMANDS.DELETE_ACCOUNT.test(text)) {
    return {
      action: 'delete_account',
      parameters: {},
      confirmation_required: true,
      reason: CONFIRMATION_PROMPTS.DELETE_ACCOUNT,
    }
  }

  if (PROFILE_COMMANDS.EXPORT_DATA.test(text)) {
    return {
      action: 'export_data',
      parameters: {},
      confirmation_required: false,
    }
  }

  if (PROFILE_COMMANDS.RESET_INTERVIEW.test(text)) {
    return {
      action: 'reset_interview',
      parameters: { interview_completed: false },
      confirmation_required: true,
      reason: CONFIRMATION_PROMPTS.RESET_INTERVIEW,
    }
  }

  // No match
  return null
}

/**
 * Generate natural language response for successful action
 */
export function generateSuccessMessage(
  action: ProfileConciergeAction['action'],
  parameters: Record<string, unknown>
): string {
  switch (action) {
    case 'update_display_name':
      return SUCCESS_MESSAGES.NAME_UPDATED(parameters.display_name as string)
    case 'update_pronouns':
      return SUCCESS_MESSAGES.PRONOUNS_UPDATED(parameters.pronouns as string)
    case 'toggle_notifications': {
      const type = (parameters.type as string).charAt(0).toUpperCase() + (parameters.type as string).slice(1)
      return parameters.enabled
        ? SUCCESS_MESSAGES.NOTIFICATIONS_ENABLED(type)
        : SUCCESS_MESSAGES.NOTIFICATIONS_DISABLED(type)
    }
    case 'update_privacy_settings':
      if ('public_profile' in parameters) {
        return parameters.public_profile ? SUCCESS_MESSAGES.PROFILE_PUBLIC : SUCCESS_MESSAGES.PROFILE_PRIVATE
      }
      return SUCCESS_MESSAGES.SETTINGS_UPDATED
    case 'update_voice_settings':
      if ('voice_speed' in parameters) {
        return SUCCESS_MESSAGES.VOICE_SPEED_UPDATED(parameters.voice_speed as number)
      }
      return SUCCESS_MESSAGES.SETTINGS_UPDATED
    case 'export_data':
      return SUCCESS_MESSAGES.DATA_EXPORTED
    case 'reset_interview':
      return SUCCESS_MESSAGES.INTERVIEW_RESET
    default:
      return SUCCESS_MESSAGES.SETTINGS_UPDATED
  }
}

/**
 * Check if a command is profile-related
 */
export function isProfileCommand(transcript: string): boolean {
  return parseProfileCommand(transcript) !== null
}
