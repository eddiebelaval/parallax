import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const MAX_RETRIES = 3

// POST /api/sessions — create a new session
export async function POST(request: Request) {
  const supabase = createServerClient()
  const body = await request.json()
  const { person_a_name } = body

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ person_a_name: person_a_name || null })
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
