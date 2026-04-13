import { cn } from '@/utils/cn'

type BadgeVariant = 'verified' | 'navy' | 'subtle' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

// Airbnb badge: 14px radius, semibold text
const variantClasses: Record<BadgeVariant, string> = {
  verified: 'bg-green-light text-green border border-green/20',
  navy:     'bg-navy-subtle text-navy border border-navy/10',
  subtle:   'bg-surface-tertiary text-content-secondary border border-border-light',
  default:  'bg-surface-secondary text-content-primary border border-border-light',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold leading-none',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
