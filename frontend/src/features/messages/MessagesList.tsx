import { Card } from '../../components/ui/Card'
import { formatDisplayDate } from '../../lib/date'
import type { Message } from '../../services/messageService'

type MessagesListProps = {
  messages: Message[]
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

export function MessagesList({ messages }: MessagesListProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <Card key={message.id}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
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
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {message.title}
              </h3>

              <p className="mt-2 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-600">
                {message.body}
              </p>
            </div>

            <div className="shrink-0 text-sm text-slate-500 lg:text-right">
              <p className="font-medium text-slate-700">
                {message.sender.name}
              </p>
              <p>
                {message.published_at
                  ? formatDisplayDate(message.published_at)
                  : 'Draft'}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}