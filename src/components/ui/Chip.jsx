import { cn } from '@/utils/cn'

// Airbnb category pill: horizontal-scroll bar, border on active, no background fill
export function Chip({ label, icon, selected = false, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex flex-col items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-150 border-b-2',
        selected
          ? 'text-content-primary border-content-primary'
          : 'text-content-secondary border-transparent hover:text-content-primary hover:border-border',
        className
      )}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[1.4rem]"
          style={{ fontVariationSettings: selected ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  )
}
