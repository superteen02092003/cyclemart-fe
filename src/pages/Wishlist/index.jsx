import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { MOCK_BIKES } from '@/constants/mockData'
import { ROUTES } from '@/constants/routes'

// Pre-populate wishlist with first 4 bikes as mock data
const INITIAL_WISHLIST = MOCK_BIKES.slice(0, 4).map((b) => b.id)

export default function WishlistPage() {
  const [wishlistedIds, setWishlistedIds] = useState(INITIAL_WISHLIST)

  const wishlistedBikes = MOCK_BIKES.filter((b) => wishlistedIds.includes(b.id))

  const handleToggle = (id) => {
    setWishlistedIds((prev) => prev.filter((wId) => wId !== id))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Xe yêu thích của tôi</h1>
          <p className="text-sm text-content-secondary mt-0.5">
            {wishlistedBikes.length > 0
              ? `${wishlistedBikes.length} xe đang trong danh sách yêu thích`
              : 'Danh sách yêu thích trống'}
          </p>
        </div>
        {wishlistedBikes.length > 0 && (
          <Link to={ROUTES.BROWSE}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[1rem]">search</span>
              Khám phá thêm
            </Button>
          </Link>
        )}
      </div>

      {/* Content */}
      {wishlistedBikes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span
            className="material-symbols-outlined mb-4"
            style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 0", color: '#d1d5db' }}
          >
            favorite
          </span>
          <h2 className="text-lg font-semibold text-content-primary mb-2">Chưa có xe yêu thích</h2>
          <p className="text-sm text-content-secondary mb-6 max-w-sm">
            Nhấn vào biểu tượng trái tim trên mỗi xe để thêm vào danh sách yêu thích của bạn.
          </p>
          <Link to={ROUTES.BROWSE}>
            <button
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#ff6b35' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
            >
              <span className="material-symbols-outlined text-[1rem]">search</span>
              Khám phá xe
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistedBikes.map((bike) => (
            <BikeCard
              key={bike.id}
              bike={bike}
              isWishlisted={true}
              onWishlistToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
