import { useState, useEffect } from 'react'
import { Chip } from '@/components/ui/Chip'
import { categoryService } from '@/services/category'

// Airbnb category pill bar: white bg, border-bottom on active, horizontal scroll
export function CategoryFilterBar({ onCategoryChange }) {
  const [selected, setSelected] = useState('all')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  // Load categories từ API
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      
      // Chỉ lấy categories đang active và là danh mục gốc (parentId = null)
      const activeRootCategories = data.filter(cat => cat.isActive && cat.parentId === null)
      
      // Thêm option "Tất cả" ở đầu
      const categoriesWithAll = [
        { id: 'all', name: 'Tất cả', icon: 'grid_view' },
        ...activeRootCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || 'category'
        }))
      ]
      
      setCategories(categoriesWithAll)
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to default categories if API fails
      setCategories([
        { id: 'all', name: 'Tất cả', icon: 'grid_view' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (id) => {
    setSelected(id)
    onCategoryChange?.(id)
  }

  if (loading) {
    return (
      <section className="bg-white border-b border-border-light sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <span className="text-content-secondary">Đang tải danh mục...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white border-b border-border-light sticky top-[72px] z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
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
