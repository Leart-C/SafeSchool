import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { getClasses, type SchoolClass } from '../../services/classService'

export function ClassesPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

        setError(null)
        const response = await getClasses(token)
        setClasses(response.data.classes)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load classes')
      } finally {
        setIsLoading(false)
      }
    }

    void loadClasses()
  }, [getToken, isLoaded, isSignedIn])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading classes...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load classes"
        description={error}
      />
    )
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        title="No classes yet"
        description="Classes created for your school will appear here."
      />
    )
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          School classes
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Classes
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review classes scoped to your school. Teacher and student assignments
          are counted from the class membership model.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Grade</th>
                <th className="px-5 py-3 font-semibold">Academic year</th>
                <th className="px-5 py-3 font-semibold">Teachers</th>
                <th className="px-5 py-3 font-semibold">Students</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {classes.map((schoolClass) => (
                <tr key={schoolClass.id}>
                  <td className="px-5 py-4 font-medium text-slate-950">
                    {schoolClass.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {schoolClass.grade_level}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {schoolClass.academic_year}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {schoolClass.teachers_count}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {schoolClass.students_count}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                        schoolClass.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {schoolClass.is_active ? 'Active' : 'Inactive'}
                    </span>
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