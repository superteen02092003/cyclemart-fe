import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { BIKE_CATEGORIES } from '@/constants/categories'

// Airbnb category pill bar: white bg, border-bottom on active, horizontal scroll
export function CategoryFilterBar({ onCategoryChange }) {
  const [selected, setSelected] = useState('all')

  const handleSelect = (id) => {
    setSelected(id)
    onCategoryChange?.(id)
  }

  return (
    <section className="bg-white border-b border-border-light sticky top-[72px] z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end gap-1 overflow-x-auto no-scrollbar">
          {BIKE_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              selected={selected === cat.id}
              onClick={() => handleSelect(cat.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
