import { parseProfileCommand, generateSuccessMessage } from './command-parser'
import type { ProfileConciergeAction, ProfileConciergeResponse, ProfileSettings } from '@/types/profile-concierge'

/**
 * Profile Concierge Service
 *
 * Orchestrates voice-driven profile management.
 * Handles command parsing, confirmation flows, and API calls.
 */

export class ProfileConciergeService {
  private baseUrl: string
  private pendingConfirmation: ProfileConciergeAction | null = null

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Process a voice command for profile management
   */
  async processVoiceCommand(transcript: string, confirmed: boolean = false): Promise<ProfileConciergeResponse> {
    // If we have a pending confirmation and user confirmed, execute it
    if (confirmed && this.pendingConfirmation) {
      const action = this.pendingConfirmation
      this.pendingConfirmation = null
      return await this.executeAction(action)
    }

    // Parse the command
    const action = parseProfileCommand(transcript)

    if (!action) {
      return {
        success: false,
        message: "I didn't understand that command. Try saying something like 'change my name to Alex' or 'turn on email notifications'.",
      }
    }

    // Check if confirmation is required
    if (action.confirmation_required && !confirmed) {
      this.pendingConfirmation = action
      return {
        success: false,
        message: action.reason || 'This action requires confirmation.',
        requires_confirmation: true,
        confirmation_prompt: action.reason,
      }
    }

    // Execute the action
    return await this.executeAction(action)
  }

  /**
   * Execute a profile concierge action
   */
  private async executeAction(action: ProfileConciergeAction): Promise<ProfileConciergeResponse> {
    try {
      switch (action.action) {
        case 'update_display_name':
        case 'update_pronouns':
        case 'update_accessibility':
        case 'enable_beta_features':
          return await this.updateSettings(action.parameters)

        case 'toggle_notifications':
          return await this.toggleNotifications(action.parameters)

        case 'update_session_preferences':
          return await this.updateSessionPreferences(action.parameters)

        case 'update_privacy_settings':
          return await this.updatePrivacySettings(action.parameters)

        case 'update_voice_settings':
          return await this.updateVoiceSettings(action.parameters)

        case 'delete_account':
          return await this.deleteAccount()

        case 'export_data':
          return await this.exportData()

        case 'reset_interview':
          return await this.resetInterview()

        default:
          return {
            success: false,
            message: 'Unknown action.',
          }
      }
    } catch (error) {
      console.error('Error executing action:', error)
      return {
        success: false,
        message: 'Sorry, something went wrong. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Update profile settings
   */
  private async updateSettings(updates: Record<string, unknown>): Promise<ProfileConciergeResponse> {
    const response = await fetch(`${this.baseUrl}/api/profile/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to update settings',
        error: data.error,
      }
    }

    // Determine which action was taken for appropriate message
    let actionType: ProfileConciergeAction['action'] = 'update_display_name'
    if ('pronouns' in updates) actionType = 'update_pronouns'
    else if ('high_contrast_mode' in updates || 'reduce_motion' in updates || 'screen_reader_mode' in updates)
      actionType = 'update_accessibility'
    else if ('beta_access' in updates || 'experimental_features' in updates) actionType = 'enable_beta_features'

    return {
      success: true,
      message: generateSuccessMessage(actionType, updates),
      updated_settings: updates as Partial<ProfileSettings>,
    }
  }

  /**
   * Toggle notification settings
   */
  private async toggleNotifications(params: Record<string, unknown>): Promise<ProfileConciergeResponse> {
    const { type, enabled } = params as { type: string; enabled: boolean }

    const updates: Record<string, boolean> = {}
    if (type.includes('email')) updates.email_notifications = enabled
    else if (type.includes('sms') || type.includes('text')) updates.sms_notifications = enabled
    else if (type.includes('push')) updates.push_notifications = enabled
    else {
      // Default to all notifications
      updates.email_notifications = enabled
      updates.sms_notifications = enabled
      updates.push_notifications = enabled
    }

    const response = await fetch(`${this.baseUrl}/api/profile/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to update notifications',
        error: data.error,
      }
    }

    return {
      success: true,
      message: generateSuccessMessage('toggle_notifications', params),
      updated_settings: updates as Partial<ProfileSettings>,
    }
  }

  /**
   * Update session preferences
   */
  private async updateSessionPreferences(params: Record<string, unknown>): Promise<ProfileConciergeResponse> {
    return await this.updateSettings(params)
  }

  /**
   * Update privacy settings
   */
  private async updatePrivacySettings(params: Record<string, unknown>): Promise<ProfileConciergeResponse> {
    return await this.updateSettings(params)
  }

  /**
   * Update voice settings
   */
  private async updateVoiceSettings(params: Record<string, unknown>): Promise<ProfileConciergeResponse> {
    return await this.updateSettings(params)
  }

  /**
   * Delete user account (requires confirmation)
   */
  private async deleteAccount(): Promise<ProfileConciergeResponse> {
    const response = await fetch(`${this.baseUrl}/api/profile/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to delete account',
        error: data.error,
      }
    }

    return {
      success: true,
      message: 'Your account has been deleted. All your data has been permanently removed.',
    }
  }

  /**
   * Export user data
   */
  private async exportData(): Promise<ProfileConciergeResponse> {
    const response = await fetch(`${this.baseUrl}/api/profile/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to export data',
        error: data.error,
      }
    }

    return {
      success: true,
      message: generateSuccessMessage('export_data', {}),
    }
  }

  /**
   * Reset interview and behavioral signals
   */
  private async resetInterview(): Promise<ProfileConciergeResponse> {
    const response = await fetch(`${this.baseUrl}/api/profile/interview/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to reset interview',
        error: data.error,
      }
    }

    return {
      success: true,
      message: generateSuccessMessage('reset_interview', {}),
    }
  }

  /**
   * Get current profile settings
   */
  async getSettings(): Promise<ProfileSettings | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profile/settings`)
      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to fetch settings:', data.error)
        return null
      }

      return data.settings
    } catch (error) {
      console.error('Error fetching settings:', error)
      return null
    }
  }

  /**
   * Cancel pending confirmation
   */
  cancelPendingConfirmation(): void {
    this.pendingConfirmation = null
  }

  /**
   * Check if there's a pending confirmation
   */
  hasPendingConfirmation(): boolean {
    return this.pendingConfirmation !== null
  }
}

// Singleton instance
let conciergeInstance: ProfileConciergeService | null = null

export function getProfileConcierge(): ProfileConciergeService {
  if (!conciergeInstance) {
    conciergeInstance = new ProfileConciergeService()
  }
  return conciergeInstance
}
