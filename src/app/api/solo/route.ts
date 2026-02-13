import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { soloMessage } from '@/lib/opus'
import { buildSoloPrompt } from '@/lib/prompts/conductor'
import { buildIntelligenceContext, buildIntelligencePromptSection } from '@/lib/context-injector'
import { extractSoloSignals } from '@/lib/solo-extractor'

/**
 * GET /api/solo?session_id=X
 *
 * Fetch message history for a solo session.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')

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

  return NextResponse.json({ messages: data || [] })
}

/**
 * POST /api/solo
 *
 * Send a message in a solo session and get Parallax's response.
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

  // 4. Load user profile intelligence (if authenticated)
  let displayName = session.person_a_name || 'Friend'
  let intelligenceBlock = ''

  if (user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', user_id)
      .single()

    if (profile?.display_name) displayName = profile.display_name

    const intelligenceContext = await buildIntelligenceContext(session_id, user_id, null)
    intelligenceBlock = buildIntelligencePromptSection(intelligenceContext)
  }

  // 5. Count user messages for familiarity tier
  const userMessageCount = messages_list.filter((m) => m.sender === 'person_a').length

  // 6. Build solo prompt
  const systemPrompt = buildSoloPrompt(displayName, intelligenceBlock, userMessageCount)

  // 7. Build multi-turn messages array
  const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages_list.map((m) => ({
    role: m.sender === 'person_a' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))

  // For greeting, add a synthetic user message to prompt Claude
  if (trigger === 'greeting' && claudeMessages.length === 0) {
    claudeMessages.push({
      role: 'user',
      content: `[${displayName} just opened a solo session. Greet them warmly.]`,
    })
  }

  // 8. Call Claude
  let response: string
  try {
    response = await soloMessage(systemPrompt, claudeMessages, 1024)
  } catch {
    return NextResponse.json({ error: 'Parallax response failed' }, { status: 502 })
  }

  // 9. Insert Parallax response
  await supabase.from('messages').insert({
    session_id,
    sender: 'mediator',
    content: response,
  })

  // 10. Fire-and-forget signal extraction every 5 user messages (auth'd users only)
  if (user_id && userMessageCount > 0 && userMessageCount % 5 === 0) {
    const userMessages = messages_list
      .filter((m) => m.sender === 'person_a')
      .map((m) => m.content)
    extractSoloSignals(user_id, userMessages).catch(() => {
      // Signal extraction is non-critical
    })
  }

  return NextResponse.json({ message: response })
}
