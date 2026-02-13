import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { soloMessage } from '@/lib/opus'
import { buildSoloPrompt } from '@/lib/prompts/conductor'
import { buildIntelligenceContext, buildIntelligencePromptSection } from '@/lib/context-injector'
import { extractSoloSignals } from '@/lib/solo-extractor'
import { extractSidebarInsights } from '@/lib/sidebar-extractor'
import type { SoloMemory } from '@/types/database'

/**
 * GET /api/solo?session_id=X&user_id=Y
 *
 * Fetch message history + sidebar insights for a solo session.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  const user_id = searchParams.get('user_id')

  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Load solo_memory from user profile if authenticated
  let insights: SoloMemory | null = null
  if (user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('solo_memory')
      .eq('user_id', user_id)
      .single()

    if (profile?.solo_memory && Object.keys(profile.solo_memory).length > 0) {
      insights = profile.solo_memory as SoloMemory
    }
  }

  return NextResponse.json({ messages: data || [], insights })
}

/**
 * POST /api/solo
 *
 * Send a message in a solo session and get Parallax's response.
 * Returns { message, insights } — insights extracted by Haiku after every response.
 *
 * Body: { session_id, user_id, message }
 *   or: { session_id, user_id, trigger: 'greeting' } for initial greeting
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { session_id, user_id, message, trigger } = body as {
    session_id: string
    user_id?: string
    message?: string
    trigger?: 'greeting'
  }

  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  if (!message && trigger !== 'greeting') {
    return NextResponse.json({ error: 'message or trigger required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 1. Verify session exists and is solo mode
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single()

  if (!session || session.mode !== 'solo') {
    return NextResponse.json({ error: 'Solo session not found' }, { status: 404 })
  }

  // 2. Insert user message (skip for greeting trigger)
  if (message && trigger !== 'greeting') {
    await supabase.from('messages').insert({
      session_id,
      sender: 'person_a',
      content: message,
    })
  }

  // 3. Fetch full message history
  const { data: allMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  const messages_list = allMessages || []

  // 4. Load user profile + solo memory (if authenticated)
  let displayName = session.person_a_name || 'Friend'
  let intelligenceBlock = ''
  let existingMemory: SoloMemory | Record<string, never> | null = null

  if (user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, solo_memory')
      .eq('user_id', user_id)
      .single()

    // Ensure profile row exists (covers demo-mode auth bypass and edge cases)
    if (!profile) {
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(
          { user_id, display_name: session.person_a_name || null },
          { onConflict: 'user_id' },
        )
      if (upsertError) {
        console.error('[solo/POST] Failed to create profile row:', {
          userId: user_id,
          error: upsertError.message,
          code: upsertError.code,
        })
      }
    }

    if (profile?.display_name) displayName = profile.display_name
    if (profile?.solo_memory && Object.keys(profile.solo_memory).length > 0) {
      existingMemory = profile.solo_memory as SoloMemory
    }

    const intelligenceContext = await buildIntelligenceContext(session_id, user_id, null)
    intelligenceBlock = buildIntelligencePromptSection(intelligenceContext)
  }

  // 5. Count user messages for familiarity tier
  const userMessageCount = messages_list.filter((m) => m.sender === 'person_a').length

  // 6. Build solo prompt with memory injection
  const memory = existingMemory && 'identity' in existingMemory
    ? existingMemory as SoloMemory
    : null
  const systemPrompt = buildSoloPrompt(displayName, intelligenceBlock, userMessageCount, memory)

  // 7. Build multi-turn messages array
  const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages_list.map((m) => ({
    role: m.sender === 'person_a' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))

  // 8. Dynamic greeting for returning vs new users
  if (trigger === 'greeting' && claudeMessages.length === 0) {
    const soloStyles = [
      'Start with a question about how they are doing.',
      'Open with something warm and specific — not generic.',
      'Be casual, like texting a friend you haven\'t seen in a bit.',
      'Start by noticing the time — morning energy is different from evening energy.',
      'Lead with genuine curiosity about what is on their mind.',
      'Be direct and present — skip small talk, show you are here.',
    ]
    const style = soloStyles[Math.floor(Math.random() * soloStyles.length)]
    const now = new Date()
    const hour = now.getHours()
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

    if (memory?.identity?.name) {
      // Returning user — reference recent context
      const recentTopic = memory.recentSessions.length > 0
        ? memory.recentSessions[memory.recentSessions.length - 1].summary
        : null
      claudeMessages.push({
        role: 'user',
        content: `[${displayName} is back for session #${(memory.sessionCount || 0) + 1}. It is ${period}. ${style} ${recentTopic ? `Last time you talked about: ${recentTopic}. Reference it naturally if relevant.` : ''} Do NOT start with "Hey ${displayName}!" every time — vary your opening.]`,
      })
    } else {
      // New user
      claudeMessages.push({
        role: 'user',
        content: `[${displayName} just opened a solo session. It is ${period}. ${style} Greet them warmly. Do NOT start with the same opening every time.]`,
      })
    }
  }

  // 9. Call Claude
  let response: string
  try {
    response = await soloMessage(systemPrompt, claudeMessages, 1024)
  } catch {
    return NextResponse.json({ error: 'Parallax response failed' }, { status: 502 })
  }

  // 10. Insert Parallax response
  await supabase.from('messages').insert({
    session_id,
    sender: 'mediator',
    content: response,
  })

  // 11. Extract sidebar insights (Haiku, parallel, non-blocking for response)
  const allMsgsForExtraction = [
    ...messages_list.map((m) => ({ sender: m.sender, content: m.content })),
    { sender: 'mediator', content: response },
  ]

  // Fire extraction but don't block the response
  const insightsPromise = extractSidebarInsights(allMsgsForExtraction, existingMemory, user_id)
    .catch(() => null)

  // 12. Fire-and-forget signal extraction every 5 user messages (auth'd users only)
  if (user_id && userMessageCount > 0 && userMessageCount % 5 === 0) {
    const userMessages = messages_list
      .filter((m) => m.sender === 'person_a')
      .map((m) => m.content)
    extractSoloSignals(user_id, userMessages).catch(() => {
      // Signal extraction is non-critical
    })
  }

  // 13. Await sidebar insights (Haiku is fast enough to include in response)
  const insights = await insightsPromise

  return NextResponse.json({ message: response, insights })
}
