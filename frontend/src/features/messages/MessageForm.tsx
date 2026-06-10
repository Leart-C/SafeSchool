import type {
  CreateMessagePayload,
  MessageAudience,
} from '../../services/messageService'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

type MessageFormProps = {
  error: string | null
  form: CreateMessagePayload
  isSubmitting: boolean
  onCancel: () => void
  onChange: (form: CreateMessagePayload) => void
  onSubmit: () => void
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
}: MessageFormProps) {
  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="message-audience">
              Audience
            </label>

            <select
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="message-title">
              Title
            </label>

            <input
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

          <textarea
            className="mt-2 min-h-36 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={form.publish_now}
            className="h-4 w-4 rounded border-slate-300"
            onChange={(event) =>
              onChange({
                ...form,
                publish_now: event.target.checked,
              })
            }
            type="checkbox"
          />
          Publish now
        </label>

        {error ? (
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Publishing...' : 'Publish message'}
          </Button>

          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}