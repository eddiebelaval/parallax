import { NextResponse } from 'next/server'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=no_code`)
  }

  // Create a cookie-aware Supabase client to exchange the code for a session
  const cookieStore = await cookies()
  const supabaseAuth = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )

  const { data: { user }, error } = await supabaseAuth.auth.exchangeCodeForSession(code)

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
  }

  // Use service role client for DB operations (bypasses RLS)
  const supabase = createServerClient()

  // Check if user_profiles row exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('interview_completed')
    .eq('user_id', user.id)
    .single()

  if (!existingProfile) {
    // New user — create profile with Google display name
    const displayName = user.user_metadata?.full_name
      ?? user.user_metadata?.name
      ?? null

    await supabase.from('user_profiles').upsert({
      user_id: user.id,
      display_name: displayName,
    }, {
      onConflict: 'user_id',
    })

    return NextResponse.redirect(`${origin}/interview`)
  }

  // Existing user — route based on interview status
  return NextResponse.redirect(
    existingProfile.interview_completed ? `${origin}/home` : `${origin}/interview`,
  )
}
