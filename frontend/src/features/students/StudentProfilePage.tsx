import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { getStudent } from '../../services/studentService'
import { StudentClassesPanel } from './StudentClassesPanel'
import { StudentGuardiansPanel } from './StudentGuardiansPanel'
import { StudentProfileHeader } from './StudentProfileHeader'
import { StudentSummaryCards } from './StudentSummaryCards'

export function StudentProfilePage() {
  const { studentId } = useParams()
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const studentQuery = useQuery({
    queryKey: queryKeys.student(studentId),
    enabled: isLoaded && isSignedIn && Boolean(studentId),
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student id is missing.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getStudent(token, studentId)
    },
  })

  if (studentQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading student profile...</p>
      </Card>
    )
  }

  if (studentQuery.isError) {
    return (
      <EmptyState
        title="Could not load student"
        description={
          studentQuery.error instanceof Error
            ? studentQuery.error.message
            : 'Failed to load student'
        }
        action={
          <Button as={Link} to="/app/students" variant="secondary">
            Back to students
          </Button>
        }
      />
    )
  }

  const student = studentQuery.data?.data.student

  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description="This student could not be found in your school workspace."
        action={
          <Button as={Link} to="/app/students" variant="secondary">
            Back to students
          </Button>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <StudentProfileHeader student={student} />

      <StudentSummaryCards student={student} />

      <div className="grid gap-6 xl:grid-cols-2">
        <StudentGuardiansPanel guardians={student.guardians} />
        <StudentClassesPanel classes={student.classes} />
      </div>
    </section>
  )
}
