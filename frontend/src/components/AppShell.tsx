import { UserButton } from '@clerk/clerk-react'
import type { ComponentType, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  School,
  Users,
} from 'lucide-react'
import { cn } from '../lib/utils'
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

type NavigationItem = {
  label: string
  to: string
  icon: ComponentType<{
    className?: string
    'aria-hidden'?: boolean
  }>
  allowedRoles?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    to: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Classes',
    to: '/app/classes',
    icon: BookOpen,
  },
  {
    label: 'Students',
    to: '/app/students',
    icon: GraduationCap,
  },
  {
    label: 'Attendance',
    to: '/app/attendance',
    icon: CalendarCheck,
  },
  {
    label: 'Messages',
    to: '/app/messages',
    icon: MessageSquareText,
  },
  {
    label: 'Users',
    to: '/app/users',
    icon: Users,
    allowedRoles: ['admin', 'director'],
  },
]

export function AppShell({ user, children }: AppShellProps) {
  const primaryRole = user.roles[0] ?? 'No role'

  const visibleNavigationItems = navigationItems.filter((item) => {
    if (!item.allowedRoles) {
      return true
    }

    return user.roles.some((role) => item.allowedRoles?.includes(role))
  })

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
                <School className="h-5 w-5" aria-hidden={true} />
              </div>

              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-slate-950">
                  SafeSchool
                </strong>
                <span className="block truncate text-xs text-slate-500">
                  {user.school?.name ?? 'No school assigned'}
                </span>
              </div>
            </div>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex gap-1 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible"
          >
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )
                  }
                  key={item.to}
                  to={item.to}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden={true} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto hidden border-t border-slate-100 px-5 py-5 lg:block">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Users className="h-3.5 w-3.5" aria-hidden={true} />
                Workspace
              </div>

              <p className="mt-2 text-sm font-medium text-slate-950">
                {primaryRole}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Access is scoped by school role and backend permissions.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Signed in as
              </p>

              <h1 className="truncate text-xl font-semibold text-slate-950">
                {user.name}
              </h1>

              <p className="mt-0.5 truncate text-sm text-slate-500">
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="hidden h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
                type="button"
              >
                <Bell className="h-4 w-4" aria-hidden={true} />
              </button>

              <div className="hidden items-center gap-2 md:flex">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role} variant="default">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="muted">No role</Badge>
                )}
              </div>

              <UserButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}