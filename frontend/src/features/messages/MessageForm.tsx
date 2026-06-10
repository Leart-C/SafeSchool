import { SendHorizontal } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import type {
  CreateMessagePayload,
  MessageAudience,
} from '../../services/messageService'

type MessageFormProps = {
  error: string | null
  form: CreateMessagePayload
  isSubmitting: boolean
  onCancel: () => void
  onChange: (form: CreateMessagePayload) => void
  onSubmit: () => void
  submitLabel: string
}

const audiences: Array<{
  value: MessageAudience
  label: string
}> = [
  { value: 'school', label: 'Whole school' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'parents', label: 'Parents' },
  { value: 'students', label: 'Students' },
]

export function MessageForm({
  error,
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
}: MessageFormProps) {
  return (
    <Card>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Message details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose who should see the message, then write a clear announcement.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="message-audience">
              Audience
            </label>

            <Select
              className="mt-2"
              id="message-audience"
              onChange={(event) =>
                onChange({
                  ...form,
                  audience: event.target.value as MessageAudience,
                  school_class_id: null,
                })
              }
              value={form.audience}
            >
              {audiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="message-title">
              Title
            </label>

            <Input
              className="mt-2"
              id="message-title"
              onChange={(event) =>
                onChange({
                  ...form,
                  title: event.target.value,
                })
              }
              placeholder="School announcement"
              required
              value={form.title}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="message-body">
            Message
          </label>

          <Textarea
            className="mt-2 min-h-36"
            id="message-body"
            onChange={(event) =>
              onChange({
                ...form,
                body: event.target.value,
              })
            }
            placeholder="Write the message families or staff should see."
            required
            value={form.body}
          />
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            checked={form.publish_now}
            className="mt-1 h-4 w-4 rounded border-slate-300"
            onChange={(event) =>
              onChange({
                ...form,
                publish_now: event.target.checked,
              })
            }
            type="checkbox"
          />

          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <SendHorizontal className="h-4 w-4 text-emerald-600" aria-hidden={true} />
              Publish now
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-500">
              Published messages appear immediately in the active message list.
            </span>
          </span>
        </label>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
