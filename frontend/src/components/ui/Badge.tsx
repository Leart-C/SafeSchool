type BadgeProps = {
  children: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneClasses = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}