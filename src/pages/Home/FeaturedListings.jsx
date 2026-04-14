import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const MOCK_BIKES = [
  {
    id: '1',
    title: 'Giant Defy Advanced 2 2023 — Carbon Endurance Road',
    brand: 'Giant',
    model: 'Defy Advanced 2',
    year: 2023,
    category: 'ROAD',
    frameSize: 54,
    frameMaterial: 'Carbon',
    groupset: 'Shimano 105',
    condition: 'like_new',
    price: 28500000,
    isNegotiable: true,
    location: 'TP. Hồ Chí Minh',
    images: [],
    isVerified: true,
    sellerId: 'u1',
    sellerName: 'Minh Tuấn',
    sellerRating: 4.9,
    createdAt: '2026-04-10',
    description: '',
  },
  {
    id: '2',
    title: 'Trek Domane AL 4 Disc 2022 — Aluminium Endurance',
    brand: 'Trek',
    model: 'Domane AL 4',
    year: 2022,
    category: 'ROAD',
    frameSize: 56,
    frameMaterial: 'Aluminum',
    groupset: 'Shimano Tiagra',
    condition: 'good',
    price: 16800000,
    isNegotiable: false,
    location: 'Hà Nội',
    images: [],
    isVerified: true,
    sellerId: 'u2',
    sellerName: 'Hoàng Nam',
    sellerRating: 4.7,
    createdAt: '2026-04-09',
    description: '',
  },
  {
    id: '3',
    title: 'Specialized Rockhopper Comp 29 2023 — MTB XC',
    brand: 'Specialized',
    model: 'Rockhopper Comp 29',
    year: 2023,
    category: 'MTB',
    frameSize: 52,
    frameMaterial: 'Aluminum',
    groupset: 'SRAM NX Eagle',
    condition: 'like_new',
    price: 21000000,
    isNegotiable: true,
    location: 'Đà Nẵng',
    images: [],
    isVerified: false,
    sellerId: 'u3',
    sellerName: 'Thanh Hà',
    sellerRating: 4.5,
    createdAt: '2026-04-08',
    description: '',
  },
  {
    id: '4',
    title: 'Cannondale Topstone Carbon Lefty 3 2022 — Gravel',
    brand: 'Cannondale',
    model: 'Topstone Carbon Lefty 3',
    year: 2022,
    category: 'GRAVEL',
    frameSize: 54,
    frameMaterial: 'Carbon',
    groupset: 'SRAM Rival AXS',
    condition: 'good',
    price: 38000000,
    isNegotiable: true,
    location: 'TP. Hồ Chí Minh',
    images: [],
    isVerified: true,
    sellerId: 'u4',
    sellerName: 'Văn Đức',
    sellerRating: 5.0,
    createdAt: '2026-04-07',
    description: '',
  },
  {
    id: '5',
    title: 'Merida Scultura 4000 2023 — Carbon Road Racing',
    brand: 'Merida',
    model: 'Scultura 4000',
    year: 2023,
    category: 'ROAD',
    frameSize: 50,
    frameMaterial: 'Carbon',
    groupset: 'Shimano 105',
    condition: 'like_new',
    price: 32000000,
    isNegotiable: false,
    location: 'Hà Nội',
    images: [],
    isVerified: false,
    sellerId: 'u5',
    sellerName: 'Quốc Anh',
    sellerRating: 4.8,
    createdAt: '2026-04-06',
    description: '',
  },
  {
    id: '6',
    title: 'Cube Agree C:62 Pro 2022 — Aero Carbon Road',
    brand: 'Cube',
    model: 'Agree C:62 Pro',
    year: 2022,
    category: 'ROAD',
    frameSize: 58,
    frameMaterial: 'Carbon',
    groupset: 'Shimano Ultegra',
    condition: 'good',
    price: 42000000,
    isNegotiable: true,
    location: 'TP. Hồ Chí Minh',
    images: [],
    isVerified: true,
    sellerId: 'u6',
    sellerName: 'Bảo Trân',
    sellerRating: 4.6,
    createdAt: '2026-04-05',
    description: '',
  },
]

// Airbnb listing grid: 4 columns desktop, photo-first cards, magazine layout
export function FeaturedListings() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Nổi bật</p>
          <h2 className="text-3xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
            Xe đang được quan tâm
          </h2>
        </div>
        <Link to={ROUTES.BROWSE}>
          <Button variant="secondary" size="sm" className="hidden md:flex">
            Xem tất cả
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </Button>
        </Link>
      </div>

      {/* Airbnb 4-column listing grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_BIKES.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="mt-8 flex justify-center md:hidden">
        <Link to={ROUTES.BROWSE}>
          <Button variant="outline" size="md">
            Xem tất cả xe
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </Button>
        </Link>
      </div>
    </section>
  )
}
