import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { canCreateMessages } from '../../lib/roles'
import { appToast } from '../../lib/toast'
import {
  createMessage,
  getMessages,
  type CreateMessagePayload,
} from '../../services/messageService'
import type { MeResponse } from '../../services/meService'
import { MessageForm } from './MessageForm'
import { MessagesList } from './MessagesList'
import { MessagesPageHeader } from './MessagesPageHeader'

type AuthenticatedOutletContext = {
  me: MeResponse
}

const initialForm: CreateMessagePayload = {
  audience: 'school',
  school_class_id: null,
  title: '',
  body: '',
  publish_now: true,
}

export function MessagesPage() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateMessagePayload>(initialForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const canCreate = canCreateMessages(me.data.roles)

  const messagesQuery = useQuery({
    queryKey: queryKeys.messages,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return getMessages(token)
    },
  })

  const createMessageMutation = useMutation({
    mutationFn: async (payload: CreateMessagePayload) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return createMessage(token, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages,
      })

      appToast.success(
        'Message published',
        `${response.data.message.title} is now available.`,
      )

      resetForm()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to publish message'

      setFormError(message)
      appToast.error('Could not publish message', message)
    },
  })

  function resetForm() {
    setForm(initialForm)
    setFormError(null)
    setIsFormOpen(false)
  }

  function submitMessage() {
    setFormError(null)

    createMessageMutation.mutate({
      ...form,
      title: form.title.trim(),
      body: form.body.trim(),
    })
  }

  if (messagesQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading messages...</p>
      </Card>
    )
  }

  if (messagesQuery.isError) {
    return (
      <EmptyState
        title="Could not load messages"
        description={
          messagesQuery.error instanceof Error
            ? messagesQuery.error.message
            : 'Failed to load messages'
        }
      />
    )
  }

  const messages = messagesQuery.data?.data.messages ?? []

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <MessagesPageHeader />

        {canCreate ? (
          <Button
            onClick={() => {
              if (isFormOpen) {
                resetForm()
                return
              }

              setIsFormOpen(true)
            }}
          >
            {isFormOpen ? 'Close form' : 'Create message'}
          </Button>
        ) : null}
      </div>

      {canCreate && isFormOpen ? (
        <MessageForm
          error={formError}
          form={form}
          isSubmitting={createMessageMutation.isPending}
          onCancel={resetForm}
          onChange={setForm}
          onSubmit={submitMessage}
        />
      ) : null}

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="School announcements and class updates will appear here."
          action={
            canCreate ? (
              <Button onClick={() => setIsFormOpen(true)}>
                Create message
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MessagesList messages={messages} />
      )}
    </section>
  )
}