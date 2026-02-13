'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationalPanel } from '@/components/ConversationalPanel'
import type { ToolResult } from '@/types/conversation'

/**
 * ParallaxFAB — Floating Action Button for the Parallax Guide.
 *
 * Always visible in the bottom-right corner on /home and /settings.
 * Opens the ConversationalPanel in Guide mode as a slide-out panel.
 * Handles navigate_to tool results by routing the user client-side.
 */
export function ParallaxFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Handle navigate_to tool results from the Guide
  const handleToolResults = useCallback((results: ToolResult[]) => {
    for (const result of results) {
      if (result.toolName === 'navigate_to' && result.success) {
        const page = result.input.page as string
        const routes: Record<string, string> = {
          home: '/home',
          interview: '/interview',
          settings: '/settings',
          profile: '/profile',
        }
        const route = routes[page]
        if (route) {
          setTimeout(() => router.push(route), 800)
        }
      }
    }
  }, [router])

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full border border-success/40 bg-surface/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:border-success/60 hover:shadow-[0_0_20px_rgba(106,171,142,0.2)] ${
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'
        }`}
        aria-label="Open Parallax Guide"
      >
        {/* Teal presence dot */}
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-success" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-30" />
        </div>
      </button>

      {/* Guide Panel — reuses existing ConversationalPanel */}
      <ConversationalPanel
        mode="guide"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onToolResults={handleToolResults}
      />
    </>
  )
}
