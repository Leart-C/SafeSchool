import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck,
  CheckCheck,
  ClipboardList,
  Save,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { formatDisplayDate } from '../../lib/date'
import { queryKeys } from '../../lib/queryKeys'
import { appToast } from '../../lib/toast'
import {
  getClassAttendanceRoster,
  storeClassAttendance,
  type AttendanceRoster,
  type AttendanceStatus,
} from '../../services/attendanceService'
import { getClasses } from '../../services/classService'
import {
  AttendanceRosterTable,
  type AttendanceDraftRecord,
} from './AttendanceRosterTable'

type AttendanceTakingPanelProps = {
  onSaved: () => Promise<void> | void
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function createDraftRecords(roster: AttendanceRoster): AttendanceDraftRecord[] {
  return roster.students.map((student) => ({
    student_user_id: student.id,
    status: student.attendance?.status ?? 'present',
    note: student.attendance?.note ?? '',
  }))
}

export function AttendanceTakingPanel({ onSaved }: AttendanceTakingPanelProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [attendanceDate, setAttendanceDate] = useState(today)
  const [roster, setRoster] = useState<AttendanceRoster | null>(null)
  const [records, setRecords] = useState<AttendanceDraftRecord[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  const classesQuery = useQuery({
    queryKey: queryKeys.classes,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getClasses(token)
    },
  })

  const activeClasses = useMemo(
    () =>
      classesQuery.data?.data.classes.filter(
        (schoolClass) => schoolClass.is_active,
      ) ?? [],
    [classesQuery.data],
  )

  const effectiveSelectedClassId =
    selectedClassId ?? activeClasses[0]?.id ?? null

  const rosterQuery = useQuery({
    queryKey: queryKeys.attendanceRoster(effectiveSelectedClassId, attendanceDate),
    enabled: false,
    queryFn: async () => {
      if (!effectiveSelectedClassId) {
        throw new Error('Select a class before loading the roster.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getClassAttendanceRoster(
        token,
        effectiveSelectedClassId,
        attendanceDate,
      )
    },
  })

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveSelectedClassId || !roster) {
        throw new Error('Load a roster before saving attendance.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return storeClassAttendance(token, effectiveSelectedClassId, {
        attendance_date: attendanceDate,
        records: records.map((record) => ({
          student_user_id: record.student_user_id,
          status: record.status,
          note: record.note.trim() || null,
        })),
      })
    },
    onSuccess: async () => {
      if (!roster) {
        return
      }

      appToast.success('Attendance saved', `${roster.class.name} was updated.`)

      await queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceRecords,
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceRoster(
          effectiveSelectedClassId,
          attendanceDate,
        ),
      })

      await loadRoster()
      await onSaved()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to save attendance'

      setActionError(message)
      appToast.error('Attendance was not saved', message)
    },
  })

  async function loadRoster() {
    setActionError(null)

    const result = await rosterQuery.refetch()

    if (result.error) {
      const message = result.error instanceof Error
        ? result.error.message
        : 'Failed to load roster'

      setRoster(null)
      setRecords([])
      setActionError(message)

      return
    }

    if (!result.data) {
      return
    }

    setRoster(result.data.data.roster)
    setRecords(createDraftRecords(result.data.data.roster))
  }

  function updateRecord(
    studentId: number,
    updates: Partial<Omit<AttendanceDraftRecord, 'student_user_id'>>,
  ) {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.student_user_id === studentId
          ? { ...record, ...updates }
          : record,
      ),
    )
  }

  function markAll(status: AttendanceStatus) {
    setRecords((currentRecords) =>
      currentRecords.map((record) => ({
        ...record,
        status,
      })),
    )
  }

  const classesError = classesQuery.error instanceof Error
    ? classesQuery.error.message
    : 'Failed to load classes'

  return (
    <section className="space-y-4">
      <Card>
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-emerald-700" aria-hidden={true} />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Daily attendance
              </p>
            </div>

            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              Take attendance
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Choose the class and date, load the roster, then save today&apos;s
              attendance.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(180px,240px)_160px_auto] sm:items-end">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="attendance-class">
                Class
              </label>

              <Select
                className="mt-2"
                disabled={classesQuery.isLoading || activeClasses.length === 0}
                id="attendance-class"
                onChange={(event) => {
                  setSelectedClassId(Number(event.target.value))
                  setRoster(null)
                  setRecords([])
                  setActionError(null)
                }}
                value={effectiveSelectedClassId ?? ''}
              >
                {activeClasses.length === 0 ? (
                  <option value="">No active classes</option>
                ) : null}

                {activeClasses.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="attendance-date">
                Date
              </label>

              <Input
                className="mt-2"
                id="attendance-date"
                onChange={(event) => {
                  setAttendanceDate(event.target.value)
                  setRoster(null)
                  setRecords([])
                  setActionError(null)
                }}
                type="date"
                value={attendanceDate}
              />
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={!effectiveSelectedClassId || rosterQuery.isFetching}
              icon={<ClipboardList className="h-4 w-4" aria-hidden={true} />}
              onClick={() => void loadRoster()}
            >
              {rosterQuery.isFetching ? 'Loading...' : 'Load roster'}
            </Button>
          </div>
        </div>

        {classesQuery.isError ? (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {classesError}
          </div>
        ) : null}

        {actionError ? (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        ) : null}
      </Card>

      {roster ? (
        <div className="space-y-4">
          <Card className="border-slate-900 bg-slate-950 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Loaded roster
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {roster.class.name}
                </h3>

                <p className="mt-1 text-sm text-slate-300">
                  {roster.students.length} students · {formatDisplayDate(roster.attendance_date)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  icon={<CheckCheck className="h-4 w-4" aria-hidden={true} />}
                  onClick={() => markAll('present')}
                  variant="secondary"
                >
                  Mark all present
                </Button>

                <Button
                  icon={<XCircle className="h-4 w-4" aria-hidden={true} />}
                  onClick={() => markAll('absent')}
                  variant="secondary"
                >
                  Mark all absent
                </Button>

                <Button
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                  disabled={saveAttendanceMutation.isPending}
                  icon={<Save className="h-4 w-4" aria-hidden={true} />}
                  onClick={() => saveAttendanceMutation.mutate()}
                >
                  {saveAttendanceMutation.isPending ? 'Saving...' : 'Save attendance'}
                </Button>
              </div>
            </div>
          </Card>

          <AttendanceRosterTable
            onChangeRecord={updateRecord}
            records={records}
            students={roster.students}
          />
        </div>
      ) : null}
    </section>
  )
}
