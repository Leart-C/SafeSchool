import { UserButton } from '@clerk/clerk-react'
import type { ReactNode } from 'react'
import { Badge } from './ui/Badge'

type AppShellProps = {
  user: {
    name: string
    email: string
    roles: string[]
    school: {
      name: string
    } | null
  }
  children: ReactNode
}

const navigationItems = [
  'Dashboard',
  'Classes',
  'Students',
  'Attendance',
  'Messages',
]

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-white px-5 py-4 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            S
          </div>

          <div>
            <strong className="block text-sm font-semibold text-slate-950">
              SafeSchool
            </strong>
            <span className="block text-xs text-slate-500">
              {user.school?.name ?? 'No school assigned'}
            </span>
          </div>
        </div>

        <nav className="mt-8 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <a
              aria-current={item === 'Dashboard' ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                item === 'Dashboard'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Signed in as
            </p>
            <h1 className="truncate text-xl font-semibold text-slate-950">
              {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user.roles.map((role) => (
              <Badge key={role}>{role}</Badge>
            ))}
            <UserButton />
          </div>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  )
}