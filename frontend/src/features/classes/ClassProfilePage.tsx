import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { appToast } from '../../lib/toast'
import { queryKeys } from '../../lib/queryKeys'
import {
  destroyClassMember,
  getClass,
  storeClassMember,
  type ClassMember,
  type ClassMemberRole,
} from '../../services/classService'
import { getUsers } from '../../services/userService'
import { AddClassMemberForm } from './AddClassMemberForm'
import { ClassMembersPanel } from './ClassMembersPanel'
import { ClassProfileHeader } from './ClassProfileHeader'

export function ClassProfilePage() {
  const { classId } = useParams()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<ClassMemberRole>('student')

  const classQuery = useQuery({
    queryKey: queryKeys.class(classId),
    enabled: isLoaded && isSignedIn && Boolean(classId),
    queryFn: async () => {
      if (!classId) {
        throw new Error('Class id is missing.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getClass(token, classId)
    },
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getUsers(token)
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const schoolClass = classQuery.data?.data.class

      if (!schoolClass) {
        throw new Error('Load a class before adding members.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return storeClassMember(token, schoolClass.id, {
        user_id: Number(selectedUserId),
        role: selectedRole,
      })
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.class(classId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes })

      appToast.success(
        'Class member added',
        `${response.data.class.name} roster was updated.`,
      )

      setSelectedUserId('')
    },
    onError: (error) => {
      appToast.error(
        'Could not add member',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (member: ClassMember) => {
      const schoolClass = classQuery.data?.data.class

      if (!schoolClass) {
        throw new Error('Load a class before removing members.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return destroyClassMember(token, schoolClass.id, member.id)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.class(classId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes })

      appToast.success(
        'Class member removed',
        `${response.data.class.name} roster was updated.`,
      )
    },
    onError: (error) => {
      appToast.error(
        'Could not remove member',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const schoolClass = classQuery.data?.data.class

  const candidateUsers = useMemo(() => {
    const users = usersQuery.data?.data.users ?? []

    if (!schoolClass) {
      return users
    }

    const assignedIds = new Set([
      ...schoolClass.teachers.map((teacher) => teacher.id),
      ...schoolClass.students.map((student) => student.id),
    ])

    return users.filter((user) => !assignedIds.has(user.id))
  }, [schoolClass, usersQuery.data])

  if (classQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading class profile...</p>
      </Card>
    )
  }

  if (classQuery.isError) {
    return (
      <EmptyState
        title="Could not load class"
        description={
          classQuery.error instanceof Error
            ? classQuery.error.message
            : 'Failed to load class'
        }
        action={
          <Button as={Link} to="/app/classes" variant="secondary">
            Back to classes
          </Button>
        }
      />
    )
  }

  if (!schoolClass) {
    return (
      <EmptyState
        title="Class not found"
        description="This class could not be found in your school workspace."
        action={
          <Button as={Link} to="/app/classes" variant="secondary">
            Back to classes
          </Button>
        }
      />
    )
  }

  return (
    <section className="space-y-6">
      <ClassProfileHeader schoolClass={schoolClass} />

      <AddClassMemberForm
        candidateUsers={candidateUsers}
        isSubmitting={addMemberMutation.isPending}
        onRoleChange={setSelectedRole}
        onSelectedUserChange={setSelectedUserId}
        onSubmit={() => addMemberMutation.mutate()}
        role={selectedRole}
        selectedUserId={selectedUserId}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ClassMembersPanel
          description="Teachers assigned to this class can manage daily attendance."
          isRemovingUserId={
            removeMemberMutation.isPending
              ? removeMemberMutation.variables?.id ?? null
              : null
          }
          members={schoolClass.teachers}
          onRemove={(member) => removeMemberMutation.mutate(member)}
          title="Teachers"
        />

        <ClassMembersPanel
          description="Students assigned here appear on the class attendance roster."
          isRemovingUserId={
            removeMemberMutation.isPending
              ? removeMemberMutation.variables?.id ?? null
              : null
          }
          members={schoolClass.students}
          onRemove={(member) => removeMemberMutation.mutate(member)}
          title="Students"
        />
      </div>
    </section>
  )
}
