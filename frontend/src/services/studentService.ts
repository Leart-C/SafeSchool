import { apiGet } from './api'

export type Student = {
  id: number
  name: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  guardians_count: number
  classes_count: number
}

export type StudentsResponse = {
  data: {
    students: Student[]
  }
  message: string
}

export function getStudents(token: string): Promise<StudentsResponse> {
  return apiGet<StudentsResponse>('/students', token)
}