import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { cn } from '../lib/utils'

type DashboardCardTone = 'default' | 'success' | 'warning' | 'danger'

type DashboardCardProps = {
  title: string
  value: string
  description: string
  tone?: DashboardCardTone
  icon?: ReactNode
  action?: ReactNode
}

const iconTones: Record<DashboardCardTone, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
}

export function DashboardCard({
  title,
  value,
  description,
  tone = 'default',
  icon,
  action,
}: DashboardCardProps) {
  return (
    <Card className="group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md',
            iconTones[tone],
          )}
        >
          {icon ?? <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
        </div>

        <Badge variant={tone}>{tone}</Badge>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <strong className="mt-1 block text-2xl font-semibold text-slate-950">
          {value}
        </strong>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  )
}