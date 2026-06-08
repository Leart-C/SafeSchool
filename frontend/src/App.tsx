import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { getMe, type MeResponse } from './services/meService'
import './App.css'

function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMe() {
      if (!isLoaded || !isSignedIn) {
        return
      }

      try {
        const token = await getToken()
        if (!token) {
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
    <main>
      <header>
        <h1>SafeSchool</h1>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedOut>
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        {error && <p>{error}</p>}
        {me && !error ? (
          <section>
            <h2>{me.data.name}</h2>
            <p>{me.data.email}</p>
            <p>{me.data.roles.join(', ') || 'No role assigned'}</p>
            <p>{me.data.school?.name ?? 'No school assigned'}</p>
          </section>
        ) : !error ? (
          <p>Loading profile...</p>
        ) : null}
      </SignedIn>
    </main>
  )
}

export default App
