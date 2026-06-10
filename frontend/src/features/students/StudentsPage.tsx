import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { getStudents } from '../../services/studentService'
import { StudentsPageHeader } from './StudentsPageHeader'
import { StudentsTable } from './StudentsTable'
import { queryKeys } from '../../lib/queryKeys'



export function StudentsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const studentsQuery = useQuery({
    queryKey: queryKeys.students,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getStudents(token)
    },
  })

  if (studentsQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading students...</p>
      </Card>
    )
  }

  if (studentsQuery.isError) {
    return (
      <EmptyState
        title="Could not load students"
        description={
          studentsQuery.error instanceof Error
            ? studentsQuery.error.message
            : 'Failed to load students'
        }
      />
    )
  }

  const students = studentsQuery.data?.data.students ?? []

  if (students.length === 0) {
    return (
      <EmptyState
        title="No students yet"
        description="Student accounts linked to your school will appear here."
      />
    )
  }

  return (
    <section className="space-y-6">
      <StudentsPageHeader />
      <StudentsTable students={students} />
    </section>
  )
}