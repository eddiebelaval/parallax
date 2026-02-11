'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { ConversationalMode } from '@/types/conversation'

interface ConversationalContextValue {
  isOpen: boolean
  mode: ConversationalMode
  openPanel: (mode: ConversationalMode) => void
  closePanel: () => void
}

const ConversationalContext = createContext<ConversationalContextValue | null>(null)

export function ConversationalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ConversationalMode>('explorer')

  const openPanel = useCallback((m: ConversationalMode) => {
    setMode(m)
    setIsOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <ConversationalContext.Provider value={{ isOpen, mode, openPanel, closePanel }}>
      {children}
    </ConversationalContext.Provider>
  )
}

export function useConversationalPanel() {
  const ctx = useContext(ConversationalContext)
  if (!ctx) throw new Error('useConversationalPanel must be used within ConversationalProvider')
  return ctx
}
