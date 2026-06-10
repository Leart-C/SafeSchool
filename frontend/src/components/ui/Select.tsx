import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition',
        'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}