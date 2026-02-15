'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      router.replace('/auth?error=no_code')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth?error=oauth_failed')
        return
      }

      // Ensure profile exists (upsert is idempotent for existing users)
      const displayName = data.user.user_metadata?.full_name
        ?? data.user.user_metadata?.name
        ?? null

      const { error: profileError } = await supabase.from('user_profiles').upsert({
        user_id: data.user.id,
        display_name: displayName,
      }, {
        onConflict: 'user_id',
      })

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        router.replace('/auth?error=profile_creation_failed')
        return
      }

      router.replace('/home')
    })
  }, [searchParams, router])

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
      <div className="text-muted font-mono text-sm">Completing sign-in...</div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
          <div className="text-muted font-mono text-sm">Loading...</div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
