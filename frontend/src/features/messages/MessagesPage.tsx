import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { queryKeys } from '../../lib/queryKeys'
import { canCreateMessages } from '../../lib/roles'
import { appToast } from '../../lib/toast'
import {
  archiveMessage,
  createMessage,
  getMessages,
  updateMessage,
  type CreateMessagePayload,
  type Message,
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

function formFromMessage(message: Message): CreateMessagePayload {
  return {
    audience: message.audience,
    school_class_id: message.class?.id ?? null,
    title: message.title,
    body: message.body,
    publish_now: message.published_at !== null,
  }
}

export function MessagesPage() {
  const { me } = useOutletContext<AuthenticatedOutletContext>()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateMessagePayload>(initialForm)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
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

  const updateMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      payload,
    }: {
      messageId: number
      payload: CreateMessagePayload
    }) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return updateMessage(token, messageId, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages,
      })

      appToast.success(
        'Message updated',
        `${response.data.message.title} was updated successfully.`,
      )

      resetForm()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update message'

      setFormError(message)
      appToast.error('Could not update message', message)
    },
  })

  const archiveMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const token = await getToken()

      if (!token) {
        throw new Error('No Clerk session token was returned.')
      }

      return archiveMessage(token, messageId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages,
      })

      appToast.success('Message archived', 'The message was removed from the active list.')
    },
    onError: (error) => {
      appToast.error(
        'Could not archive message',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  function resetForm() {
    setForm(initialForm)
    setEditingMessage(null)
    setFormError(null)
    setIsFormOpen(false)
  }

  function submitMessage() {
    setFormError(null)

    const payload = {
      ...form,
      title: form.title.trim(),
      body: form.body.trim(),
    }

    if (editingMessage) {
      updateMessageMutation.mutate({
        messageId: editingMessage.id,
        payload,
      })

      return
    }

    createMessageMutation.mutate(payload)
  }

  function handleEdit(message: Message) {
    setEditingMessage(message)
    setForm(formFromMessage(message))
    setFormError(null)
    setIsFormOpen(true)
  }

  function handleArchive(message: Message) {
    archiveMessageMutation.mutate(message.id)
  }

  if (messagesQuery.isLoading) {
    return (
      <section className="space-y-6">
        <MessagesPageHeader />

        <Card>
          <p className="text-sm text-slate-600">Loading messages...</p>
        </Card>
      </section>
    )
  }

  if (messagesQuery.isError) {
    return (
      <section className="space-y-6">
        <MessagesPageHeader />

        <EmptyState
          title="Could not load messages"
          description={
            messagesQuery.error instanceof Error
              ? messagesQuery.error.message
              : 'Failed to load messages'
          }
        />
      </section>
    )
  }

  const messages = messagesQuery.data?.data.messages ?? []
  const isSubmitting = createMessageMutation.isPending || updateMessageMutation.isPending

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <MessagesPageHeader />

        {canCreate ? (
          <Button
            icon={<Plus className="h-4 w-4" aria-hidden={true} />}
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
          isSubmitting={isSubmitting}
          onCancel={resetForm}
          onChange={setForm}
          onSubmit={submitMessage}
          submitLabel={editingMessage ? 'Save changes' : 'Publish message'}
        />
      ) : null}

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="School announcements and class updates will appear here."
          action={
            canCreate ? (
              <Button
                icon={<Plus className="h-4 w-4" aria-hidden={true} />}
                onClick={() => setIsFormOpen(true)}
              >
                Create message
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MessagesList
          canManage={canCreate}
          messages={messages}
          onArchive={handleArchive}
          onEdit={handleEdit}
        />
      )}
    </section>
  )
}
