import { getServerUser } from '@/lib/auth/server-auth'
import { getUserData } from '@/lib/data/user-profile'
import { HomeContent } from '@/components/home/HomeContent'

export default async function HomePage() {
  const user = await getServerUser().catch(() => null)

  const userData = user
    ? await getUserData(user.id).catch(() => ({ profile: null, signals: [], sessions: [] }))
    : { profile: null, signals: [], sessions: [] }
  const { profile, signals, sessions } = userData

  const displayName = profile?.display_name ?? user?.email ?? 'there'

  return (
    <HomeContent
      displayName={displayName}
      userId={user?.id ?? ''}
      profile={profile}
      signals={signals}
      sessions={sessions}
    />
  )
}
