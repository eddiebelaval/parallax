import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
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

export async function POST(request: Request): Promise<NextResponse> {
  const rateLimited = checkRateLimit(request, 20, 60_000)
  if (rateLimited) return rateLimited

  const body = await request.json() as InterviewRequestBody
  const { user_id, phase, message, conversation_history, context_mode, display_name } = body

  if (!user_id || !phase || !message) {
    return NextResponse.json(
      { error: 'user_id, phase, and message are required' },
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

  let signalsExtracted = 0
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

      // Build profile update
      const profileUpdate: Record<string, unknown> = {
        raw_responses: [...rawResponses, extraction],
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
  }

  return NextResponse.json({
    response: cleanResponseForDisplay(rawText),
    phase_complete: phaseComplete,
    interview_complete: interviewDone,
    next_phase: phaseComplete && !interviewDone ? phase + 1 : null,
    signals_extracted: signalsExtracted,
  })
}
