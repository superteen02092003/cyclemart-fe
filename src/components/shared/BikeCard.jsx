import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const conditionLabels = {
  new: 'Mới 100%',
  like_new: 'Như mới',
  good: 'Tốt',
  used: 'Đã dùng',
  needs_repair: 'Cần sửa',
}

// Airbnb listing card: white, 20px radius, three-layer shadow, image-first
export function BikeCard({
  bike,
  className,
  featured = false,
  isWishlisted = false,
  onWishlistToggle,
}) {
  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onWishlistToggle) onWishlistToggle(bike.id)
  }

  return (
    <Link to={`/bike/${bike.id}`} className="block">
      <article
        className={cn(
          'group bg-white rounded-lg overflow-hidden cursor-pointer',
          'shadow-card hover:shadow-card-hover transition-shadow duration-200',
          className
        )}
      >
        {/* Image — hero of the card */}
        <div className={cn('relative overflow-hidden bg-surface-secondary', featured ? 'aspect-[4/3]' : 'aspect-[4/3]')}>
          {bike.images?.[0] ? (
            <img
              src={bike.images[0]}
              alt={bike.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
              <span
                className="material-symbols-outlined text-content-tertiary"
                style={{ fontSize: '3.5rem', fontVariationSettings: "'FILL' 0" }}
              >
                directions_bike
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 flex-col">
            {/* Tem kiểm định cũ */}
            {bike.isVerified && (
              <Badge variant="verified">
                <span className="material-symbols-outlined text-[0.7rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Đã kiểm định
              </Badge>
            )}

            {/* THÊM TEM ƯU TIÊN */}
            {bike.activePriority && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold text-white shadow-md",
                // Đổi màu tùy theo bậc ưu tiên (PLATINUM, GOLD, SILVER)
                bike.activePriority.priorityLevel === 'PLATINUM' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                bike.activePriority.priorityLevel === 'GOLD' ? 'bg-orange-500' :
                'bg-blue-500'
              )}>
                <span className="material-symbols-outlined text-[0.8rem]">rocket_launch</span>
                {bike.activePriority.name}
              </div>
            )}
          </div>

          {/* Wishlist — Airbnb style: transparent, heart outline */}
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

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <div className="mb-1">
            <h3 className="font-semibold text-content-primary text-sm leading-snug line-clamp-2">
              {bike.title}
            </h3>
          </div>

          {/* Seller + rating */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1 text-content-secondary min-w-0">
              <span className="material-symbols-outlined text-[0.9rem] flex-shrink-0">storefront</span>
              <span className="text-xs truncate">{bike.sellerName || 'Người bán'}</span>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0" title="Đánh giá người bán">
              <span
                className="material-symbols-outlined text-[0.85rem]"
                style={{ fontVariationSettings: "'FILL' 1", color: '#222222' }}
              >star</span>
              <span className="text-xs font-semibold text-content-primary">
                {bike.sellerRating ? bike.sellerRating.toFixed(1) : 'Chưa có'}
              </span>
            </div>
          </div>

          {/* Meta */}
          <p className="text-xs text-content-secondary mb-1">
            {bike.brand} · {bike.year} · {bike.frameSize ? `${bike.frameSize}cm` : 'Xe gập'}
          </p>
          <p className="text-xs text-content-secondary mb-3">{bike.location}</p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-content-primary">
              <span className="text-base">{formatPrice(bike.price)}</span>
            </p>
            {bike.isNegotiable && (
              <span className="text-xs text-content-secondary italic">Thương lượng</span>
            )}
          </div>

          {/* Condition chip */}
          <div className="mt-2">
            <span className="inline-block text-xs text-content-secondary bg-surface-secondary rounded-xs px-2 py-0.5">
              {conditionLabels[bike.condition]}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
