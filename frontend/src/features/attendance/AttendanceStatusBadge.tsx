import type { AttendanceRecord } from '../../services/attendanceService'

type AttendanceStatusBadgeProps = {
  status: AttendanceRecord['status']
}

const statusClasses = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  late: 'bg-amber-50 text-amber-700',
  excused: 'bg-sky-50 text-sky-700',
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  )
}