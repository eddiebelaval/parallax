import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { OnboardingStep } from '@/types/database'

// Valid onboarding transitions
const TRANSITIONS: Record<OnboardingStep, OnboardingStep | null> = {
  introductions: 'set_stage',
  set_stage: 'set_goals',
  set_goals: 'complete',
  complete: null,
}

// PATCH /api/sessions/[code]/onboarding — advance onboarding state
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createServerClient()
  const body = await request.json()

  // Fetch current session
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .ilike('room_code', code)
    .single()

  if (fetchError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.mode !== 'in_person') {
    return NextResponse.json({ error: 'Not an in-person session' }, { status: 400 })
  }

  const currentStep = session.onboarding_step as OnboardingStep | null
  if (!currentStep || currentStep === 'complete') {
    return NextResponse.json({ error: 'Onboarding already complete' }, { status: 400 })
  }

  // Validate the requested transition
  const nextStep = TRANSITIONS[currentStep]
  if (!nextStep) {
    return NextResponse.json({ error: 'Invalid transition' }, { status: 400 })
  }

  // Build the update payload
  const update: Record<string, unknown> = {
    onboarding_step: nextStep,
  }

  // Merge onboarding context data from the request
  if (body.person_a_name) update.person_a_name = body.person_a_name
  if (body.person_b_name) update.person_b_name = body.person_b_name
  if (body.onboarding_context) {
    const existingContext = (session.onboarding_context as Record<string, unknown>) ?? {}
    update.onboarding_context = { ...existingContext, ...body.onboarding_context }
  }

  // When completing onboarding, activate the session
  if (nextStep === 'complete') {
    update.status = 'active'
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(update)
    .eq('id', session.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
