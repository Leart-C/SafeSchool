import {
  Archive,
  CalendarDays,
  MessageSquareText,
  Pencil,
  UserRound,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-sm font-semibold text-slate-950">
            Active messages
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Announcements currently visible in the SafeSchool workspace.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {messages.map((message) => (
          <article className="bg-white p-5 transition hover:bg-slate-50" key={message.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">
                    {audienceLabel(message.audience)}
                  </Badge>

                  {message.class ? (
                    <Badge variant="default">
                      {message.class.name}
                    </Badge>
                  ) : null}

                  {message.edited_at ? (
                    <Badge variant="warning">Edited</Badge>
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
                <div className="space-y-1 text-sm text-slate-500 lg:text-right">
                  <p className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <UserRound className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {message.sender.name}
                  </p>

                  <p className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {message.published_at
                      ? formatDisplayDate(message.published_at)
                      : 'Draft'}
                  </p>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      icon={<Pencil className="h-4 w-4" aria-hidden={true} />}
                      onClick={() => onEdit(message)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Edit
                    </Button>

                    <Button
                      icon={<Archive className="h-4 w-4" aria-hidden={true} />}
                      onClick={() => onArchive(message)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Archive
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
