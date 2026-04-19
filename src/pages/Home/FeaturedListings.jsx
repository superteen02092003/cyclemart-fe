import { useState, useEffect } from 'react'
import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { bikePostService } from '@/services/bikePost'

export function FeaturedListings() {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        // Lấy 8 bài mới nhất (BE sẽ tự xếp Priority lên đầu)
        const data = await bikePostService.getAll({ page: 0, size: 8 })
        setBikes(data.content || [])
      } catch (error) {
        console.error("Lỗi tải bài đăng nổi bật:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) return <div className="py-20 text-center text-content-secondary">Đang tải bài đăng...</div>

  return (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </section>
  )
}