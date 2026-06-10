import type { AttendanceStatus } from '../../services/attendanceService'
import { Select } from '../../components/ui/Select'
import { cn } from '../../lib/utils'

type AttendanceStatusSelectProps = {
  value: AttendanceStatus
  onChange: (status: AttendanceStatus) => void
}

const statusClasses: Record<AttendanceStatus, string> = {
  present: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  absent: 'border-red-200 bg-red-50 text-red-700',
  late: 'border-amber-200 bg-amber-50 text-amber-700',
  excused: 'border-blue-200 bg-blue-50 text-blue-700',
}

const statuses: Array<{
  value: AttendanceStatus
  label: string
}> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
]

export function AttendanceStatusSelect({
  value,
  onChange,
}: AttendanceStatusSelectProps) {
  return (
    <Select
      className={cn(
        'w-36 font-semibold',
        statusClasses[value],
      )}
      onChange={(event) => onChange(event.target.value as AttendanceStatus)}
      value={value}
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </Select>
  )
}
