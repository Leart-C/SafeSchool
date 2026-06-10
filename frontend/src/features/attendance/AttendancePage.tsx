import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import {
  getAttendanceRecords,
  type AttendanceRecord,
} from '../../services/attendanceService'
import { AttendancePageHeader } from './AttendancePageHeader'
import { AttendanceTable } from './AttendanceTable'
import { AttendanceTakingPanel } from './AttendanceTakingPanel'

export function AttendancePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadAttendanceRecords = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    try {
      const token = await getToken()

      if (!token) {
        setError('No Clerk session token was returned.')
        return
      }

      setError(null)
      const response = await getAttendanceRecords(token)
      setRecords(response.data.attendance_records)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load attendance records')
    } finally {
      setIsLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn])

  useEffect(() => {
    void loadAttendanceRecords()
  }, [loadAttendanceRecords])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading attendance records...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <AttendancePageHeader />
        <AttendanceTakingPanel onSaved={loadAttendanceRecords} />

        <EmptyState
          title="Could not load attendance"
          description={error}
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <AttendancePageHeader />

      <AttendanceTakingPanel onSaved={loadAttendanceRecords} />

      {records.length === 0 ? (
        <EmptyState
          title="No attendance records yet"
          description="Attendance records will appear here after teachers begin taking attendance."
        />
      ) : (
        <AttendanceTable records={records} />
      )}
    </section>
  )
}