'use client'

// Re-export from SettingsContext — the context provides reactive updates
// across all components when settings change (including Guide tool calls)
export { useSettings } from '@/contexts/SettingsContext'
export type { ParallaxSettings } from '@/contexts/SettingsContext'
