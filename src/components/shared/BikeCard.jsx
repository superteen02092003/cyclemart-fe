import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { LoginRequiredModal } from '@/components/modals'

const conditionLabels = {
  new: 'Mới 100%',
  like_new: 'Như mới',
  good: 'Tốt',
  used: 'Đã dùng',
  needs_repair: 'Cần sửa',
}

export function BikeCard({
  bike,
  className,
  featured = false,
  isWishlisted = false,
  onWishlistToggle,
}) {
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    if (onWishlistToggle) onWishlistToggle(bike.id)
  }

  const viewCount = bike.views ?? bike.viewCount ?? bike.view_count ?? 0

  return (
    <>
      <Link to={`/bike/${bike.id}`} className="block">
        <article
          className={cn(
            'group bg-white rounded-lg overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-shadow duration-200',
            className
          )}
        >
          <div className={cn('relative overflow-hidden bg-surface-secondary', featured ? 'aspect-[4/3]' : 'aspect-[4/3]')}>
            {bike.images?.[0] ? (
              <img
                src={typeof bike.images[0] === 'string' ? bike.images[0] : bike.images[0].url}
                alt={bike.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
                <span className="material-symbols-outlined text-content-tertiary" style={{ fontSize: '3.5rem', fontVariationSettings: "'FILL' 0" }}>
                  directions_bike
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
              {bike.isVerified && (
                <Badge variant="verified">
                  <span className="material-symbols-outlined text-[0.7rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Đã kiểm định
                </Badge>
              )}
            </div>

            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center group/fav"
              aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[1.3rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-colors',
                  isWishlisted ? 'text-red-500' : 'text-white group-hover/fav:text-red-400'
                )}
                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
              >favorite</span>
            </button>
          </div>

          <div className="p-4">
            <div className="mb-1">
              <h3 className="font-semibold text-content-primary text-sm leading-snug line-clamp-2">{bike.title}</h3>
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-content-secondary min-w-0">
                <span className="material-symbols-outlined text-[0.9rem] flex-shrink-0">storefront</span>
                <span className="text-xs truncate">{bike.sellerName || 'Người bán'}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-content-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[0.85rem]">visibility</span>
                {viewCount} lượt xem
              </span>
            </div>

            <p className="text-xs text-content-secondary mb-1">
              {bike.brand} · {bike.year} · {bike.frameSize ? `${bike.frameSize}cm` : 'Xe gập'}
            </p>
            <p className="text-xs text-content-secondary mb-3">{bike.location}</p>

            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-content-primary">
                <span className="text-base">{formatPrice(bike.price)}</span>
              </p>
              {bike.isNegotiable && (
                <span className="text-xs text-content-secondary italic">Thương lượng</span>
              )}
            </div>

            <div className="mt-2">
              <span className="inline-block text-xs text-content-secondary bg-surface-secondary rounded-xs px-2 py-0.5">
                {conditionLabels[bike.condition]}
              </span>
            </div>
          </div>
        </article>
      </Link>
      
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} action="thêm vào yêu thích" />
    </>
  )
}