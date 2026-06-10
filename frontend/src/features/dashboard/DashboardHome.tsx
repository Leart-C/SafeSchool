import { Link, useOutletContext } from 'react-router-dom'
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  MessageSquareText,
  Settings,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { DashboardCard } from '../../components/DashboardCard'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { MeResponse } from '../../services/meService'

type AuthenticatedOutletContext = {
  me: MeResponse
}

type DashboardItem = {
  title: string
  value: string
  description: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  to?: string
}

function primaryRole(roles: string[]): string {
  return roles[0] ?? 'unassigned'
}

const dashboardItemsByRole: Record<string, DashboardItem[]> = {
  admin: [
    {
      title: 'School setup',
      value: 'Ready',
      description: 'Roles, school scope, and core identity are configured.',
      tone: 'success',
      icon: ShieldCheck,
      to: '/app/classes',
    },
    {
      title: 'User sync',
      value: 'Clerk',
      description: 'Authenticated users are matched to SafeSchool profiles.',
      icon: UserRoundCheck,
      to: '/app/students',
    },
    {
      title: 'Next focus',
      value: 'Operations',
      description: 'Keep classes, students, attendance, and messages aligned.',
      tone: 'warning',
      icon: Settings,
      to: '/app/attendance',
    },
  ],
  director: [
    {
      title: 'Attendance',
      value: 'Live',
      description: 'Review school-wide attendance and follow up with staff.',
      tone: 'success',
      icon: CalendarCheck,
      to: '/app/attendance',
    },
    {
      title: 'Messages',
      value: 'Ready',
      description: 'Publish school-wide announcements for staff and families.',
      icon: MessageSquareText,
      to: '/app/messages',
    },
    {
      title: 'Reports',
      value: 'Soon',
      description: 'Leadership reports will summarize attendance and class trends.',
      tone: 'warning',
      icon: ShieldCheck,
    },
  ],
  teacher: [
    {
      title: 'Classes',
      value: 'Active',
      description: 'Review assigned classes and student membership.',
      icon: BookOpen,
      to: '/app/classes',
    },
    {
      title: 'Attendance',
      value: 'Ready',
      description: 'Take and update daily attendance for your classes.',
      tone: 'success',
      icon: CalendarCheck,
      to: '/app/attendance',
    },
    {
      title: 'Students',
      value: 'Available',
      description: 'Open student profiles and guardian context.',
      icon: GraduationCap,
      to: '/app/students',
    },
  ],
  parent: [
    {
      title: 'Students',
      value: 'Linked',
      description: 'Linked student profiles will appear here.',
      icon: GraduationCap,
      to: '/app/students',
    },
    {
      title: 'Messages',
      value: 'Available',
      description: 'School communication will be available here.',
      icon: MessageSquareText,
      to: '/app/messages',
    },
    {
      title: 'Attendance',
      value: 'Summary',
      description: 'Attendance summaries will appear here.',
      icon: CalendarCheck,
      to: '/app/attendance',
    },
  ],
  student: [
    {
      title: 'Classes',
      value: 'Enrolled',
      description: 'Your class schedule will appear here.',
      icon: BookOpen,
      to: '/app/classes',
    },
    {
      title: 'Attendance',
      value: 'History',
      description: 'Your attendance history will appear here.',
      icon: CalendarCheck,
      to: '/app/attendance',
    },
    {
      title: 'Messages',
      value: 'Updates',
      description: 'School updates will be available here.',
      icon: MessageSquareText,
      to: '/app/messages',
    },
  ],
}

export function DashboardHome() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const user = me.data
  const role = primaryRole(user.roles)
  const dashboardItems = dashboardItemsByRole[role] ?? []

  if (!user.school) {
    return (
      <EmptyState
        title="No school assigned"
        description="This account is authenticated, but it is not connected to a SafeSchool workspace yet."
      />
    )
  }

  if (role === 'unassigned') {
    return (
      <EmptyState
        title="No role assigned"
        description="This user is synced, but does not have an application role yet."
      />
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={user.school.name}
        title="Dashboard"
        description={`Welcome back, ${user.name}. Your workspace is scoped to your school, role, and permissions.`}
      />

      <Card className="border-slate-200 bg-slate-950 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Today in SafeSchool
            </p>

            <h3 className="mt-2 text-2xl font-semibold">
              Keep the school day moving.
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Start from the highest priority workflow for your role, then use
              the sidebar to move through daily operations.
            </p>
          </div>

          <Button
            as={Link}
            to="/app/attendance"
            variant="secondary"
          >
            Open attendance
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardItems.map((item) => {
          const Icon = item.icon

          return (
            <DashboardCard
              action={
                item.to ? (
                  <Link
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    to={item.to}
                  >
                    Open
                  </Link>
                ) : null
              }
              description={item.description}
              icon={<Icon className="h-4 w-4" aria-hidden={true} />}
              key={item.title}
              title={item.title}
              tone={item.tone}
              value={item.value}
            />
          )
        })}
      </div>
    </section>
  )
}
