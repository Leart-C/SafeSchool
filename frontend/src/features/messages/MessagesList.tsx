import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDisplayDate } from '../../lib/date'
import type { Message } from '../../services/messageService'

type MessagesListProps = {
  canManage: boolean
  messages: Message[]
  onArchive: (message: Message) => void
  onEdit: (message: Message) => void
}

function audienceLabel(audience: string): string {
  const labels: Record<string, string> = {
    school: 'School',
    teachers: 'Teachers',
    parents: 'Parents',
    students: 'Students',
    class: 'Class',
  }

  return labels[audience] ?? audience
}

export function MessagesList({
  canManage,
  messages,
  onArchive,
  onEdit,
}: MessagesListProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <Card key={message.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {audienceLabel(message.audience)}
                </span>

                {message.class ? (
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {message.class.name}
                  </span>
                ) : null}

                {message.edited_at ? (
                  <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    Edited
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {message.title}
              </h3>

              <p className="mt-2 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-600">
                {message.body}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:items-end">
              <div className="text-sm text-slate-500 lg:text-right">
                <p className="font-medium text-slate-700">
                  {message.sender.name}
                </p>
                <p>
                  {message.published_at
                    ? formatDisplayDate(message.published_at)
                    : 'Draft'}
                </p>
              </div>

              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onEdit(message)}
                    type="button"
                    variant="secondary"
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={() => onArchive(message)}
                    type="button"
                    variant="ghost"
                  >
                    Archive
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}