import { useAuth } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { appToast } from '../../lib/toast'
import { getClasses, type SchoolClass } from '../../services/classService'
import { formatDisplayDate } from '../../lib/date'
import {
  getClassAttendanceRoster,
  storeClassAttendance,
  type AttendanceRoster,
  type AttendanceStatus,
} from '../../services/attendanceService'
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
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [attendanceDate, setAttendanceDate] = useState(today)
  const [roster, setRoster] = useState<AttendanceRoster | null>(null)
  const [records, setRecords] = useState<AttendanceDraftRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingRoster, setIsLoadingRoster] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const activeClasses = useMemo(
    () => classes.filter((schoolClass) => schoolClass.is_active),
    [classes],
  )

  useEffect(() => {
    async function loadClasses() {
      if (!isLoaded || !isSignedIn) {
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setError('No Clerk session token was returned.')
          return
        }

        const response = await getClasses(token)
        const availableClasses = response.data.classes.filter(
          (schoolClass) => schoolClass.is_active,
        )

        setClasses(response.data.classes)
        setSelectedClassId(availableClasses[0]?.id ?? null)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load classes')
      } finally {
        setIsLoadingClasses(false)
      }
    }

    void loadClasses()
  }, [getToken, isLoaded, isSignedIn])

  async function loadRoster() {
    if (!selectedClassId) {
      setRoster(null)
      setRecords([])
      return
    }

    setError(null)
    setIsLoadingRoster(true)

    try {
      const token = await getToken()

      if (!token) {
        setError('No Clerk session token was returned.')
        return
      }

      const response = await getClassAttendanceRoster(
        token,
        selectedClassId,
        attendanceDate,
      )

      setRoster(response.data.roster)
      setRecords(createDraftRecords(response.data.roster))
    } catch (error) {
      setRoster(null)
      setRecords([])
      setError(error instanceof Error ? error.message : 'Failed to load roster')
    } finally {
      setIsLoadingRoster(false)
    }
  }

  async function saveAttendance() {
    if (!selectedClassId || !roster) {
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const token = await getToken()

      if (!token) {
        setError('No Clerk session token was returned.')
        return
      }

      await storeClassAttendance(token, selectedClassId, {
        attendance_date: attendanceDate,
        records: records.map((record) => ({
          student_user_id: record.student_user_id,
          status: record.status,
          note: record.note.trim() || null,
        })),
      })

      appToast.success('Attendance saved', `${roster.class.name} was updated.`)

      await loadRoster()
      await onSaved()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save attendance'
      setError(message)
      appToast.error('Attendance was not saved', message)
    } finally {
      setIsSaving(false)
    }
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

  return (
    <section className="space-y-4">
      <Card className="border-slate-200 bg-white">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Daily attendance
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-950">
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

              <select
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                disabled={isLoadingClasses || activeClasses.length === 0}
                id="attendance-class"
                onChange={(event) => {
                  setSelectedClassId(Number(event.target.value))
                  setRoster(null)
                  setRecords([])
                }}
                value={selectedClassId ?? ''}
              >
                {activeClasses.length === 0 ? (
                  <option value="">No active classes</option>
                ) : null}

                {activeClasses.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="attendance-date">
                Date
              </label>

              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                id="attendance-date"
                onChange={(event) => {
                  setAttendanceDate(event.target.value)
                  setRoster(null)
                  setRecords([])
                }}
                type="date"
                value={attendanceDate}
              />
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={!selectedClassId || isLoadingRoster}
              onClick={loadRoster}
            >
              {isLoadingRoster ? 'Loading...' : 'Load roster'}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
      </Card>

      {roster ? (
        <div className="space-y-4">
          <Card className="bg-slate-950 text-white">
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
                  className="bg-white text-slate-950 hover:bg-slate-100"
                  onClick={() => markAll('present')}
                  variant="secondary"
                >
                  Mark all present
                </Button>

                <Button
                  className="bg-white text-slate-950 hover:bg-slate-100"
                  onClick={() => markAll('absent')}
                  variant="secondary"
                >
                  Mark all absent
                </Button>

                <Button
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                  disabled={isSaving}
                  onClick={saveAttendance}
                >
                  {isSaving ? 'Saving...' : 'Save attendance'}
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