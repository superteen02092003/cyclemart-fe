import { cn } from '@/utils/cn'

// Airbnb button system — primary is navy CTA, generous radius
const variantClasses = {
  // Airbnb "Primary Dark" — navy instead of near-black
  primary:
    'bg-navy text-white hover:bg-navy-medium active:scale-[0.97] shadow-none hover:shadow-card-hover',
  // Airbnb secondary — white bg with border
  secondary:
    'bg-white text-content-primary border border-border hover:border-content-primary transition-colors',
  // Ghost — no border, subtle hover
  ghost:
    'bg-transparent text-content-primary hover:bg-surface-tertiary transition-colors',
  // Verified green for trust actions
  verified:
    'bg-green text-white hover:bg-green-dark active:scale-[0.97]',
  // Outline navy
  outline:
    'bg-transparent text-navy border border-navy hover:bg-navy-subtle transition-colors',
}

const sizeClasses = {
  sm: 'px-4 py-2.5 text-sm font-semibold',
  md: 'px-6 py-3 text-base font-medium',
  lg: 'px-8 py-4 text-base font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
