import { apiGet } from './api'

export type SchoolClass = {
  id: number
  name: string
  grade_level: string
  academic_year: string
  is_active: boolean
  teachers_count: number
  students_count: number
}

export type ClassesResponse = {
  data: {
    classes: SchoolClass[]
  }
  message: string
}

export function getClasses(token: string): Promise<ClassesResponse> {
  return apiGet<ClassesResponse>('/classes', token)
}