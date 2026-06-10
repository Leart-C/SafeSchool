import { apiGet, apiPost } from './api'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type AttendanceRecord = {
  id: number
  attendance_date: string
  status: AttendanceStatus
  note: string | null
  class: {
    id: number
    name: string
    grade_level: string
    section: string | null
  }
  student: {
    id: number
    name: string
    email: string
    first_name: string | null
    last_name: string | null
  }
  recorded_by: {
    id: number
    name: string
    email: string
  } | null
}

export type AttendanceResponse = {
  data: {
    attendance_records: AttendanceRecord[]
  }
  message: string
}

export function getAttendanceRecords(token: string): Promise<AttendanceResponse> {
  return apiGet<AttendanceResponse>('/attendance', token)
}

export type AttendanceRosterStudent = {
  id: number
  name: string
  email: string
  first_name: string | null
  last_name: string | null
  attendance: {
    id: number
    status: AttendanceStatus
    note: string | null
  } | null
}

export type AttendanceRoster = {
  class: {
    id: number
    name: string
    grade_level: string
    section: string | null
    academic_year: string
    is_active: boolean
  }
  attendance_date: string
  students: AttendanceRosterStudent[]
}

export type AttendanceRosterResponse = {
  data: {
    roster: AttendanceRoster
  }
  message: string
}

export function getClassAttendanceRoster(
  token: string,
  classId: number,
  date: string,
): Promise<AttendanceRosterResponse> {
  return apiGet<AttendanceRosterResponse>(
    `/classes/${classId}/attendance-roster?date=${encodeURIComponent(date)}`,
    token,
  )
}

export type StoreAttendanceRecordPayload = {
  student_user_id: number
  status: AttendanceStatus
  note?: string | null
}

export type StoreClassAttendancePayload = {
  attendance_date: string
  records: StoreAttendanceRecordPayload[]
}

export type StoreClassAttendanceResponse = {
  data: {
    attendance: {
      class: {
        id: number
        name: string
        grade_level: string
        section: string | null
      }
      attendance_date: string
      records: AttendanceRecord[]
    }
  }
  message: string
}

export function storeClassAttendance(
  token: string,
  classId: number,
  payload: StoreClassAttendancePayload,
): Promise<StoreClassAttendanceResponse> {
  return apiPost<StoreClassAttendanceResponse>(
    `/classes/${classId}/attendance-records`,
    token,
    payload,
  )
}