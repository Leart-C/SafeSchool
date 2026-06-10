import { Card } from '../../components/ui/Card'
import type {
  AttendanceRosterStudent,
  AttendanceStatus,
} from '../../services/attendanceService'
import { AttendanceStatusSelect } from './AttendanceStatusSelect'

export type AttendanceDraftRecord = {
  student_user_id: number
  status: AttendanceStatus
  note: string
}

type AttendanceRosterTableProps = {
  records: AttendanceDraftRecord[]
  students: AttendanceRosterStudent[]
  onChangeRecord: (
    studentId: number,
    updates: Partial<Omit<AttendanceDraftRecord, 'student_user_id'>>,
  ) => void
}

export function AttendanceRosterTable({
  records,
  students,
  onChangeRecord,
}: AttendanceRosterTableProps) {
  const recordsByStudentId = new Map(
    records.map((record) => [record.student_user_id, record]),
  )

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-white px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-950">
          Student roster
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Update each student&apos;s status and add notes only when needed.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="w-40 px-5 py-3 font-semibold">Status</th>
              <th className="min-w-72 px-5 py-3 font-semibold">Note</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {students.map((student) => {
              const record = recordsByStudentId.get(student.id)

              return (
                <tr
                  className="transition hover:bg-slate-50"
                  key={student.id}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">
                        {student.first_name?.[0] ?? student.name[0] ?? 'S'}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">
                          {student.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {student.first_name} {student.last_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {student.email}
                  </td>

                  <td className="px-5 py-3.5">
                    <AttendanceStatusSelect
                      onChange={(status) => {
                        onChangeRecord(student.id, { status })
                      }}
                      value={record?.status ?? 'present'}
                    />
                  </td>

                  <td className="px-5 py-3.5">
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      onChange={(event) => {
                        onChangeRecord(student.id, {
                          note: event.target.value,
                        })
                      }}
                      placeholder="Optional note"
                      value={record?.note ?? ''}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}