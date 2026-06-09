import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

type DashboardCardProps = {
  title: string
  value: string
  description: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

export function DashboardCard({
  title,
  value,
  description,
  tone = 'default',
}: DashboardCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Badge tone={tone}>{tone}</Badge>
      </div>

      <strong className="mt-4 block text-2xl font-semibold text-slate-950">
        {value}
      </strong>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </Card>
  )
}