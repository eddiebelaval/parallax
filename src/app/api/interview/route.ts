import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { getInterviewPrompt } from '@/lib/interview-prompts'
import {
  parseInterviewExtraction,
  extractSignals,
  isPhaseComplete,
  isInterviewComplete,
  cleanResponseForDisplay,
} from '@/lib/signal-extractor'
import type { ContextMode, InterviewPhase } from '@/types/database'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

interface InterviewRequestBody {
  user_id: string
  phase: Exclude<InterviewPhase, 0>
  message: string
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>
  context_mode?: ContextMode
  display_name?: string | null
}

interface InProgressEntry {
  phase: 'in_progress'
  current_phase: number
  messages: Array<{ role: string; content: string }>
  updated_at: string
}

function isInProgressEntry(entry: unknown): entry is InProgressEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    (entry as Record<string, unknown>).phase === 'in_progress'
  )
}

function getCompletedResponses(responses: unknown[]): unknown[] {
  return responses.filter((entry) => !isInProgressEntry(entry))
}

async function getAuthUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null

  const client = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user } } = await client.auth.getUser(token)
  return user?.id ?? null
}

export async function GET(request: Request): Promise<NextResponse> {
  const user_id = await getAuthUserId(request)

  if (!user_id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('interview_phase, interview_completed, raw_responses, display_name')
    .eq('user_id', user_id)
    .single()

  if (!profile) {
    return NextResponse.json({ phase: 1, messages: [], completed: false })
  }

  if (profile.interview_completed) {
    return NextResponse.json({
      phase: 4,
      messages: [],
      completed: true,
      display_name: profile.display_name,
    })
  }

  const rawResponses = (profile.raw_responses as unknown[]) ?? []
  const inProgress = rawResponses.find(isInProgressEntry)

  return NextResponse.json({
    phase: inProgress?.current_phase ?? profile.interview_phase ?? 1,
    messages: inProgress?.messages ?? [],
    completed: false,
    display_name: profile.display_name,
  })
}

export async function POST(request: Request): Promise<NextResponse> {
  const rateLimited = checkRateLimit(request, 20, 60_000)
  if (rateLimited) return rateLimited

  const authUserId = await getAuthUserId(request)
  if (!authUserId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json() as InterviewRequestBody
  const { phase, message, conversation_history, context_mode, display_name } = body
  const user_id = authUserId

  if (!phase || !message) {
    return NextResponse.json(
      { error: 'phase and message are required' },
      { status: 400 },
    )
  }

  if (phase < 1 || phase > 4) {
    return NextResponse.json(
      { error: 'phase must be 1-4' },
      { status: 400 },
    )
  }

  const supabase = createServerClient()

  // Ensure profile exists (upsert for anonymous/first-time users)
  await supabase
    .from('user_profiles')
    .upsert(
      { user_id, display_name: display_name ?? null },
      { onConflict: 'user_id' },
    )

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('raw_responses')
    .eq('user_id', user_id)
    .single()

  const rawResponses = (profile?.raw_responses as unknown[]) ?? []
  const previousContext = rawResponses.map((r) => JSON.stringify(r)).join('\n')

  const systemPrompt = getInterviewPrompt(phase, previousContext, context_mode, display_name)

  const messages: Anthropic.MessageParam[] = [
    ...(conversation_history ?? []).map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user' as const, content: message },
  ]

  let rawText: string
  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    rawText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  const phaseComplete = isPhaseComplete(rawText)
  const interviewDone = isInterviewComplete(rawText)

  // Build the full message history including the new exchange
  const updatedHistory = [
    ...(conversation_history ?? []),
    { role: 'user' as const, content: message },
    { role: 'assistant' as const, content: cleanResponseForDisplay(rawText) },
  ]

  let signalsExtracted = 0

  const completedResponses = getCompletedResponses(rawResponses)

  if (phaseComplete || interviewDone) {
    const extraction = parseInterviewExtraction(rawText)
    if (extraction) {
      const signals = extractSignals(extraction)

      for (const signal of signals) {
        await supabase
          .from('behavioral_signals')
          .upsert({
            user_id,
            signal_type: signal.signal_type,
            signal_value: signal.signal_value as Record<string, unknown>,
            confidence: signal.confidence,
            source: 'interview',
          }, {
            onConflict: 'user_id,signal_type',
          })
      }
      signalsExtracted = signals.length

      // Build profile update — phase complete, replace in_progress with extraction
      const profileUpdate: Record<string, unknown> = {
        raw_responses: [...completedResponses, extraction],
        interview_phase: interviewDone ? 4 : phase,
        interview_completed: interviewDone,
        interview_completed_at: interviewDone ? new Date().toISOString() : undefined,
      }

      // Save display_name from Phase 1 extraction (conversational name gathering)
      if (phase === 1 && extraction.extracted?.display_name) {
        profileUpdate.display_name = extraction.extracted.display_name
      }

      await supabase
        .from('user_profiles')
        .update(profileUpdate)
        .eq('user_id', user_id)
    }
  } else {
    // Save in-progress conversation after EVERY exchange so users can resume
    const inProgress = {
      phase: 'in_progress' as const,
      current_phase: phase,
      messages: updatedHistory,
      updated_at: new Date().toISOString(),
    }

    await supabase
      .from('user_profiles')
      .update({
        raw_responses: [...completedResponses, inProgress],
        interview_phase: phase,
      })
      .eq('user_id', user_id)
  }

  return NextResponse.json({
    response: cleanResponseForDisplay(rawText),
    phase_complete: phaseComplete,
    interview_complete: interviewDone,
    next_phase: phaseComplete && !interviewDone ? phase + 1 : null,
    signals_extracted: signalsExtracted,
  })
}
