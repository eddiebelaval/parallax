import type Anthropic from '@anthropic-ai/sdk'
import type { ToolResult } from '@/types/conversation'
import { createServerClient } from '@/lib/supabase'

/**
 * Guide Tools — Claude tool_use definitions for the Parallax Guide
 *
 * These tools let the Guide take actions on behalf of the user:
 * - update_setting: Change a user preference (client-side localStorage)
 * - get_settings: Read current preferences
 * - navigate_to: Route user to a page (client-side router.push)
 * - update_profile: Update display_name or context_mode in Supabase
 * - get_profile: Read profile + signal summary from Supabase
 */

export const SETTING_KEYS = [
  'display_name',
  'voice_enabled',
  'show_analysis',
  'show_temperature',
  'auto_expand',
  'context_mode',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]

const SETTING_DESCRIPTIONS: Record<SettingKey, string> = {
  display_name: 'The name shown on messages (string)',
  voice_enabled: 'Whether voice input microphone is shown (boolean)',
  show_analysis: 'Whether NVC analysis sections are visible on messages (boolean)',
  show_temperature: 'Whether temperature scores and SignalRail are visible (boolean)',
  auto_expand: 'Whether analysis auto-expands after The Melt animation (boolean)',
  context_mode:
    'Relationship context mode: intimate, family, professional_peer, professional_hierarchical, transactional, civil_structural',
}

