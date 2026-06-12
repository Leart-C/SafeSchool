import { apiDelete, apiGet, apiPost, apiPut } from './api'

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
  phone: string | null
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

export type StudentGuardianPayload = {
  first_name: string
  last_name: string
  email: string
  phone?: string
  relationship: string
  is_primary?: boolean
  emergency_contact_priority?: number | null
}

export type CreateStudentGuardianPayload = StudentGuardianPayload
export type UpdateStudentGuardianPayload = StudentGuardianPayload

export type StudentGuardianResponse = {
  data: {
    guardian: StudentGuardian
  }
  message: string
}

export function createStudentGuardian(
  token: string,
  studentId: string,
  payload: CreateStudentGuardianPayload,
): Promise<StudentGuardianResponse> {
  return apiPost<StudentGuardianResponse>(
    `/students/${studentId}/guardians`,
    token,
    payload,
  )
}

export function updateStudentGuardian(
  token: string,
  studentId: string,
  guardianId: number,
  payload: UpdateStudentGuardianPayload,
): Promise<StudentGuardianResponse> {
  return apiPut<StudentGuardianResponse>(
    `/students/${studentId}/guardians/${guardianId}`,
    token,
    payload,
  )
}

export type DeleteStudentGuardianResponse = {
  data: Record<string, never>
  message: string
}

export function deleteStudentGuardian(
  token: string,
  studentId: string,
  guardianId: number,
): Promise<DeleteStudentGuardianResponse> {
  return apiDelete<DeleteStudentGuardianResponse>(
    `/students/${studentId}/guardians/${guardianId}`,
    token,
  )
}