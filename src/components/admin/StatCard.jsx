import { cn } from '@/utils/cn'

export function StatCard({ title, value, change, icon, className }) {
  const isPositive = change >= 0

  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-full bg-navy-subtle flex items-center justify-center">
          <span
            className="material-symbols-outlined text-navy text-[1.3rem]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full',
              isPositive ? 'text-success bg-green-light' : 'text-error bg-error/10'
            )}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-navy mb-1" style={{ letterSpacing: '-0.44px' }}>
        {value}
      </p>
      <p className="text-sm text-content-secondary font-medium">{title}</p>
    </div>
  )
}
