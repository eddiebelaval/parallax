'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ToolResult } from '@/types/conversation'

/**
 * useSettings — localStorage-backed user preferences
 *
 * Reads/writes to localStorage under a namespaced key.
 * When the Guide executes an update_setting tool call,
 * the useConversation hook calls applyToolResults to persist the change.
 */

const STORAGE_KEY = 'parallax-settings'

export interface ParallaxSettings {
  display_name: string
  voice_enabled: boolean
  show_analysis: boolean
  show_temperature: boolean
  auto_expand: boolean
  context_mode: string
}

const DEFAULT_SETTINGS: ParallaxSettings = {
  display_name: 'User',
  voice_enabled: true,
  show_analysis: true,
  show_temperature: true,
  auto_expand: true,
  context_mode: 'intimate',
}

function loadSettings(): ParallaxSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: ParallaxSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<ParallaxSettings>(DEFAULT_SETTINGS)

  // Load from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSetting = useCallback(
    (key: keyof ParallaxSettings, value: unknown) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveSettings(next)
        return next
      })
    },
    [],
  )

  /**
   * Apply tool results from the Guide's tool_use calls.
   * Filters for successful update_setting calls and applies them.
   */
  const applyToolResults = useCallback(
    (toolResults: ToolResult[]) => {
      for (const result of toolResults) {
        if (result.toolName === 'update_setting' && result.success) {
          const key = result.input.key as keyof ParallaxSettings
          const value = result.input.value
          updateSetting(key, value)
        }
      }
    },
    [updateSetting],
  )

  return { settings, updateSetting, applyToolResults }
}
