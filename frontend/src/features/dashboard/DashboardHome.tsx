import { useOutletContext } from 'react-router-dom'
import { DashboardCard } from '../../components/DashboardCard'
import { EmptyState } from '../../components/EmptyState'
import type { MeResponse } from '../../services/meService'

type AuthenticatedOutletContext = {
  me: MeResponse
}

function primaryRole(roles: string[]): string {
  return roles[0] ?? 'unassigned'
}

export function DashboardHome() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const user = me.data
  const role = primaryRole(user.roles)

  if (!user.school) {
    return (
      <EmptyState
        title="No school assigned"
        description="This account is authenticated, but it is not connected to a SafeSchool workspace yet."
      />
    )
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          {user.school.name}
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Dashboard
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Welcome back, {user.name}. Your workspace is scoped to your school,
          role, and permissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {role === 'admin' ? (
          <>
            <DashboardCard
              title="School setup"
              value="Ready"
              description="Roles, school scope, and core identity are configured."
              tone="success"
            />
            <DashboardCard
              title="User sync"
              value="Clerk"
              description="Authenticated users are matched to SafeSchool profiles."
            />
            <DashboardCard
              title="Next focus"
              value="Classes"
              description="Build class, student, and staff management screens."
              tone="warning"
            />
          </>
        ) : null}

        {role === 'teacher' ? (
          <>
            <DashboardCard
              title="Classes"
              value="Soon"
              description="Your assigned classes will appear here."
            />
            <DashboardCard
              title="Attendance"
              value="Soon"
              description="Daily class attendance workflows will be managed here."
            />
            <DashboardCard
              title="Students"
              value="Soon"
              description="Student context and guardian links will appear here."
            />
          </>
        ) : null}

        {role === 'parent' ? (
          <>
            <DashboardCard
              title="Students"
              value="Soon"
              description="Linked student profiles will appear here."
            />
            <DashboardCard
              title="Messages"
              value="Soon"
              description="School communication will be available here."
            />
            <DashboardCard
              title="Attendance"
              value="Soon"
              description="Attendance summaries will appear here."
            />
          </>
        ) : null}

        {role === 'student' ? (
          <>
            <DashboardCard
              title="Classes"
              value="Soon"
              description="Your class schedule will appear here."
            />
            <DashboardCard
              title="Attendance"
              value="Soon"
              description="Your attendance history will appear here."
            />
            <DashboardCard
              title="Messages"
              value="Soon"
              description="School updates will be available here."
            />
          </>
        ) : null}

        {role === 'unassigned' ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              title="No role assigned"
              description="This user is synced, but does not have an application role yet."
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}