import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { summarizeSession } from '@/lib/opus'
import type { ConversationEntry } from '@/lib/opus'
import type { Message, MessageSender } from '@/types/database'

export interface SessionSummary {
  temperatureArc: string
  keyMoments: string[]
  personANeeds: string
  personBNeeds: string
  personATakeaway: string
  personBTakeaway: string
  personAStrength: string
  personBStrength: string
  overallInsight: string
}

function parseSessionSummary(raw: string): SessionSummary | null {
  try {
    let cleaned = raw.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    if (!parsed.temperatureArc || !parsed.overallInsight) {
      return null
    }

    return {
      temperatureArc: String(parsed.temperatureArc),
      keyMoments: Array.isArray(parsed.keyMoments)
        ? parsed.keyMoments.map(String)
        : [],
      personANeeds: String(parsed.personANeeds || ''),
      personBNeeds: String(parsed.personBNeeds || ''),
      personATakeaway: String(parsed.personATakeaway || ''),
      personBTakeaway: String(parsed.personBTakeaway || ''),
      personAStrength: String(parsed.personAStrength || ''),
      personBStrength: String(parsed.personBStrength || ''),
      overallInsight: String(parsed.overallInsight),
    }
  } catch {
    return null
  }
}

/**
 * POST /api/sessions/[code]/summary
 *
 * Generates a session summary analyzing the full conversation arc.
 * Intended to be called when a session is completed.
 *
 * Response: { summary: SessionSummary }
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const supabase = createServerClient()

  // Fetch the session by room code
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_code', code.toUpperCase())
    .single()

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 },
    )
  }

  // Fetch all messages in the session
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  if (messagesError || !messages || messages.length === 0) {
    return NextResponse.json(
      { error: 'No messages found for this session' },
      { status: 400 },
    )
  }

  const nameMap: Record<MessageSender, string> = {
    person_a: session.person_a_name ?? 'Person A',
    person_b: session.person_b_name ?? 'Person B',
    mediator: 'Claude',
  }

  const conversationHistory: ConversationEntry[] = messages.map(
    (m: Message) => ({
      sender: nameMap[m.sender],
      content: m.content,
    }),
  )

  // Call Claude for session summary
  let rawText: string
  try {
    rawText = await summarizeSession(
      nameMap.person_a,
      nameMap.person_b,
      conversationHistory,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const summary = parseSessionSummary(rawText)

  if (!summary) {
    return NextResponse.json(
      { error: 'Failed to parse session summary from Claude response' },
      { status: 502 },
    )
  }

  return NextResponse.json({ summary })
}
