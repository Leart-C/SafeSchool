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
  deleteStudentGuardian,
  getStudent,
  updateStudentGuardian,
  type StudentGuardian,
  type StudentGuardianPayload,
} from '../../services/studentService'
import { StudentClassesPanel } from './StudentClassesPanel'
import { StudentGuardianForm } from './StudentGuardianForm'
import { StudentGuardiansPanel } from './StudentGuardiansPanel'
import { StudentOfficialProfilePanel } from './StudentOfficialProfilePanel'
import { StudentProfileHeader } from './StudentProfileHeader'
import { StudentSummaryCards } from './StudentSummaryCards'

const initialGuardianForm: StudentGuardianPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  relationship: 'mother',
  is_primary: false,
  emergency_contact_priority: null,
}

function formFromGuardian(guardian: StudentGuardian): StudentGuardianPayload {
  return {
    first_name: guardian.first_name ?? '',
    last_name: guardian.last_name ?? '',
    email: guardian.email,
    phone: guardian.phone ?? '',
    relationship: guardian.relationship ?? 'guardian',
    is_primary: guardian.is_primary,
    emergency_contact_priority: guardian.emergency_contact_priority,
  }
}

export function StudentProfilePage() {
  const { studentId } = useParams()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const [isGuardianFormOpen, setIsGuardianFormOpen] = useState(false)
  const [editingGuardian, setEditingGuardian] = useState<StudentGuardian | null>(null)
  const [guardianForm, setGuardianForm] = useState(initialGuardianForm)
  const [mutatingGuardianId, setMutatingGuardianId] = useState<number | null>(null)

  const resetGuardianForm = () => {
    setGuardianForm(initialGuardianForm)
    setEditingGuardian(null)
    setIsGuardianFormOpen(false)
  }

  const invalidateStudentData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.students }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    ])
  }

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
    mutationFn: async (payload: StudentGuardianPayload) => {
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
      await invalidateStudentData()
      appToast.success('Guardian linked.')
      resetGuardianForm()
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : 'Failed to link guardian.',
      )
    },
  })

  const updateGuardianMutation = useMutation({
    mutationFn: async (payload: StudentGuardianPayload) => {
      if (!studentId || !editingGuardian) {
        throw new Error('Guardian edit context is missing.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      setMutatingGuardianId(editingGuardian.id)

      return updateStudentGuardian(token, studentId, editingGuardian.id, {
        ...payload,
        emergency_contact_priority:
          payload.emergency_contact_priority || null,
      })
    },
    onSuccess: async () => {
      await invalidateStudentData()
      appToast.success('Guardian updated.')
      resetGuardianForm()
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update guardian.',
      )
    },
    onSettled: () => {
      setMutatingGuardianId(null)
    },
  })

  const deleteGuardianMutation = useMutation({
    mutationFn: async (guardian: StudentGuardian) => {
      if (!studentId) {
        throw new Error('Student id is missing.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      setMutatingGuardianId(guardian.id)

      return deleteStudentGuardian(token, studentId, guardian.id)
    },
    onSuccess: async () => {
      await invalidateStudentData()
      appToast.success('Guardian unlinked.')
      resetGuardianForm()
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : 'Failed to unlink guardian.',
      )
    },
    onSettled: () => {
      setMutatingGuardianId(null)
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

  const isSubmitting =
    createGuardianMutation.isPending || updateGuardianMutation.isPending

  return (
    <section className="space-y-6">
      <StudentProfileHeader student={student} />

      <StudentSummaryCards student={student} />

      <StudentOfficialProfilePanel profile={student.profile} />

      {isGuardianFormOpen ? (
        <StudentGuardianForm
          description={
            editingGuardian
              ? 'Update this guardian contact and relationship details.'
              : 'Create or reuse a parent account and link it to this student.'
          }
          form={guardianForm}
          isSubmitting={isSubmitting}
          onCancel={resetGuardianForm}
          onChange={setGuardianForm}
          onSubmit={() => {
            if (editingGuardian) {
              updateGuardianMutation.mutate(guardianForm)
              return
            }

            createGuardianMutation.mutate(guardianForm)
          }}
          submitLabel={editingGuardian ? 'Save guardian' : 'Link guardian'}
          submittingLabel={editingGuardian ? 'Saving...' : 'Linking...'}
          title={editingGuardian ? 'Edit guardian' : 'Link guardian'}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <StudentGuardiansPanel
          action={
            <Button
              onClick={() => {
                if (isGuardianFormOpen && !editingGuardian) {
                  resetGuardianForm()
                  return
                }

                setEditingGuardian(null)
                setGuardianForm(initialGuardianForm)
                setIsGuardianFormOpen(true)
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="h-4 w-4" aria-hidden={true} />
              {isGuardianFormOpen && !editingGuardian ? 'Close' : 'Add guardian'}
            </Button>
          }
          guardians={student.guardians}
          isMutatingGuardianId={mutatingGuardianId}
          onEdit={(guardian) => {
            setEditingGuardian(guardian)
            setGuardianForm(formFromGuardian(guardian))
            setIsGuardianFormOpen(true)
          }}
          onUnlink={(guardian) => {
            if (!window.confirm(`Unlink ${guardian.name} from this student?`)) {
              return
            }

            deleteGuardianMutation.mutate(guardian)
          }}
        />
        <StudentClassesPanel classes={student.classes} />
      </div>
    </section>
  )
}