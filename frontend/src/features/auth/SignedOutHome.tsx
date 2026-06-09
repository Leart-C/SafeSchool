import { SignInButton } from '@clerk/clerk-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function SignedOutHome() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            School safety operations
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-slate-950">
            SafeSchool
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A secure workspace for school teams to manage students, classes,
            families, attendance, incidents, and communication.
          </p>

          <div className="mt-8">
            <SignInButton mode="modal">
              <Button type="button">Sign in</Button>
            </SignInButton>
          </div>
        </section>

        <Card className="space-y-5">
          <div>
            <span className="text-sm font-medium text-slate-500">Roles</span>
            <strong className="mt-1 block text-slate-950">
              Admin · Teacher · Parent · Student
            </strong>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-500">Scope</span>
            <strong className="mt-1 block text-slate-950">
              School-aware data boundaries
            </strong>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-500">Access</span>
            <strong className="mt-1 block text-slate-950">
              Clerk-secured sessions
            </strong>
          </div>
        </Card>
      </div>
    </main>
  )
}