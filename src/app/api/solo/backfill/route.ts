import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { extractSidebarInsights } from '@/lib/sidebar-extractor'
import type { SoloMemory } from '@/types/database'

/**
 * POST /api/solo/backfill
 *
 * One-shot endpoint that loads all messages from a session and runs
 * sidebar extraction to populate or enrich a user's solo_memory.
 *
 * Body: { session_id, user_id }
 * Auth: Bearer token must match SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(request: Request) {
  // Guard: require service role key
  const authHeader = request.headers.get('authorization')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { session_id, user_id } = body as { session_id?: string; user_id?: string }

  if (!session_id || !user_id) {
    return NextResponse.json({ error: 'session_id and user_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 1. Fetch all messages from the session
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('sender, content')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('[solo/backfill] Failed to fetch messages:', {
      sessionId: session_id,
      error: messagesError.message,
    })
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages found for session' }, { status: 404 })
  }

  // 2. Load existing solo_memory (if any)
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('solo_memory')
    .eq('user_id', user_id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('[solo/backfill] Failed to load existing profile:', {
      userId: user_id,
      error: profileError.message,
    })
    return NextResponse.json({ error: 'Failed to load user profile' }, { status: 500 })
  }

  const existingMemory = profile?.solo_memory &&
    typeof profile.solo_memory === 'object' &&
    Object.keys(profile.solo_memory).length > 0
    ? (profile.solo_memory as SoloMemory)
    : null

  // 3. Run extraction on full message history (persists via upsert internally)
  let insights: SoloMemory | null
  try {
    insights = await extractSidebarInsights(
      messages.map((m) => ({ sender: m.sender, content: m.content })),
      existingMemory,
      user_id,
    )
  } catch (err) {
    console.error('[solo/backfill] Extraction threw:', {
      error: err instanceof Error ? err.message : String(err),
      sessionId: session_id,
      userId: user_id,
    })
    return NextResponse.json(
      { error: 'Extraction failed', detail: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 },
    )
  }

  if (!insights) {
    return NextResponse.json(
      { error: 'Extraction produced no insights' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true, insights })
}
