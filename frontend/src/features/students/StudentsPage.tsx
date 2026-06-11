import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { appToast } from '../../lib/toast'
import {
  createStudent,
  getStudents,
  type CreateStudentPayload,
} from '../../services/studentService'
import { StudentForm } from './StudentForm'
import { StudentsPageHeader } from './StudentsPageHeader'
import { StudentsTable } from './StudentsTable'

const initialForm: CreateStudentPayload = {
  first_name: '',
  last_name: '',
  email: '',
  student_code: '',
  date_of_birth: '',
  grade_level: '',
  notes: '',
}

export function StudentsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateStudentPayload>(initialForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  const createStudentMutation = useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return createStudent(token, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.students,
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.users,
      })

      appToast.success(
        'Student registered',
        `${response.data.student.name} was added successfully.`,
      )

      resetForm()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to register student'

      setFormError(message)
      appToast.error('Could not register student', message)
    },
  })

  function resetForm() {
    setForm(initialForm)
    setFormError(null)
    setIsFormOpen(false)
  }

  function toggleForm() {
    if (isFormOpen) {
      resetForm()
      return
    }

    setIsFormOpen(true)
  }

  function openForm() {
    setIsFormOpen(true)
  }

  function submitStudentForm() {
    setFormError(null)

    createStudentMutation.mutate({
      ...form,
      email: form.email?.trim() || undefined,
      student_code: form.student_code?.trim() || undefined,
      date_of_birth: form.date_of_birth || undefined,
      notes: form.notes?.trim() || undefined,
    })
  }

  const headerAction = (
    <Button
      icon={<Plus className="h-4 w-4" aria-hidden={true} />}
      onClick={toggleForm}
    >
      {isFormOpen ? 'Close form' : 'Register student'}
    </Button>
  )

  if (studentsQuery.isLoading) {
    return (
      <section className="space-y-6">
        <StudentsPageHeader action={headerAction} />

        <Card>
          <p className="text-sm text-slate-600">Loading students...</p>
        </Card>
      </section>
    )
  }

  if (studentsQuery.isError) {
    return (
      <section className="space-y-6">
        <StudentsPageHeader action={headerAction} />

        <EmptyState
          title="Could not load students"
          description={
            studentsQuery.error instanceof Error
              ? studentsQuery.error.message
              : 'Failed to load students'
          }
        />
      </section>
    )
  }

  const students = studentsQuery.data?.data.students ?? []

  return (
    <section className="space-y-6">
      <StudentsPageHeader action={headerAction} />

      {isFormOpen ? (
        <StudentForm
          error={formError}
          form={form}
          isSubmitting={createStudentMutation.isPending}
          onCancel={resetForm}
          onChange={setForm}
          onSubmit={submitStudentForm}
        />
      ) : null}

      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Register your first student to begin linking guardians, classes, and attendance."
          action={
            <Button
              icon={<Plus className="h-4 w-4" aria-hidden={true} />}
              onClick={openForm}
            >
              Register student
            </Button>
          }
        />
      ) : (
        <StudentsTable students={students} />
      )}
    </section>
  )
}