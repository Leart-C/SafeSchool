import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonOwnProps<TElement extends ElementType> = {
  as?: TElement
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

type ButtonProps<TElement extends ElementType> = ButtonOwnProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof ButtonOwnProps<TElement>>

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800',
  secondary: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export function Button<TElement extends ElementType = 'button'>({
  as,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}: ButtonProps<TElement>) {
  const Component = as ?? 'button'

  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Component>
  )
}