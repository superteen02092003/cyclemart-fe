import { SearchBar } from '@/components/shared/SearchBar'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const STATS = [
  { value: '2.000+', label: 'Xe đang rao bán' },
  { value: '500+', label: 'Giao dịch thành công' },
  { value: '98%', label: 'Người mua hài lòng' },
  { value: '100%', label: 'Escrow bảo vệ' },
]

// Airbnb + Navy: deep navy bg, white typography, prominent search
export function HeroSection() {
  const navigate = useNavigate()

  const handleSearch = (keyword) => {
    navigate(`${ROUTES.BROWSE}?keyword=${encodeURIComponent(keyword)}`)
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0A1628 0%, #1e3a5f 60%, #0A1628 100%)' }}
    >
      {/* Subtle mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a6fa5 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
        {/* Eyebrow pill — Airbnb style */}
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8">
          <span
            className="material-symbols-outlined text-green-container text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">
            Nền tảng mua bán xe đạp chuyên biệt
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
          style={{ letterSpacing: '-0.44px' }}
        >
          Mua bán xe đạp
          <br />
          <span
            className="text-green-container"
          >
            an toàn & uy tín
          </span>
        </h1>

        <p className="text-white/70 text-base md:text-lg max-w-lg mb-10 leading-relaxed font-medium">
          Kết nối cộng đồng xe đạp thể thao Việt Nam. Kiểm định độc lập, escrow an toàn, giao dịch minh bạch.
        </p>

        {/* Search — Airbnb style prominent bar */}
        <div className="max-w-2xl mb-10">
          <SearchBar
            placeholder="Tìm theo hãng, model, loại xe..."
            onSearch={handleSearch}
            size="lg"
          />
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center gap-2 mb-16">
          <span className="text-white/50 text-sm font-medium">Phổ biến:</span>
          {['Giant Defy', 'Trek Domane', 'MTB Carbon', 'Fixed Gear HCM', 'Xe gravel'].map((term) => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="text-sm text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 font-medium"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Stats — Airbnb magazine feel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.44px' }}>
                {stat.value}
              </p>
              <p className="text-sm text-white/50 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
