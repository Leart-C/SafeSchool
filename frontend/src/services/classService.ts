import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from './api'

export type SchoolClass = {
  id: number
  name: string
  grade_level: string
  section: string | null
  academic_year: string
  is_active: boolean
  teachers_count: number
  students_count: number
}

export type ClassMember = {
  id: number
  name: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

export type ClassProfile = SchoolClass & {
  teachers: ClassMember[]
  students: ClassMember[]
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

export type ClassResponse = {
  data: {
    class: ClassProfile
  }
  message: string
}

export function getClass(
  token: string,
  classId: string,
): Promise<ClassResponse> {
  return apiGet<ClassResponse>(`/classes/${classId}`, token)
}

export type CreateClassPayload = {
  name: string
  grade_level: string
  section?: string
  academic_year: string
  is_active: boolean
}

export type CreateClassResponse = {
  data: {
    class: SchoolClass
  }
  message: string
}

export function createClass(
  token: string,
  payload: CreateClassPayload,
): Promise<CreateClassResponse> {
  return apiPost<CreateClassResponse>('/classes', token, payload)
}

export type UpdateClassPayload = {
  name: string
  grade_level: string
  section?: string
  academic_year: string
  is_active: boolean
}

export type UpdateClassResponse = {
  data: {
    class: SchoolClass
  }
  message: string
}

export function updateClass(
  token: string,
  classId: number,
  payload: UpdateClassPayload,
): Promise<UpdateClassResponse> {
  return apiPut<UpdateClassResponse>(`/classes/${classId}`, token, payload)
}

export type ClassMemberRole = 'teacher' | 'student' | 'assistant'

export type StoreClassMemberPayload = {
  user_id: number
  role: ClassMemberRole
}

export function storeClassMember(
  token: string,
  classId: number,
  payload: StoreClassMemberPayload,
): Promise<ClassResponse> {
  return apiPost<ClassResponse>(`/classes/${classId}/members`, token, payload)
}

export function destroyClassMember(
  token: string,
  classId: number,
  userId: number,
): Promise<ClassResponse> {
  return apiDelete<ClassResponse>(`/classes/${classId}/members/${userId}`, token)
}
