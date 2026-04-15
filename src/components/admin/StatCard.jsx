import { cn } from '@/utils/cn'

export function StatCard({ title, value, change, icon, className }) {
  const isPositive = change >= 0

  return (
    <div className={cn('bg-surface rounded-sm border border-border-light p-6 shadow-card hover:shadow-card-hover transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-content-secondary font-medium">{title}</p>
          <p className="text-3xl font-bold text-navy mt-2">{value}</p>
          {change !== undefined && (
            <p className={cn('text-sm font-medium mt-2', isPositive ? 'text-success' : 'text-error')}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% từ tuần trước
            </p>
          )}
        </div>
        {icon && <div className="text-4xl opacity-20">{icon}</div>}
      </div>
    </div>
  )
}

