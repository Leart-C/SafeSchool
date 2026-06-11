import { apiGet, apiPost } from './api'

export type StudentOfficialProfile = {
  id: number
  student_code: string
  date_of_birth: string | null
  grade_level: string | null
  enrollment_status: string
  notes: string | null
}

export type Student = {
  id: number
  name: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  profile: StudentOfficialProfile | null
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
  phone: string | null
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

export type CreateStudentPayload = {
  first_name: string
  last_name: string
  email?: string
  student_code?: string
  date_of_birth?: string
  grade_level: string
  enrollment_status?: string
  notes?: string
}

export type CreateStudentResponse = {
  data: {
    student: Student
  }
  message: string
}

export function createStudent(
  token: string,
  payload: CreateStudentPayload,
): Promise<CreateStudentResponse> {
  return apiPost<CreateStudentResponse>('/students', token, payload)
}

export type CreateStudentGuardianPayload = {
  first_name: string
  last_name: string
  email: string
  relationship: string
  is_primary?: boolean
  emergency_contact_priority?: number | null
  phone?: string
}

export type CreateStudentGuardianResponse = {
  data: {
    guardian: StudentGuardian
  }
  message: string
}

export function createStudentGuardian(
  token: string,
  studentId: string,
  payload: CreateStudentGuardianPayload,
): Promise<CreateStudentGuardianResponse> {
  return apiPost<CreateStudentGuardianResponse>(
    `/students/${studentId}/guardians`,
    token,
    payload,
  )
}