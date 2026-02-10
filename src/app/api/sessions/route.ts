import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/sessions — create a new session
export async function POST(request: Request) {
  const supabase = createServerClient()
  const body = await request.json()
  const { person_a_name } = body

  const { data, error } = await supabase
    .from('sessions')
    .insert({ person_a_name: person_a_name || null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
