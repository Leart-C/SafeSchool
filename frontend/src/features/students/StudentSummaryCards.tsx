import {
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import type { StudentProfile } from '../../services/studentService'

type StudentSummaryCardsProps = {
  student: StudentProfile
}

export function StudentSummaryCards({ student }: StudentSummaryCardsProps) {
  const cards = [
    {
      label: 'First name',
      value: student.first_name ?? 'Not set',
      icon: UserRound,
    },
    {
      label: 'Last name',
      value: student.last_name ?? 'Not set',
      icon: UserRound,
    },
    {
      label: 'Linked records',
      value: `${student.guardians.length} guardians · ${student.classes.length} classes`,
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" aria-hidden={true} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
