import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { getMe } from '../services/meService'

export function AuthenticatedLayout() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const meQuery = useQuery({
    queryKey: ['me'],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getMe(token)
    },
  })

  if (!isLoaded) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading SafeSchool...</main>
  }

  if (meQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-sm font-medium text-red-700">
          {meQuery.error instanceof Error ? meQuery.error.message : 'Failed to load profile'}
        </p>
      </main>
    )
  }

  if (meQuery.isLoading || !meQuery.data) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading profile...</main>
  }

  return (
    <AppShell user={meQuery.data.data}>
      <Outlet context={{ me: meQuery.data }} />
    </AppShell>
  )
}