import { useAuth } from '@clerk/clerk-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { getAttendanceRecords } from '../../services/attendanceService'
import { AttendancePageHeader } from './AttendancePageHeader'
import { AttendanceTable } from './AttendanceTable'
import { AttendanceTakingPanel } from './AttendanceTakingPanel'

export function AttendancePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const attendanceQuery = useQuery({
    queryKey: ['attendance-records'],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getAttendanceRecords(token)
    },
  })

  async function refreshAttendanceRecords() {
    await queryClient.invalidateQueries({
      queryKey: ['attendance-records'],
    })
  }

  if (attendanceQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading attendance records...</p>
      </Card>
    )
  }

  if (attendanceQuery.isError) {
    return (
      <section className="space-y-6">
        <AttendancePageHeader />
        <AttendanceTakingPanel onSaved={refreshAttendanceRecords} />

        <EmptyState
          title="Could not load attendance"
          description={
            attendanceQuery.error instanceof Error
              ? attendanceQuery.error.message
              : 'Failed to load attendance records'
          }
        />
      </section>
    )
  }

  const records = attendanceQuery.data?.data.attendance_records ?? []

  return (
    <section className="space-y-6">
      <AttendancePageHeader />

      <AttendanceTakingPanel onSaved={refreshAttendanceRecords} />

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