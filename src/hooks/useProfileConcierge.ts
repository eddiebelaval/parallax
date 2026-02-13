import { useState, useCallback, useEffect } from 'react'
import { getProfileConcierge } from '@/lib/profile-concierge/service'
import { isProfileCommand } from '@/lib/profile-concierge/command-parser'
import type { ProfileConciergeResponse, ProfileSettings } from '@/types/profile-concierge'

/**
 * Profile Concierge Hook
 *
 * Enables voice-driven profile management throughout the app.
 * Integrates with useParallaxVoice for seamless voice command handling.
 */

export function useProfileConcierge() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResponse, setLastResponse] = useState<ProfileConciergeResponse | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  const concierge = getProfileConcierge()

  // Load initial settings
  useEffect(() => {
    loadSettings()
  }, [])

  /**
   * Load current profile settings
   */
  const loadSettings = useCallback(async () => {
    const data = await concierge.getSettings()
    if (data) {
      setSettings(data)
    }
  }, [])

  /**
   * Process a voice command for profile management
   */
  const processCommand = useCallback(
    async (transcript: string, confirmed: boolean = false): Promise<ProfileConciergeResponse> => {
      setIsProcessing(true)

      try {
        const response = await concierge.processVoiceCommand(transcript, confirmed)
        setLastResponse(response)

        // Update pending confirmation state
        if (response.requires_confirmation) {
          setPendingConfirmation(true)
        } else {
          setPendingConfirmation(false)

          // Reload settings if successful
          if (response.success && response.updated_settings) {
            await loadSettings()
          }
        }

        return response
      } finally {
        setIsProcessing(false)
      }
    },
    [loadSettings]
  )

  /**
   * Confirm a pending action
   */
  const confirm = useCallback(async (): Promise<ProfileConciergeResponse> => {
    if (!pendingConfirmation) {
      return {
        success: false,
        message: 'No pending confirmation',
      }
    }

    return await processCommand('', true)
  }, [pendingConfirmation, processCommand])

  /**
   * Cancel a pending confirmation
   */
  const cancel = useCallback(() => {
    concierge.cancelPendingConfirmation()
    setPendingConfirmation(false)
    setLastResponse(null)
  }, [])

  /**
   * Check if a transcript contains a profile command
   */
  const isCommand = useCallback((transcript: string): boolean => {
    return isProfileCommand(transcript)
  }, [])

  /**
   * Update a specific setting
   */
  const updateSetting = useCallback(
    async (key: keyof ProfileSettings, value: unknown): Promise<boolean> => {
      setIsProcessing(true)

      try {
        const response = await fetch('/api/profile/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        })

        const data = await response.json()

        if (response.ok) {
          await loadSettings()
          return true
        }

        console.error('Failed to update setting:', data.error)
        return false
      } catch (error) {
        console.error('Error updating setting:', error)
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [loadSettings]
  )

  return {
    // State
    settings,
    isProcessing,
    lastResponse,
    pendingConfirmation,

    // Actions
    processCommand,
    confirm,
    cancel,
    isCommand,
    updateSetting,
    loadSettings,
  }
}
