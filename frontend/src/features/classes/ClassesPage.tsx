import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createClass,
  getClasses,
  type CreateClassPayload,
  type SchoolClass,
} from '../../services/classService'
import { appToast } from '../../lib/toast'

const initialForm: CreateClassPayload = {
  name: '',
  grade_level: '',
  section: '',
  academic_year: '2026-2027',
  is_active: true,
}

export function ClassesPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [form, setForm] = useState<CreateClassPayload>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

const handleCreateClass: FormEventHandler<HTMLFormElement> = (event) => {
  event.preventDefault()
  void submitCreateClass()
}

async function submitCreateClass() {
  setFormError(null)
  setIsSubmitting(true)

  try {
    const token = await getToken()

    if (!token) {
      setFormError('No Clerk session token was returned.')
      return
    }

    const response = await createClass(token, {
      ...form,
      section: form.section?.trim() || undefined,
    })

    setClasses((currentClasses) => [...currentClasses, response.data.class])
    appToast.success(
      'Class created',
      `${response.data.class.name} was added successfully.`,
    )
    setForm(initialForm)
    setIsCreateOpen(false)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create class'

    setFormError(message)
    appToast.error('Could not create class', message)
  } finally {
    setIsSubmitting(false)
  }
}

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            School classes
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Classes
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review and create classes scoped to your school. Teacher and student
            assignments are counted from the class membership model.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen((isOpen) => !isOpen)}>
          {isCreateOpen ? 'Close form' : 'Create class'}
        </Button>
      </div>

      {isCreateOpen ? (
        <Card>
          <form className="grid gap-4 lg:grid-cols-6" onSubmit={handleCreateClass}>
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="class-name">
                Class name
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                id="class-name"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Grade 8A"
                required
                value={form.name}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="grade-level">
                Grade
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                id="grade-level"
                onChange={(event) => setForm({ ...form, grade_level: event.target.value })}
                placeholder="8"
                required
                value={form.grade_level}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="section">
                Section
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                id="section"
                onChange={(event) => setForm({ ...form, section: event.target.value })}
                placeholder="A"
                value={form.section}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="academic-year">
                Academic year
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                id="academic-year"
                onChange={(event) => setForm({ ...form, academic_year: event.target.value })}
                placeholder="2026-2027"
                required
                value={form.academic_year}
              />
            </div>

            <div className="flex items-end">
              <label className="flex h-10 items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  checked={form.is_active}
                  className="h-4 w-4 rounded border-slate-300"
                  onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                  type="checkbox"
                />
                Active
              </label>
            </div>

            {formError ? (
              <p className="lg:col-span-6 text-sm font-medium text-red-700">
                {formError}
              </p>
            ) : null}

            <div className="flex gap-3 lg:col-span-6">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Creating...' : 'Create class'}
              </Button>

              <Button
                disabled={isSubmitting}
                onClick={() => {
                  setForm(initialForm)
                  setFormError(null)
                  setIsCreateOpen(false)
                }}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Create your first class to start organizing teachers and students."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Create class
            </Button>
          }
        />
      ) : (
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
                  <tr className="transition hover:bg-slate-50" key={schoolClass.id}>
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
      )}
    </section>
  )
}