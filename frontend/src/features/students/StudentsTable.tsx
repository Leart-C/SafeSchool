import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
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
              <th className="px-5 py-3 font-semibold">Email</th>
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
                        {student.first_name} {student.last_name}
                      </p>
                    </div>
                  </Link>
                </td>

                  <td className="px-5 py-4">
                    <a
                      className="text-slate-600 hover:text-slate-950"
                      href={`mailto:${student.email}`}
                    >
                      {student.email}
                    </a>
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
                    <Button
                      as={Link}
                      icon={<ArrowUpRight className="h-4 w-4" aria-hidden={true} />}
                      size="sm"
                      to={`/app/students/${student.id}`}
                      variant="secondary"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