export const GUIDE_TOOLS: Anthropic.Tool[] = [
  {
    name: 'update_setting',
    description:
      'Update a user preference in Parallax. Use this when the user asks to change a setting, toggle a feature, or modify their display name. The change takes effect immediately in the UI.',
    input_schema: {
      type: 'object' as const,
      properties: {
        key: {
          type: 'string',
          enum: [...SETTING_KEYS],
          description: `The setting to change. Options: ${SETTING_KEYS.map((k) => `${k} (${SETTING_DESCRIPTIONS[k]})`).join(', ')}`,
        },
        value: {
          description:
            'The new value. Use true/false for booleans, a string for display_name, or a valid enum value for context_mode.',
        },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'get_settings',
    description:
      'Get the current user preferences and settings. Use this when the user asks what their current settings are, or before suggesting a change.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'navigate_to',
    description:
      'Navigate the user to a page in Parallax. Use this when the user asks to go somewhere, e.g. "take me to settings" or "go to my profile". The navigation happens on the client side.',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'string',
          enum: ['home', 'interview', 'settings', 'profile'],
          description: 'The page to navigate to: home, interview, settings, or profile',
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'replay_tour',
    description:
      'Replay the Parallax landing page narration tour. Use when the user wants to see the introduction again.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'update_profile',
    description:
      'Update the user\'s Supabase profile. Use this to change display_name or primary_context_mode in the database. This persists across sessions (unlike settings which are localStorage only).',
    input_schema: {
      type: 'object' as const,
      properties: {
        field: {
          type: 'string',
          enum: ['display_name', 'primary_context_mode'],
          description: 'The profile field to update',
        },
        value: {
          type: 'string',
          description: 'The new value for the field',
        },
      },
      required: ['field', 'value'],
    },
  },
  {
    name: 'get_profile',
    description:
      'Read the user\'s profile and behavioral signal summary from Supabase. Use this to understand who the user is, what signals have been extracted, and whether they have completed the interview.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
]

/**
 * Default settings — used as the server-side response for get_settings.
 * The frontend merges these with localStorage overrides.
 */
const DEFAULT_SETTINGS: Record<SettingKey, unknown> = {
  display_name: 'User',
  voice_enabled: true,
  show_analysis: true,
  show_temperature: true,
  auto_expand: true,
  context_mode: 'intimate',
}

const VALID_CONTEXT_MODES = [
  'intimate',
  'family',
  'professional_peer',
  'professional_hierarchical',
  'transactional',
  'civil_structural',
]

const VALID_PAGES: Record<string, string> = {
  home: '/home',
  interview: '/interview',
  settings: '/settings',
  profile: '/profile',
}

function validateSettingValue(
  key: SettingKey,
  value: unknown,
): { valid: boolean; error?: string } {
  switch (key) {
    case 'display_name':
      if (typeof value !== 'string' || value.trim().length === 0 || value.length > 50) {
        return { valid: false, error: 'Must be a non-empty string (max 50 chars)' }
      }
      return { valid: true }
    case 'voice_enabled':
    case 'show_analysis':
    case 'show_temperature':
    case 'auto_expand':
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Must be true or false' }
      }
      return { valid: true }
    case 'context_mode':
      if (typeof value !== 'string' || !VALID_CONTEXT_MODES.includes(value)) {
        return { valid: false, error: `Must be one of: ${VALID_CONTEXT_MODES.join(', ')}` }
      }
      return { valid: true }
    default:
      return { valid: true }
  }
}

/**
 * Execute a Guide tool call server-side.
 *
 * For update_setting: validates the key and value, returns success.
 * The actual application happens on the frontend via toolResults.
 *
 * For get_settings: returns the default settings.
 * The frontend can merge with localStorage for actual values.
 *
 * For navigate_to: validates the page name, returns the route path.
 * The frontend handles the actual router.push().
 *
 * For update_profile / get_profile: uses Supabase service role to
 * read/write the user_profiles table. Requires userId.
 */
export async function executeGuideToolCall(
  toolName: string,
  input: Record<string, unknown>,
  userId?: string,
): Promise<ToolResult> {
  if (toolName === 'update_setting') {
    const key = input.key as string
    const value = input.value

    if (!SETTING_KEYS.includes(key as SettingKey)) {
      return {
        toolName,
        input,
        output: `Unknown setting key: ${key}. Valid keys: ${SETTING_KEYS.join(', ')}`,
        success: false,
      }
    }

    const validation = validateSettingValue(key as SettingKey, value)
    if (!validation.valid) {
      return {
        toolName,
        input,
        output: `Invalid value for "${key}": ${validation.error}`,
        success: false,
      }
    }

    return {
      toolName,
      input,
      output: `Setting "${key}" updated to ${JSON.stringify(value)}. The change is now active.`,
      success: true,
    }
  }

  if (toolName === 'get_settings') {
    return {
      toolName,
      input,
      output: JSON.stringify(DEFAULT_SETTINGS, null, 2),
      success: true,
    }
  }

  if (toolName === 'navigate_to') {
    const page = input.page as string
    const route = VALID_PAGES[page]
    if (!route) {
      return {
        toolName,
        input,
        output: `Unknown page: ${page}. Valid pages: ${Object.keys(VALID_PAGES).join(', ')}`,
        success: false,
      }
    }
    return {
      toolName,
      input,
      output: `Navigating to ${route}`,
      success: true,
    }
  }

  if (toolName === 'replay_tour') {
    return {
      toolName,
      input,
      output: 'Replaying the tour now.',
      success: true,
    }
  }

  if (toolName === 'update_profile') {
    if (!userId) {
      return { toolName, input, output: 'User not authenticated', success: false }
    }
    const field = input.field as string
    const value = input.value as string

    if (field === 'display_name') {
      if (!value || value.trim().length === 0 || value.length > 50) {
        return { toolName, input, output: 'Display name must be 1-50 characters', success: false }
      }
    } else if (field === 'primary_context_mode') {
      if (!VALID_CONTEXT_MODES.includes(value)) {
        return { toolName, input, output: `Invalid context mode. Valid: ${VALID_CONTEXT_MODES.join(', ')}`, success: false }
      }
    } else {
      return { toolName, input, output: `Cannot update field: ${field}`, success: false }
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ [field]: value })
      .eq('user_id', userId)

    if (error) {
      return { toolName, input, output: `Failed to update profile: ${error.message}`, success: false }
    }

    return {
      toolName,
      input,
      output: `Profile ${field} updated to "${value}".`,
      success: true,
    }
  }

  if (toolName === 'get_profile') {
    if (!userId) {
      return { toolName, input, output: 'User not authenticated', success: false }
    }

    const supabase = createServerClient()
    const [{ data: profile }, { data: signals }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('behavioral_signals').select('signal_type, signal_value').eq('user_id', userId).order('signal_type'),
    ])

    const summary = {
      display_name: profile?.display_name ?? 'Unknown',
      interview_completed: profile?.interview_completed ?? false,
      primary_context_mode: profile?.primary_context_mode ?? 'intimate',
      signal_count: signals?.length ?? 0,
      signals: (signals ?? []).map((s: { signal_type: string; signal_value: unknown }) => ({
        type: s.signal_type,
        value: s.signal_value,
      })),
    }

    return {
      toolName,
      input,
      output: JSON.stringify(summary, null, 2),
      success: true,
    }
  }

  return {
    toolName,
    input,
    output: `Unknown tool: ${toolName}`,
    success: false,
  }
}
