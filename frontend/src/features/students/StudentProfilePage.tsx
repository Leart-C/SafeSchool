import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { appToast } from '../../lib/toast'
import {
  createStudentGuardian,
  getStudent,
  type CreateStudentGuardianPayload,
} from '../../services/studentService'
import { StudentClassesPanel } from './StudentClassesPanel'
import { StudentGuardianForm } from './StudentGuardianForm'
import { StudentGuardiansPanel } from './StudentGuardiansPanel'
import { StudentOfficialProfilePanel } from './StudentOfficialProfilePanel'
import { StudentProfileHeader } from './StudentProfileHeader'
import { StudentSummaryCards } from './StudentSummaryCards'

const initialGuardianForm: CreateStudentGuardianPayload = {
  first_name: '',
  last_name: '',
  email: '',
  relationship: 'mother',
  is_primary: false,
  emergency_contact_priority: null,
}

export function StudentProfilePage() {
  const { studentId } = useParams()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const [isGuardianFormOpen, setIsGuardianFormOpen] = useState(false)
  const [guardianForm, setGuardianForm] = useState(initialGuardianForm)

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

  const createGuardianMutation = useMutation({
    mutationFn: async (payload: CreateStudentGuardianPayload) => {
      if (!studentId) {
        throw new Error('Student id is missing.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return createStudentGuardian(token, studentId, {
        ...payload,
        emergency_contact_priority:
          payload.emergency_contact_priority || null,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.students }),
        queryClient.invalidateQueries({ queryKey: queryKeys.users }),
      ])

      appToast.success('Guardian linked.')
      setGuardianForm(initialGuardianForm)
      setIsGuardianFormOpen(false)
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : 'Failed to link guardian.',
      )
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

      <StudentOfficialProfilePanel profile={student.profile} />

      {isGuardianFormOpen ? (
        <StudentGuardianForm
          form={guardianForm}
          isSubmitting={createGuardianMutation.isPending}
          onCancel={() => {
            setGuardianForm(initialGuardianForm)
            setIsGuardianFormOpen(false)
          }}
          onChange={setGuardianForm}
          onSubmit={() => createGuardianMutation.mutate(guardianForm)}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <StudentGuardiansPanel
          action={
            <Button
              onClick={() => setIsGuardianFormOpen((isOpen) => !isOpen)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="h-4 w-4" aria-hidden={true} />
              {isGuardianFormOpen ? 'Close' : 'Add guardian'}
            </Button>
          }
          guardians={student.guardians}
        />
        <StudentClassesPanel classes={student.classes} />
      </div>
    </section>
  )
}