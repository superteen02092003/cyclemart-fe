import { useState, useEffect } from 'react'
import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { bikePostService } from '@/services/bikePost'
import { categoryService } from '@/services/category'

function CategorySection({ category, bikes, loading }) {
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-content-primary mb-2">{category.name}</h2>
        </div>
        <div className="py-12 text-center text-content-secondary">
          Đang tải...
        </div>
      </section>
    )
  }

  if (!bikes || bikes.length === 0) {
    return null // Không hiển thị section nếu không có posts
  }

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8" data-category-id={category.id}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">{category.name}</h2>
          <p className="text-sm text-content-secondary">{category.description}</p>
        </div>
        <Link to={`${ROUTES.BROWSE}?category=${category.id}`}>
          <Button variant="secondary" size="sm" className="hidden md:flex">
            Xem tất cả
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bikes.slice(0, 4).map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>

      {/* Mobile "Xem tất cả" button */}
      <div className="mt-6 text-center md:hidden">
        <Link to={`${ROUTES.BROWSE}?category=${category.id}`}>
          <Button variant="outline" size="sm">
            Xem tất cả {category.name}
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </Button>
        </Link>
      </div>
    </section>
  )
}

// Component riêng cho featured grid
function FeaturedGrid() {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const params = { page: 0, size: 8 }
        const data = await bikePostService.getAll(params)
        setBikes(data.content || [])
      } catch (error) {
        console.error("Lỗi tải bài đăng nổi bật:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) {
    return <div className="py-12 text-center text-content-secondary">Đang tải...</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {bikes.map((bike) => (
        <BikeCard key={bike.id} bike={bike} />
      ))}
    </div>
  )
}

export function CategorySections() {
  const [categories, setCategories] = useState([])
  const [categoryPosts, setCategoryPosts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategoriesAndPosts = async () => {
      try {
        setLoading(true)
        
        // Load tất cả categories con (leaf categories)
        const categoriesData = await categoryService.getAllChildren()
        const activeCategories = categoriesData.filter(cat => cat.isActive)
        setCategories(activeCategories)

        // Load posts cho từng category
        const postsPromises = activeCategories.map(async (category) => {
          try {
            const params = { 
              categoryId: category.id,
              page: 0, 
              size: 4 // Chỉ lấy 4 posts cho mỗi category
            }
            const data = await bikePostService.search(params)
            return {
              categoryId: category.id,
              posts: data.content || []
            }
          } catch (error) {
            console.error(`Error loading posts for category ${category.id}:`, error)
            return {
              categoryId: category.id,
              posts: []
            }
          }
        })

        const postsResults = await Promise.all(postsPromises)
        
        // Convert array to object for easy lookup
        const postsMap = {}
        postsResults.forEach(result => {
          postsMap[result.categoryId] = result.posts
        })
        
        setCategoryPosts(postsMap)
      } catch (error) {
        console.error('Error loading categories and posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategoriesAndPosts()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center text-content-secondary">
          Đang tải danh mục và bài đăng...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-secondary">
      {/* Featured section - hiển thị tất cả posts nổi bật */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Nổi bật</p>
            <h2 className="text-3xl font-bold text-content-primary">Xe đang được quan tâm</h2>
          </div>
          <Link to={ROUTES.BROWSE}>
            <Button variant="secondary" size="sm" className="hidden md:flex">
              Xem tất cả
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </Button>
          </Link>
        </div>

        <FeaturedGrid />
      </section>

      {/* Category sections */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            bikes={categoryPosts[category.id] || []}
            loading={false}
          />
        ))
      ) : (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center text-content-secondary">
            Không có danh mục nào để hiển thị
          </div>
        </div>
      )}
    </div>
  )
}