import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const VERIFIED_BIKES = [
  {
    id: 'v1',
    brand: 'Trek',
    title: 'Trek Émonda SL 6 Pro 2023',
    specs: 'Carbon · 54cm · Shimano Ultegra Di2',
    price: 65000000,
    rating: 5.0,
    reviewCount: 12,
    location: 'TP. Hồ Chí Minh',
  },
  {
    id: 'v2',
    brand: 'Specialized',
    title: 'Specialized S-Works Tarmac SL7 2022',
    specs: 'Carbon · 56cm · SRAM Red AXS',
    price: 120000000,
    rating: 4.9,
    reviewCount: 8,
    location: 'Hà Nội',
  },
  {
    id: 'v3',
    brand: 'Cannondale',
    title: 'Cannondale SuperSix EVO Carbon 2023',
    specs: 'Carbon · 52cm · Shimano 105 Di2',
    price: 45000000,
    rating: 4.8,
    reviewCount: 15,
    location: 'Đà Nẵng',
  },
]

// Navy section for Verified — contrast block like Airbnb's dark sections
export function VerifiedListings() {
  return (
    <section
      className="py-20"
      style={{ background: 'linear-gradient(160deg, #0A1628 0%, #1e3a5f 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-4">
              <span
                className="material-symbols-outlined text-green-container text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                Đã kiểm định bởi chuyên gia
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ letterSpacing: '-0.44px' }}
            >
              Xe Verified — mua yên tâm
            </h2>
          </div>
          <Link to={`${ROUTES.BROWSE}?verified=true`}>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
              Xem tất cả xe Verified
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </Button>
          </Link>
        </div>

        {/* Cards — white elevated on navy bg */}
        <div className="flex flex-col gap-4">
          {VERIFIED_BIKES.map((bike) => (
            <div
              key={bike.id}
              className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/12 transition-colors cursor-pointer group"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start gap-4">
                {/* Bike icon placeholder */}
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-white/40"
                    style={{ fontSize: '2rem' }}
                  >
                    directions_bike
                  </span>
                </div>

                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-1">{bike.brand}</p>
                  <h3 className="text-white font-semibold text-base leading-snug mb-1 group-hover:text-green-container transition-colors">
                    {bike.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-2">{bike.specs}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="verified">
                      <span
                        className="material-symbols-outlined text-[0.65rem]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >verified</span>
                      Đã kiểm định
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[0.85rem]"
                        style={{ fontVariationSettings: "'FILL' 1", color: '#facc15' }}
                      >star</span>
                      <span className="text-xs text-white/60">
                        {bike.rating} ({bike.reviewCount} đánh giá)
                      </span>
                    </div>
                    <span className="text-xs text-white/40">{bike.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.44px' }}>
                  {formatPrice(bike.price)}
                </p>
                <Button variant="verified" size="sm">Xem chi tiết</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
