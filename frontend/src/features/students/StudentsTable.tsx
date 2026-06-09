import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import type { Student } from '../../services/studentService'

type StudentsTableProps = {
  students: Student[]
}

export function StudentsTable({ students }: StudentsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Guardians</th>
              <th className="px-5 py-3 font-semibold">Classes</th>
              <th className="px-5 py-3 font-semibold">Profile</th>
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
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

                <td className="px-5 py-4 text-slate-600">
                  {student.email}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {student.guardians_count}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {student.classes_count}
                </td>

                <td className="px-5 py-4">
                  <Link
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    to={`/app/students/${student.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}