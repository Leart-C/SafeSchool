import { Card } from '../../components/ui/Card'
import type { AttendanceRecord } from '../../services/attendanceService'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { formatDisplayDate } from '../../lib/date'

type AttendanceTableProps = {
  records: AttendanceRecord[]
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Recorded by</th>
              <th className="px-5 py-3 font-semibold">Note</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr className="transition hover:bg-slate-50" key={record.id}>
                <td className="px-5 py-4 text-slate-600">
                  {formatDisplayDate(record.attendance_date)}
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">
                    {record.student.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {record.student.email}
                  </p>
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {record.class.name}
                </td>

                <td className="px-5 py-4">
                  <AttendanceStatusBadge status={record.status} />
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {record.recorded_by?.name ?? 'Not recorded'}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {record.note ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}