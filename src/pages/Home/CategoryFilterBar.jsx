import { useState, useEffect } from 'react'
import { Chip } from '@/components/ui/Chip'
import { categoryService } from '@/services/category'

export function CategoryFilterBar() {
  const [selected, setSelected] = useState('all')
  const [categories, setCategories] = useState([])
  const [childCategories, setChildCategories] = useState([])
  const [expandedParent, setExpandedParent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      
      // Lấy danh mục gốc (parentId = null)
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
      setCategories([
        { id: 'all', name: 'Tất cả', icon: 'grid_view' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (id) => {
    setSelected(id)
    
    if (id === 'all') {
      setExpandedParent(null)
      setChildCategories([])
      // Scroll to top để xem featured section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Check if this category has children
      try {
        const allData = await categoryService.getAll()
        const children = allData.filter(cat => cat.parentId === id && cat.isActive)
        
        if (children.length > 0) {
          // Nếu có danh mục con, expand nó
          setExpandedParent(id)
          setChildCategories(children.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || 'category'
          })))
        } else {
          // Nếu không có danh mục con, scroll đến section của category này
          setExpandedParent(null)
          setChildCategories([])
          scrollToCategorySection(id)
        }
      } catch (error) {
        console.error('Error loading child categories:', error)
        setExpandedParent(null)
        setChildCategories([])
        scrollToCategorySection(id)
      }
    }
  }

  const handleChildCategoryClick = (childId) => {
    setSelected(childId)
    // Đóng dropdown sau khi chọn
    setExpandedParent(null)
    setChildCategories([])
    scrollToCategorySection(childId)
  }

  const scrollToCategorySection = (categoryId) => {
    // Tìm section có data-category-id tương ứng và scroll đến đó
    setTimeout(() => {
      const element = document.querySelector(`[data-category-id="${categoryId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
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
        {/* Parent categories */}
        <div className="flex items-end gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              icon={cat.icon}
              selected={selected === cat.id || expandedParent === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>

        {/* Child categories - show when parent is expanded */}
        {childCategories.length > 0 && expandedParent && (
          <div className="py-3 border-t border-border-light mt-1 space-y-0">
            {childCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleChildCategoryClick(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 transition-colors border-b text-sm ${
                  selected === cat.id
                    ? 'border-navy text-navy font-semibold'
                    : 'border-border-light text-content-primary hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{cat.name}</span>
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
