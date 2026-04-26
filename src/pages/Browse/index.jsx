import { useState, useEffect } from 'react'
import { BikeCard } from '@/components/shared/BikeCard'
import { Button } from '@/components/ui/Button'
import { BIKE_CATEGORIES } from '@/constants/categories'
import { bikePostService } from '@/services/bikePost'

const BRANDS = ['Giant', 'Trek', 'Specialized', 'Cannondale', 'Merida', 'Cube', 'Scott', 'Brompton', 'Canyon', 'Pinarello']

const CONDITIONS = [
  { value: 'new', label: 'Mới 100%' },
  { value: 'like_new', label: 'Như mới' },
  { value: 'good', label: 'Tốt' },
  { value: 'used', label: 'Đã dùng' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'most_viewed', label: 'Nhiều lượt xem nhất' },
]

const LOCATIONS = [
  { value: '', label: 'Tất cả khu vực' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. HCM' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
]

const FILTER_CATEGORIES = BIKE_CATEGORIES.filter((c) => c.id !== 'all')

function CheckboxGroup({ label, items, selected, onChange }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    )
  }
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-content-primary uppercase tracking-wide mb-2">{label}</p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const val = item.value ?? item.id ?? item
          const lbl = item.label ?? item
          return (
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(val)}
                onChange={() => toggle(val)}
                className="w-4 h-4 rounded border-border-light accent-orange-500 cursor-pointer"
              />
              <span className="text-sm text-content-secondary group-hover:text-content-primary transition-colors">
                {lbl}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(false)

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedConditions, setSelectedConditions] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [location, setLocation] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Gọi API mỗi khi filter thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          minPrice: minPrice ? parseFloat(minPrice) * 1000000 : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) * 1000000 : undefined,
          city: location || undefined,
          page: 0,
          size: 20,
        }
        const data = await bikePostService.getAll(params)
        setBikes(data.content || data || [])
      } catch (error) {
        console.error("Lỗi khi tìm kiếm xe:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedBrands, minPrice, maxPrice, location, sortBy])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedConditions([])
    setMinPrice('')
    setMaxPrice('')
    setLocation('')
    setVerifiedOnly(false)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedConditions.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    location !== '' ||
    verifiedOnly

  // ── Sidebar Component (Khai báo bên trong để truy cập state trực tiếp) ───
  const Sidebar = () => (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-content-primary uppercase tracking-wide">Bộ lọc</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            style={{ color: '#ff6b35' }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <CheckboxGroup
        label="Loại xe"
        items={FILTER_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      <CheckboxGroup
        label="Thương hiệu"
        items={BRANDS}
        selected={selectedBrands}
        onChange={setSelectedBrands}
      />

      <CheckboxGroup
        label="Tình trạng"
        items={CONDITIONS}
        selected={selectedConditions}
        onChange={setSelectedConditions}
      />

      <div className="mb-5">
        <p className="text-xs font-bold text-content-primary uppercase tracking-wide mb-2">Khoảng giá (triệu ₫)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy transition-colors"
          />
          <span className="text-content-secondary text-sm flex-shrink-0">—</span>
          <input
            type="number"
            min="0"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy transition-colors"
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold text-content-primary uppercase tracking-wide mb-2">Khu vực</p>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-white transition-colors"
        >
          {LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border-light accent-orange-500 cursor-pointer"
          />
          <span className="text-sm text-content-secondary">Chỉ xe đã kiểm định</span>
        </label>
      </div>
    </aside>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary mb-1">Mua xe đạp</h1>
        <p className="text-sm text-content-secondary">Khám phá hàng trăm xe đạp chất lượng</p>
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-content-secondary text-[1.2rem]">
          search
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên xe, thương hiệu, model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors shadow-sm"
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-border-light rounded-sm text-sm font-semibold text-content-primary hover:bg-surface-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[1rem]">tune</span>
          Bộ lọc
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: '#ff6b35' }}>
              !
            </span>
          )}
        </button>

        {sidebarOpen && (
          <div className="mt-4 p-4 bg-white rounded-sm border border-border-light shadow-card">
            <Sidebar />
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-sm border border-border-light p-5 shadow-card sticky top-24">
            <Sidebar />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Sort + count bar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-content-secondary">
              Tìm thấy{' '}
              <span className="font-semibold text-content-primary">{bikes.length}</span> xe
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-content-secondary">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-white transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid or empty state */}
          {loading ? (
             <div className="py-20 text-center text-content-secondary">Đang tìm kiếm xe...</div>
          ) : bikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {bikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span
                className="material-symbols-outlined text-content-tertiary mb-4"
                style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 0" }}
              >
                search_off
              </span>
              <h3 className="text-lg font-semibold text-content-primary mb-2">Không tìm thấy xe phù hợp</h3>
              <p className="text-sm text-content-secondary mb-5 max-w-sm">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}