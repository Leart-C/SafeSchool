import { apiGet, apiPut } from './api'

export type ManagedUser = {
  id: number
  clerk_user_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  roles: string[]
  teaching_classes_count: number
  enrolled_classes_count: number
  guardians_count: number
  students_count: number
}

export type UsersResponse = {
  data: {
    users: ManagedUser[]
  }
  message: string
}

export function getUsers(token: string): Promise<UsersResponse> {
  return apiGet<UsersResponse>('/users', token)
}

export type UpdateUserRolesPayload = {
  roles: string[]
}

export type UpdateUserRolesResponse = {
  data: {
    user: Pick<
      ManagedUser,
      | 'id'
      | 'clerk_user_id'
      | 'name'
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'avatar_url'
      | 'roles'
    >
  }
  message: string
}

export function updateUserRoles(
  token: string,
  userId: number,
  payload: UpdateUserRolesPayload,
): Promise<UpdateUserRolesResponse> {
  return apiPut<UpdateUserRolesResponse>(
    `/users/${userId}/roles`,
    token,
    payload,
  )
}