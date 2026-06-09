import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import type { StudentProfile } from '../../services/studentService'

type StudentProfileHeaderProps = {
  student: StudentProfile
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Student profile
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {student.name}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {student.email}
        </p>
      </div>

      <Link to="/app/students">
        <Button variant="secondary">Back to students</Button>
      </Link>
    </div>
  )
}