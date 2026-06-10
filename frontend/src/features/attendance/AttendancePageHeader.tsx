import { CalendarCheck } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'

export function AttendancePageHeader() {
  return (
    <PageHeader
      action={
        <Badge variant="muted">
          <CalendarCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
          Daily workflow
        </Badge>
      }
      description="Review recent attendance records scoped to your school. Teachers and leaders can manage daily attendance from this workspace."
      eyebrow="Attendance"
      title="Attendance records"
    />
  )
}
