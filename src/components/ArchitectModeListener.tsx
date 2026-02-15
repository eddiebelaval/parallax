'use client'

import { useEffect } from 'react'
import { useArchitectMode } from '@/hooks/useArchitectMode'

/**
 * Global keyboard listener for Architect Mode
 * Shift+Tab anywhere in the app toggles the mode
 */
export function ArchitectModeListener() {
  const { toggle, hasAccess } = useArchitectMode()

  useEffect(() => {
    if (!hasAccess) return

    function handleKeyDown(e: KeyboardEvent) {
      // Shift+Tab to toggle Architect Mode
      if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle, hasAccess])

  return null // This component only handles keyboard events
}
