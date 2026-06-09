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

export type StudentGuardian = {
  id: number
  name: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  relationship: string | null
  is_primary: boolean
  emergency_contact_priority: number | null
}

export type StudentClass = {
  id: number
  name: string
  grade_level: string
  section: string | null
  academic_year: string
  is_active: boolean
}

export type StudentProfile = Student & {
  guardians: StudentGuardian[]
  classes: StudentClass[]
}

export type StudentResponse = {
  data: {
    student: StudentProfile
  }
  message: string
}

export function getStudent(
  token: string,
  studentId: string,
): Promise<StudentResponse> {
  return apiGet<StudentResponse>(`/students/${studentId}`, token)
}