import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { conductorMessage } from '@/lib/opus'
import { buildCoachingPrompt } from '@/lib/prompts/conductor'
import { buildNameMap, toConversationHistory } from '@/lib/conversation'
import type { Message, OnboardingContext, ConflictAnalysis } from '@/types/database'

/**
 * GET /api/coach?session_id=X&person=person_a
 *
 * Fetch coaching history for a person in a session.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')
  const person = searchParams.get('person')

  if (!session_id || !person || (person !== 'person_a' && person !== 'person_b')) {
    return NextResponse.json({ error: 'session_id and person (person_a|person_b) required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('coaching_messages')
    .select('*')
    .eq('session_id', session_id)
    .eq('person', person)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch coaching messages' }, { status: 500 })
  }

  return NextResponse.json({ messages: data || [] })
}

/**
 * POST /api/coach
 *
 * Send a coaching question, get Parallax's private response, persist both.
 *
 * Body: { session_id, person, message }
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { session_id, person, message } = body as {
    session_id: string
    person: 'person_a' | 'person_b'
    message: string
  }

  if (!session_id || !person || !message) {
    return NextResponse.json({ error: 'session_id, person, and message are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 1. Insert user's coaching message
  await supabase.from('coaching_messages').insert({
    session_id,
    person,
    role: 'user',
    content: message,
  })

  // 2. Fetch ALL coaching history for this person (multi-turn context)
  const { data: coachingHistory } = await supabase
    .from('coaching_messages')
    .select('*')
    .eq('session_id', session_id)
    .eq('person', person)
    .order('created_at', { ascending: true })

  // 3. Fetch session for names, context_mode, goals
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const personAName = session.person_a_name || 'Person A'
  const personBName = session.person_b_name || 'Person B'
  const personName = person === 'person_a' ? personAName : personBName
  const otherName = person === 'person_a' ? personBName : personAName
  const onboarding = (session.onboarding_context as OnboardingContext) || {}

  // 4. Fetch public conversation from messages table
  const { data: publicMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  // Format conversation history
  const nameMap = buildNameMap({
    person_a_name: session.person_a_name,
    person_b_name: session.person_b_name,
  })
  const conversationEntries = toConversationHistory(
    (publicMessages || []) as Message[],
    nameMap,
  )
  const conversationHistory = conversationEntries
    .map((e) => `[${e.sender}]: ${e.content}`)
    .join('\n')

  // Build latest analysis summary
  let analysisSummary = 'No analysis available yet.'
  if (publicMessages && publicMessages.length > 0) {
    const latestAnalyzed = [...publicMessages]
      .reverse()
      .find((m) => m.nvc_analysis && 'meta' in (m.nvc_analysis as unknown as Record<string, unknown>))
    if (latestAnalyzed) {
      const analysis = latestAnalyzed.nvc_analysis as ConflictAnalysis
      analysisSummary = `Temperature: ${analysis.emotionalTemperature}, Direction: ${analysis.meta.resolutionDirection}, Primary insight: ${analysis.meta.primaryInsight}`
    }
  }

  // 5. Build coaching system prompt
  const { system } = buildCoachingPrompt(
    personName,
    otherName,
    conversationHistory,
    analysisSummary,
  )

  // Build messages array from coaching history for multi-turn
  const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = (coachingHistory || []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // 6. Call Claude with coaching history
  let response: string
  try {
    // Use conductorMessage for single-turn with full coaching context
    const coachingContext = claudeMessages
      .map((m) => `[${m.role === 'user' ? personName : 'Ava'}]: ${m.content}`)
      .join('\n')

    response = await conductorMessage(
      system,
      `COACHING CONVERSATION:\n${coachingContext}\n\nRespond to ${personName}'s latest message as their private coach.`,
      512,
    )
  } catch {
    return NextResponse.json({ error: 'Coaching response failed' }, { status: 502 })
  }

  // 7. Insert assistant response
  await supabase.from('coaching_messages').insert({
    session_id,
    person,
    role: 'assistant',
    content: response,
  })

  // 8. Return response
  return NextResponse.json({ message: response })
}
