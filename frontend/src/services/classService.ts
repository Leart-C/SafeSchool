import { apiGet } from './api'

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

export type ClassesResponse = {
  data: {
    classes: SchoolClass[]
  }
  message: string
}

export function getClasses(token: string): Promise<ClassesResponse> {
  return apiGet<ClassesResponse>('/classes', token)
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

export async function createClass(
  token: string,
  payload: CreateClassPayload,
): Promise<CreateClassResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/classes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      // Keep the generic status message if the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<CreateClassResponse>
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

export async function updateClass(
  token: string,
  classId: number,
  payload: UpdateClassPayload,
): Promise<UpdateClassResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/classes/${classId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      // Keep the generic status message if the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<UpdateClassResponse>
}