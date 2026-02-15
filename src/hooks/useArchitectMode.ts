'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { isCreator } from '@/lib/creator'

const STORAGE_KEY = 'parallax-architect-mode'

/**
 * Architect Mode - Direct access to Ava's architecture
 *
 * Allows creator to have meta-conversations with Ava about her configuration,
 * memory layers, and reasoning patterns. Not for viewing user data - for tuning the AI.
 *
 * Toggle with Shift+Tab globally.
 */
export function useArchitectMode() {
  const { user } = useAuth()
  const hasAccess = isCreator(user?.email)

  const [isActive, setIsActive] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (!hasAccess) {
      setIsActive(false)
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsActive(true)
    }
  }, [hasAccess])

  // Persist to localStorage when changed
  useEffect(() => {
    if (hasAccess) {
      localStorage.setItem(STORAGE_KEY, String(isActive))
    }
  }, [isActive, hasAccess])

  const toggle = useCallback(() => {
    if (!hasAccess) return
    setIsActive(prev => !prev)
  }, [hasAccess])

  const activate = useCallback(() => {
    if (!hasAccess) return
    setIsActive(true)
  }, [hasAccess])

  const deactivate = useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive: hasAccess && isActive,
    hasAccess,
    toggle,
    activate,
    deactivate,
  }
}
