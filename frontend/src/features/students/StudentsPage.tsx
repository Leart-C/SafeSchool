import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { getStudents, type Student } from '../../services/studentService'

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
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          School students
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Students
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review students scoped to your school. Guardian and class counts come
          from SafeSchool relationships, not Clerk identity data.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Guardians</th>
                <th className="px-5 py-3 font-semibold">Classes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((student) => (
                <tr className="transition hover:bg-slate-50" key={student.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                        {student.first_name?.[0] ?? student.name[0] ?? 'S'}
                      </div>

                      <div>
                        <p className="font-medium text-slate-950">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.first_name} {student.last_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.email}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.guardians_count}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.classes_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}