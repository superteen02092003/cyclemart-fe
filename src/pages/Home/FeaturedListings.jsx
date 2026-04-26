import { useState, useEffect } from 'react'
import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { bikePostService } from '@/services/bikePost'
import { categoryService } from '@/services/category'

export function FeaturedListings({ selectedCategory = 'all' }) {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('Xe đang được quan tâm')

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        
        // Nếu chọn category cụ thể, dùng search API với categoryId
        if (selectedCategory !== 'all') {
          const params = { 
            categoryId: parseInt(selectedCategory),
            page: 0, 
            size: 8 
          }
          const data = await bikePostService.search(params)
          setBikes(data.content || [])
          
          // Lấy tên category để hiển thị
          try {
            const categories = await categoryService.getAll()
            const category = categories.find(cat => cat.id === parseInt(selectedCategory))
            setCategoryName(category ? category.name : 'Xe đang được quan tâm')
          } catch (error) {
            setCategoryName('Xe đang được quan tâm')
          }
        } else {
          // Nếu chọn 'all', dùng getAll API
          const params = { page: 0, size: 8 }
          const data = await bikePostService.getAll(params)
          setBikes(data.content || [])
          setCategoryName('Xe đang được quan tâm')
        }
      } catch (error) {
        console.error("Lỗi tải bài đăng nổi bật:", error)
        setBikes([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [selectedCategory])

  if (loading) return <div className="py-20 text-center text-content-secondary">Đang tải bài đăng...</div>

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">
            {selectedCategory === 'all' ? 'Nổi bật' : 'Danh mục'}
          </p>
          <h2 className="text-3xl font-bold text-content-primary">{categoryName}</h2>
        </div>
        <Link to={ROUTES.BROWSE}>
          <Button variant="secondary" size="sm" className="hidden md:flex">
            Xem tất cả
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </section>
  )
}