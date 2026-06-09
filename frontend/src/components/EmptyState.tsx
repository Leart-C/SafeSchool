import type { ReactNode } from 'react'
import { Card } from './ui/Card'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div
        aria-hidden="true"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg font-semibold text-amber-700"
      >
        !
      </div>

      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>

      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  )
}