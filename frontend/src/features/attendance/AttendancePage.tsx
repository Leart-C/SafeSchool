import { useAuth } from '@clerk/clerk-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { canManageAttendance } from '../../lib/roles'
import { queryKeys } from '../../lib/queryKeys'
import { getAttendanceRecords } from '../../services/attendanceService'
import type { MeResponse } from '../../services/meService'
import { AttendancePageHeader } from './AttendancePageHeader'
import { AttendanceTable } from './AttendanceTable'
import { AttendanceTakingPanel } from './AttendanceTakingPanel'

type AuthenticatedOutletContext = {
  me: MeResponse
}

export function AttendancePage() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const canManage = canManageAttendance(me.data.roles)

  const attendanceQuery = useQuery({
    queryKey: queryKeys.attendanceRecords,
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
      queryKey: queryKeys.attendanceRecords,
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

        {canManage ? (
          <AttendanceTakingPanel onSaved={refreshAttendanceRecords} />
        ) : (
          <EmptyState
            title="Attendance management unavailable"
            description="Your role can view personal attendance information later, but cannot manage school attendance."
          />
        )}

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

      {canManage ? (
        <AttendanceTakingPanel onSaved={refreshAttendanceRecords} />
      ) : (
        <EmptyState
          title="Attendance management unavailable"
          description="Your role can view personal attendance information later, but cannot manage school attendance."
        />
      )}

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