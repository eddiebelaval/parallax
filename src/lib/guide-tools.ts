import type Anthropic from '@anthropic-ai/sdk'
import type { ToolResult } from '@/types/conversation'

/**
 * Guide Tools — Claude tool_use definitions for the Parallax Guide
 *
 * These tools let the Guide take actions on behalf of the user:
 * - update_setting: Change a user preference
 * - get_settings: Read current preferences
 *
 * Settings are applied client-side (localStorage). The server acknowledges
 * the tool call and returns the result to the frontend for execution.
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
 */
export function executeGuideToolCall(
  toolName: string,
  input: Record<string, unknown>,
): ToolResult {
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

  return {
    toolName,
    input,
    output: `Unknown tool: ${toolName}`,
    success: false,
  }
}
