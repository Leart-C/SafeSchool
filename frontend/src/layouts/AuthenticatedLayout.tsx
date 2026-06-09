import { useAuth } from '@clerk/clerk-react'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { getMe, type MeResponse } from '../services/meService'

export function AuthenticatedLayout() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMe() {
      if (!isLoaded || !isSignedIn) {
        setMe(null)
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setError('No Clerk session token was returned.')
          return
        }

        setError(null)
        setMe(await getMe(token))
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      }
    }

    void loadMe()
  }, [getToken, isLoaded, isSignedIn])

  if (!isLoaded) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading SafeSchool...</main>
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </main>
    )
  }

  if (!me) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading profile...</main>
  }

  return (
    <AppShell user={me.data}>
      <Outlet context={{ me }} />
    </AppShell>
  )
}