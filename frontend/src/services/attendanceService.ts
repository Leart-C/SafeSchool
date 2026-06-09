import { apiGet } from './api'

export type AttendanceRecord = {
  id: number
  attendance_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
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