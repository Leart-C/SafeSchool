import { apiGet, apiPost } from './api'

export type MessageAudience = 'school' | 'teachers' | 'parents' | 'students' | 'class'

export type Message = {
  id: number
  audience: MessageAudience
  title: string
  body: string
  published_at: string | null
  sender: {
    id: number
    name: string
    email: string
  }
  class: {
    id: number
    name: string
    grade_level: string | null
    section: string | null
  } | null
}

export type MessagesResponse = {
  data: {
    messages: Message[]
  }
  message: string
}

export function getMessages(token: string): Promise<MessagesResponse> {
  return apiGet<MessagesResponse>('/messages', token)
}

export type CreateMessagePayload = {
  audience: MessageAudience
  school_class_id?: number | null
  title: string
  body: string
  publish_now: boolean
}

export type CreateMessageResponse = {
  data: {
    message: Message
  }
  message: string
}

export function createMessage(
  token: string,
  payload: CreateMessagePayload,
): Promise<CreateMessageResponse> {
  return apiPost<CreateMessageResponse>('/messages', token, payload)
}