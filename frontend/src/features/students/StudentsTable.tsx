import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDisplayDate } from '../../lib/date'
import type { Student } from '../../services/studentService'

type StudentsTableProps = {
  students: Student[]
}

export function StudentsTable({ students }: StudentsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-sm font-semibold text-slate-950">
            Student directory
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Open a profile to review class enrollment and guardian links.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Student code</th>
              <th className="px-5 py-3 font-semibold">Grade</th>
              <th className="px-5 py-3 font-semibold">Date of birth</th>
              <th className="px-5 py-3 font-semibold">Guardians</th>
              <th className="px-5 py-3 font-semibold">Classes</th>
              <th className="px-5 py-3 text-right font-semibold">Profile</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {students.map((student) => (
              <tr className="transition hover:bg-slate-50" key={student.id}>
                <td className="px-5 py-4">
                  <Link
                    className="flex items-center gap-3"
                    to={`/app/students/${student.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                      {student.first_name?.[0] ?? student.name[0] ?? 'S'}
                    </div>

                    <div>
                      <p className="font-medium text-slate-950">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.email}
                      </p>
                    </div>
                  </Link>
                </td>

                <td className="px-5 py-4">
                  {student.profile ? (
                    <Badge variant="default">
                      <BadgeCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
                      {student.profile.student_code}
                    </Badge>
                  ) : (
                    <Badge variant="muted">No code</Badge>
                  )}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {student.profile?.grade_level ?? 'Not set'}
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {student.profile?.date_of_birth
                      ? formatDisplayDate(student.profile.date_of_birth)
                      : 'Not set'}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {student.guardians_count}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {student.classes_count}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <Button
                      as={Link}
                      icon={<ArrowUpRight className="h-4 w-4" aria-hidden={true} />}
                      size="sm"
                      to={`/app/students/${student.id}`}
                      variant="secondary"
                    >
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}