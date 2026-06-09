import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { appToast } from '../../lib/toast'
import {
  createClass,
  getClasses,
  updateClass,
  type CreateClassPayload,
  type SchoolClass,
} from '../../services/classService'
import { ClassForm } from './ClassForm'
import { ClassesTable } from './ClassesTable'

const initialForm: CreateClassPayload = {
  name: '',
  grade_level: '',
  section: '',
  academic_year: '2026-2027',
  is_active: true,
}

function formFromClass(schoolClass: SchoolClass): CreateClassPayload {
  return {
    name: schoolClass.name,
    grade_level: schoolClass.grade_level,
    section: schoolClass.section ?? '',
    academic_year: schoolClass.academic_year,
    is_active: schoolClass.is_active,
  }
}

export function ClassesPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [form, setForm] = useState<CreateClassPayload>(initialForm)
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
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

  function resetForm() {
    setForm(initialForm)
    setEditingClass(null)
    setFormError(null)
    setIsCreateOpen(false)
  }

  async function submitClassForm() {
    setFormError(null)
    setIsSubmitting(true)

    try {
      const token = await getToken()

      if (!token) {
        setFormError('No Clerk session token was returned.')
        return
      }

      if (editingClass) {
        const response = await updateClass(token, editingClass.id, {
          ...form,
          section: form.section?.trim() || undefined,
        })

        setClasses((currentClasses) =>
          currentClasses.map((schoolClass) =>
            schoolClass.id === response.data.class.id
              ? response.data.class
              : schoolClass,
          ),
        )

        appToast.success(
          'Class updated',
          `${response.data.class.name} was updated successfully.`,
        )
      } else {
        const response = await createClass(token, {
          ...form,
          section: form.section?.trim() || undefined,
        })

        setClasses((currentClasses) => [...currentClasses, response.data.class])
        appToast.success(
          'Class created',
          `${response.data.class.name} was added successfully.`,
        )
      }

      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save class'

      setFormError(message)
      appToast.error('Could not save class', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleArchiveToggle(schoolClass: SchoolClass) {
    try {
      const token = await getToken()

      if (!token) {
        appToast.error('Could not update class', 'No Clerk session token was returned.')
        return
      }

      const response = await updateClass(token, schoolClass.id, {
        name: schoolClass.name,
        grade_level: schoolClass.grade_level,
        section: schoolClass.section ?? undefined,
        academic_year: schoolClass.academic_year,
        is_active: !schoolClass.is_active,
      })

      setClasses((currentClasses) =>
        currentClasses.map((currentClass) =>
          currentClass.id === response.data.class.id
            ? response.data.class
            : currentClass,
        ),
      )

      appToast.success(
        response.data.class.is_active ? 'Class restored' : 'Class archived',
        `${response.data.class.name} was updated successfully.`,
      )
    } catch (error) {
      appToast.error(
        'Could not update class',
        error instanceof Error ? error.message : 'Please try again.',
      )
    }
  }

  function handleEdit(schoolClass: SchoolClass) {
    setEditingClass(schoolClass)
    setForm(formFromClass(schoolClass))
    setFormError(null)
    setIsCreateOpen(true)
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
            Review and manage classes scoped to your school. Archived classes
            stay available for history and reporting.
          </p>
        </div>

        <Button
          onClick={() => {
            if (isCreateOpen) {
              resetForm()
              return
            }

            setIsCreateOpen(true)
          }}
        >
          {isCreateOpen ? 'Close form' : 'Create class'}
        </Button>
      </div>

      {isCreateOpen ? (
        <ClassForm
          error={formError}
          form={form}
          isSubmitting={isSubmitting}
          onCancel={resetForm}
          onChange={setForm}
          onSubmit={() => void submitClassForm()}
          submitLabel={editingClass ? 'Save changes' : 'Create class'}
        />
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
        <ClassesTable
          classes={classes}
          onArchiveToggle={(schoolClass) => void handleArchiveToggle(schoolClass)}
          onEdit={handleEdit}
        />
      )}
    </section>
  )
}