import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const MAX_RETRIES = 3

const VALID_CONTEXT_MODES = [
  'intimate', 'family', 'professional_peer',
  'professional_hierarchical', 'transactional', 'civil_structural',
]

// POST /api/sessions — create a new session
export async function POST(request: Request) {
  const supabase = createServerClient()
  const body = await request.json()
  const { person_a_name, mode, context_mode } = body

  const insertData: Record<string, unknown> = {
    person_a_name: person_a_name || null,
  }

  // In-person mode starts with onboarding; remote mode is the default
  if (mode === 'in_person') {
    insertData.mode = 'in_person'
    insertData.onboarding_step = 'introductions'
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
