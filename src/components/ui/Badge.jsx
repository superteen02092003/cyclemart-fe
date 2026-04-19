import { cn } from '@/utils/cn'

// Thêm style cho 3 gói ưu tiên
const variantClasses = {
  verified: 'bg-green-light text-green border border-green/20',
  navy:     'bg-navy-subtle text-navy border border-navy/10',
  subtle:   'bg-surface-tertiary text-content-secondary border border-border-light',
  default:  'bg-surface-secondary text-content-primary border border-border-light',
  // Thêm mới:
  platinum: 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm', // Kim Cương (Tím/Indigo)
  gold:     'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm', // Vàng
  silver:   'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm', // Bạc
}

export function Badge({ variant = 'default', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold leading-none',
        variantClasses[variant] || variantClasses.default,
        className
      )}
    >
      {children}
    </span>
  )
}