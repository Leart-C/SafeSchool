import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
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
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateClassPayload>(initialForm)
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const classesQuery = useQuery({
    queryKey: queryKeys.classes,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getClasses(token)
    },
  })

  const createClassMutation = useMutation({
    mutationFn: async (payload: CreateClassPayload) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return createClass(token, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes })

      appToast.success(
        'Class created',
        `${response.data.class.name} was added successfully.`,
      )

      resetForm()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to save class'

      setFormError(message)
      appToast.error('Could not save class', message)
    },
  })

  const updateClassMutation = useMutation({
    mutationFn: async ({
      classId,
      payload,
    }: {
      classId: number
      payload: CreateClassPayload
    }) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return updateClass(token, classId, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes })

      appToast.success(
        response.data.class.is_active ? 'Class saved' : 'Class archived',
        `${response.data.class.name} was updated successfully.`,
      )

      resetForm()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to save class'

      setFormError(message)
      appToast.error('Could not save class', message)
    },
  })

  function resetForm() {
    setForm(initialForm)
    setEditingClass(null)
    setFormError(null)
    setIsCreateOpen(false)
  }

  function openCreateForm() {
    setForm(initialForm)
    setEditingClass(null)
    setFormError(null)
    setIsCreateOpen(true)
  }

  function toggleForm() {
    if (isCreateOpen) {
      resetForm()
      return
    }

    openCreateForm()
  }

  function submitClassForm() {
    setFormError(null)

    const payload = {
      ...form,
      section: form.section?.trim() || undefined,
    }

    if (editingClass) {
      updateClassMutation.mutate({
        classId: editingClass.id,
        payload,
      })

      return
    }

    createClassMutation.mutate(payload)
  }

  function handleArchiveToggle(schoolClass: SchoolClass) {
    setFormError(null)

    updateClassMutation.mutate({
      classId: schoolClass.id,
      payload: {
        name: schoolClass.name,
        grade_level: schoolClass.grade_level,
        section: schoolClass.section ?? undefined,
        academic_year: schoolClass.academic_year,
        is_active: !schoolClass.is_active,
      },
    })
  }

  function handleEdit(schoolClass: SchoolClass) {
    setEditingClass(schoolClass)
    setForm(formFromClass(schoolClass))
    setFormError(null)
    setIsCreateOpen(true)
  }

  const isSubmitting = createClassMutation.isPending || updateClassMutation.isPending
  const classes = classesQuery.data?.data.classes ?? []

  if (classesQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading classes...</p>
      </Card>
    )
  }

  if (classesQuery.isError) {
    return (
      <EmptyState
        title="Could not load classes"
        description={
          classesQuery.error instanceof Error
            ? classesQuery.error.message
            : 'Failed to load classes'
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        action={
          <Button
            icon={<Plus className="h-4 w-4" aria-hidden={true} />}
            onClick={toggleForm}
          >
            {isCreateOpen ? 'Close form' : 'Create class'}
          </Button>
        }
        description="Review and manage classes scoped to your school. Archived classes stay available for history and reporting."
        eyebrow="School classes"
        title="Classes"
      />

      {isCreateOpen ? (
        <ClassForm
          error={formError}
          form={form}
          isSubmitting={isSubmitting}
          onCancel={resetForm}
          onChange={setForm}
          onSubmit={submitClassForm}
          submitLabel={editingClass ? 'Save changes' : 'Create class'}
        />
      ) : null}

      {classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Create your first class to start organizing teachers and students."
          action={
            <Button
              icon={<Plus className="h-4 w-4" aria-hidden={true} />}
              onClick={openCreateForm}
            >
              Create class
            </Button>
          }
        />
      ) : (
        <ClassesTable
          classes={classes}
          onArchiveToggle={handleArchiveToggle}
          onEdit={handleEdit}
        />
      )}
    </section>
  )
}