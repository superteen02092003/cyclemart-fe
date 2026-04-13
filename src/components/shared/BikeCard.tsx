import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import type { Bike } from '@/types/bike'
import { cn } from '@/utils/cn'

interface BikeCardProps {
  bike: Bike
  className?: string
  featured?: boolean
}

const conditionLabels: Record<Bike['condition'], string> = {
  new: 'Mới 100%',
  like_new: 'Như mới',
  good: 'Tốt',
  used: 'Đã dùng',
  needs_repair: 'Cần sửa',
}

// Airbnb listing card: white, 20px radius, three-layer shadow, image-first
export function BikeCard({ bike, className, featured = false }: BikeCardProps) {
  return (
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
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {bike.isVerified && (
            <Badge variant="verified">
              <span
                className="material-symbols-outlined text-[0.7rem]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >verified</span>
              Đã kiểm định
            </Badge>
          )}
        </div>

        {/* Wishlist — Airbnb style: transparent, heart outline */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center group/fav">
          <span
            className="material-symbols-outlined text-white text-[1.3rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] group-hover/fav:text-red-400 transition-colors"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >favorite</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + rating row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-content-primary text-sm leading-snug line-clamp-2 flex-1">
            {bike.title}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span
              className="material-symbols-outlined text-[0.85rem]"
              style={{ fontVariationSettings: "'FILL' 1", color: '#222222' }}
            >star</span>
            <span className="text-xs font-semibold text-content-primary">{bike.sellerRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Meta */}
        <p className="text-xs text-content-secondary mb-1">
          {bike.brand} · {bike.year} · {bike.frameSize}cm
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
  )
}
