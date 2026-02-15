import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { extractSidebarInsights } from '@/lib/sidebar-extractor'
import type { SoloMemory } from '@/types/database'

/**
 * POST /api/insights
 *
 * Extract sidebar insights from any conversation using Haiku.
 * Used by remote and in-person modes to get the same insight
 * sidebar that solo mode has.
 *
 * Body: { messages: [{ sender, content }], existing_memory? }
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { messages, existing_memory } = body as {
    messages: Array<{ sender: string; content: string }>
    existing_memory?: SoloMemory | null
  }

  if (!messages || messages.length < 2) {
    return NextResponse.json({ insights: null })
  }

  try {
    const insights = await extractSidebarInsights(
      messages,
      existing_memory || null,
      undefined, // No user_id — don't persist to profiles
    )
    return NextResponse.json({ insights })
  } catch {
    return NextResponse.json({ insights: null })
  }
}
