import { useAuth } from '@clerk/clerk-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getStudent,
  type StudentProfile,
} from '../../services/studentService'
import { StudentClassesPanel } from './StudentClassesPanel'
import { StudentGuardiansPanel } from './StudentGuardiansPanel'
import { StudentProfileHeader } from './StudentProfileHeader'
import { StudentSummaryCards } from './StudentSummaryCards'

export function StudentProfilePage() {
  const { studentId } = useParams()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStudent() {
      if (!isLoaded || !isSignedIn || !studentId) {
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setError('No Clerk session token was returned.')
          return
        }

        setError(null)
        const response = await getStudent(token, studentId)
        setStudent(response.data.student)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load student')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStudent()
  }, [getToken, isLoaded, isSignedIn, studentId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading student profile...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load student"
        description={error}
        action={
          <Link to="/app/students">
            <Button variant="secondary">Back to students</Button>
          </Link>
        }
      />
    )
  }

  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description="This student could not be found in your school workspace."
        action={
          <Link to="/app/students">
            <Button variant="secondary">Back to students</Button>
          </Link>
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