import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_RETRIES = 3

const VALID_CONTEXT_MODES = [
  'intimate', 'family', 'professional_peer',
  'professional_hierarchical', 'transactional', 'civil_structural',
]

// POST /api/sessions — create a new session
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, 10, 60_000)
  if (rateLimited) return rateLimited

  const supabase = createServerClient()
  const body = await request.json()
  const { person_a_name, mode, context_mode, user_id } = body

  const insertData: Record<string, unknown> = {
    person_a_name: person_a_name || null,
  }

  if (user_id) {
    insertData.person_a_user_id = user_id
  }

  // In-person mode: skip form onboarding, conductor drives everything
  if (mode === 'in_person') {
    insertData.mode = 'in_person'
    insertData.status = 'active'
    insertData.onboarding_step = 'complete'
    insertData.onboarding_context = {
      conductorPhase: 'onboarding',
    }
  }

  // Solo mode: 1:1 with Parallax — auth optional (enables profile building)
  if (mode === 'solo') {
    insertData.mode = 'solo'
    insertData.status = 'active'
    insertData.onboarding_step = 'complete'
  }

  // V3: Context mode — validated, defaults to 'intimate'
  if (context_mode && VALID_CONTEXT_MODES.includes(context_mode)) {
    insertData.context_mode = context_mode
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(insertData)
      .select()
      .single()

    if (!error) {
      return NextResponse.json(data)
    }

    // Postgres unique violation (room_code collision) — retry with new code
    if (error.code === '23505') continue

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { error: 'Failed to generate unique room code after retries' },
    { status: 500 },
  )
}
