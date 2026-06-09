import { Card } from '../../components/ui/Card'
import type { StudentProfile } from '../../services/studentService'

type StudentSummaryCardsProps = {
  student: StudentProfile
}

export function StudentSummaryCards({ student }: StudentSummaryCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <p className="text-sm font-medium text-slate-500">First name</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          {student.first_name ?? 'Not set'}
        </p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-slate-500">Last name</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          {student.last_name ?? 'Not set'}
        </p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-slate-500">Linked records</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          {student.guardians.length} guardians · {student.classes.length} classes
        </p>
      </Card>
    </div>
  )
}