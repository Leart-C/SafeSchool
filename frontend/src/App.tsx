import {
  SignedIn,
  SignedOut,
  useAuth,
} from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { SignedOutHome } from './features/auth/SignedOutHome'
import { DashboardHome } from './features/dashboard/DashboardHome'
import { getMe, type MeResponse } from './services/meService'

function App() {
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

  return (
    <>
      <SignedOut>
        <SignedOutHome />
      </SignedOut>

      <SignedIn>
        {!isLoaded ? (
          <main className="loading-screen">Loading SafeSchool...</main>
        ) : error ? (
          <main className="loading-screen">
            <p className="app-error">{error}</p>
          </main>
        ) : me ? (
          <AppShell user={me.data}>
            <DashboardHome user={me.data} />
          </AppShell>
        ) : (
          <main className="loading-screen">Loading profile...</main>
        )}
      </SignedIn>
    </>
  )
}

export default App