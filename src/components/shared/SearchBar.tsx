import { cn } from '@/utils/cn'
import { useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  className?: string
  size?: 'sm' | 'lg'
}

// Airbnb search bar: white bg, three-layer shadow, pill/xl radius
export function SearchBar({
  placeholder = 'Tìm kiếm xe đạp...',
  onSearch,
  className,
  size = 'lg',
}: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center bg-white rounded-full transition-shadow duration-200',
          'shadow-card hover:shadow-card-hover focus-within:shadow-card-hover',
          size === 'lg' ? 'px-6 py-4' : 'px-4 py-3'
        )}
      >
        <span className="material-symbols-outlined text-content-secondary mr-3 text-[1.2rem]">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent outline-none text-content-primary placeholder:text-content-tertiary font-medium',
            size === 'lg' ? 'text-sm' : 'text-sm'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="w-7 h-7 rounded-full bg-surface-tertiary flex items-center justify-center mr-3 hover:bg-border-light transition-colors"
          >
            <span className="material-symbols-outlined text-content-secondary text-[0.9rem]">close</span>
          </button>
        )}
        <div className="w-px h-6 bg-border mx-3" />
        <button
          type="submit"
          className="bg-navy text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-navy-medium transition-colors active:scale-[0.97] flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[1rem]"
            style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
          Tìm kiếm
        </button>
      </div>
    </form>
  )
}
