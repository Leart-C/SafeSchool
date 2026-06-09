import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { getStudents, type Student } from '../../services/studentService'
import { StudentsPageHeader } from './StudentsPageHeader'
import { StudentsTable } from './StudentsTable'

export function StudentsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStudents() {
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
        const response = await getStudents(token)
        setStudents(response.data.students)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load students')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStudents()
  }, [getToken, isLoaded, isSignedIn])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading students...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load students"
        description={error}
      />
    )
  }

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