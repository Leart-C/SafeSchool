import { apiGet } from './api'

export type MeResponse = {
  data: {
    id: number
    clerk_user_id: string
    name: string
    email: string
    roles: string[]
    school: {
      id: number
      name: string
      slug: string
    } | null
  }
  message: string
}

export function getMe(token: string): Promise<MeResponse> {
  return apiGet<MeResponse>('/me', token)
}