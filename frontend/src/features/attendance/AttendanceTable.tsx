import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  UserRound,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { formatDisplayDate } from '../../lib/date'
import type { AttendanceRecord } from '../../services/attendanceService'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

type AttendanceTableProps = {
  records: AttendanceRecord[]
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-sm font-semibold text-slate-950">
            Recent records
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Latest attendance entries recorded for this school.
        </p>
      </div>

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
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {formatDisplayDate(record.attendance_date)}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                      {record.student.first_name?.[0] ?? record.student.name[0] ?? 'S'}
                    </div>

                    <div>
                      <p className="font-medium text-slate-950">
                        {record.student.name}
                      </p>
                      <a
                        className="text-xs text-slate-500 hover:text-slate-950"
                        href={`mailto:${record.student.email}`}
                      >
                        {record.student.email}
                      </a>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <BookOpen className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {record.class.name}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <AttendanceStatusBadge status={record.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <UserRound className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {record.recorded_by?.name ?? 'Not recorded'}
                  </div>
                </td>

                <td className="max-w-xs px-5 py-4 text-slate-600">
                  <span className="line-clamp-2">
                    {record.note ?? '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
