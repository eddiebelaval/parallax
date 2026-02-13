'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { ToolResult } from '@/types/conversation'

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

// Fields that should sync to Supabase user_profiles when changed
const SYNCED_FIELDS = new Set(['display_name', 'context_mode'])

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
    // localStorage full or unavailable
  }
}

interface SettingsContextValue {
  settings: ParallaxSettings
  updateSetting: (key: keyof ParallaxSettings, value: unknown) => void
  applyToolResults: (toolResults: ToolResult[]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParallaxSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSetting = useCallback(
    (key: keyof ParallaxSettings, value: unknown) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveSettings(next)

        // Sync display_name and context_mode to Supabase
        if (SYNCED_FIELDS.has(key)) {
          const field = key === 'context_mode' ? 'primary_context_mode' : key
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase
                .from('user_profiles')
                .update({ [field]: value })
                .eq('user_id', user.id)
                .then(({ error }) => {
                  if (error) console.error(`Failed to sync ${key} to Supabase:`, error)
                })
            }
          })
        }

        return next
      })
    },
    [],
  )

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

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, applyToolResults }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
