import {
  GraduationCap,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import type { ManagedUser } from '../../services/userService'
import {
  UserRoleSelect,
  type UserRoleOption,
} from './UserRoleSelect'

type UsersTableProps = {
  currentUserId: number
  isUpdatingUserId: number | null
  users: ManagedUser[]
  onRoleChange: (user: ManagedUser, role: UserRoleOption) => void
}

function roleVariant(role: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (role === 'admin' || role === 'director') {
    return 'success'
  }

  if (role === 'teacher') {
    return 'default'
  }

  if (role === 'parent') {
    return 'warning'
  }

  if (role === 'student') {
    return 'muted'
  }

  return 'default'
}

function primaryRole(user: ManagedUser): UserRoleOption {
  const role = user.roles[0]

  if (
    role === 'admin' ||
    role === 'director' ||
    role === 'teacher' ||
    role === 'parent' ||
    role === 'student'
  ) {
    return role
  }

  return 'student'
}

export function UsersTable({
  currentUserId,
  isUpdatingUserId,
  users,
  onRoleChange,
}: UsersTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-sm font-semibold text-slate-950">
            School users
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Users synced from Clerk and scoped to this SafeSchool workspace.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Current roles</th>
              <th className="px-5 py-3 font-semibold">Manage role</th>
              <th className="px-5 py-3 font-semibold">Teaching</th>
              <th className="px-5 py-3 font-semibold">Enrolled</th>
              <th className="px-5 py-3 font-semibold">Family links</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => {
              const isSelf = user.id === currentUserId
              const isUpdating = isUpdatingUserId === user.id

              return (
                <tr className="transition hover:bg-slate-50" key={user.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                        {user.first_name?.[0] ?? user.name[0] ?? 'U'}
                      </div>

                      <div>
                        <p className="font-medium text-slate-950">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {user.clerk_user_id ? 'Synced with Clerk' : 'No Clerk id'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <a
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-950"
                      href={`mailto:${user.email}`}
                    >
                      <Mail className="h-4 w-4 text-slate-400" aria-hidden={true} />
                      {user.email}
                    </a>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role} variant={roleVariant(role)}>
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="muted">No role</Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="w-40">
                      <UserRoleSelect
                        disabled={isSelf || isUpdating}
                        onChange={(role) => onRoleChange(user, role)}
                        value={primaryRole(user)}
                      />
                    </div>

                    {isSelf ? (
                      <p className="mt-1 text-xs text-slate-500">
                        You cannot change your own role here.
                      </p>
                    ) : null}
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden={true} />
                      {user.teaching_classes_count}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 text-slate-600">
                      <GraduationCap className="h-4 w-4 text-slate-400" aria-hidden={true} />
                      {user.enrolled_classes_count}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 text-slate-600">
                      <UserRound className="h-4 w-4 text-slate-400" aria-hidden={true} />
                      {user.guardians_count} guardians · {user.students_count} students
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}