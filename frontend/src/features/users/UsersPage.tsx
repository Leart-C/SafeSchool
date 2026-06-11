import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { appToast } from '../../lib/toast'
import type { MeResponse } from '../../services/meService'
import {
  getUsers,
  updateUserRoles,
  type ManagedUser,
} from '../../services/userService'
import {
  type UserRoleOption,
} from './UserRoleSelect'
import { UsersPageHeader } from './UsersPageHeader'
import { UsersTable } from './UsersTable'

type AuthenticatedOutletContext = {
  me: MeResponse
}

export function UsersPage() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

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

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: number
      role: UserRoleOption
    }) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return updateUserRoles(token, userId, {
        roles: [role],
      })
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users,
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.me,
      })

      appToast.success(
        'Role updated',
        `${response.data.user.name} now has the ${response.data.user.roles.join(', ')} role.`,
      )
    },
    onError: (error) => {
      appToast.error(
        'Could not update role',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  function handleRoleChange(user: ManagedUser, role: UserRoleOption) {
    updateRoleMutation.mutate({
      userId: user.id,
      role,
    })
  }

  if (usersQuery.isLoading) {
    return (
      <section className="space-y-6">
        <UsersPageHeader />

        <Card>
          <p className="text-sm text-slate-600">Loading users...</p>
        </Card>
      </section>
    )
  }

  if (usersQuery.isError) {
    return (
      <section className="space-y-6">
        <UsersPageHeader />

        <EmptyState
          title="Could not load users"
          description={
            usersQuery.error instanceof Error
              ? usersQuery.error.message
              : 'Failed to load users'
          }
        />
      </section>
    )
  }

  const users = usersQuery.data?.data.users ?? []

  if (users.length === 0) {
    return (
      <section className="space-y-6">
        <UsersPageHeader />

        <EmptyState
          title="No users yet"
          description="Users will appear here after they are synced from Clerk and assigned to this school."
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <UsersPageHeader />

      <UsersTable
        currentUserId={me.data.id}
        isUpdatingUserId={
          updateRoleMutation.variables?.userId && updateRoleMutation.isPending
            ? updateRoleMutation.variables.userId
            : null
        }
        onRoleChange={handleRoleChange}
        users={users}
      />
    </section>
  )
}