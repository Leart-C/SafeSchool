import { Badge } from '../../components/ui/Badge'
import type { AttendanceRecord } from '../../services/attendanceService'

type AttendanceStatusBadgeProps = {
  status: AttendanceRecord['status']
}

const statusVariants = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'default',
} as const

const labels = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {labels[status]}
    </Badge>
  )
}
