import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const BENEFITS = [
  { icon: 'trending_up', text: 'Tiếp cận hàng nghìn người mua tiềm năng' },
  { icon: 'verified', text: 'Badge Verified giúp xe bán nhanh hơn 40%' },
  { icon: 'lock', text: 'Escrow đảm bảo bạn nhận tiền an toàn' },
  { icon: 'chat_bubble', text: 'Chat & nhận offer trực tiếp, không qua trung gian' },
]

// Airbnb CTA section: large, photography-feel, navy background
export function SellerCTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%)' }}
      >
        <div className="px-8 lg:px-16 py-14 flex flex-col lg:flex-row items-center gap-12">
          {/* Left — copy */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-6">
              <span
                className="material-symbols-outlined text-green-container text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >sell</span>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">Dành cho Seller</span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ letterSpacing: '-0.44px' }}
            >
              Bán xe đạp của bạn
              <br />
              nhanh hơn, an toàn hơn
            </h2>

            <ul className="flex flex-col gap-3 mb-8">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-green-container text-[0.9rem]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {b.icon}
                    </span>
                  </div>
                  <span className="text-sm text-white/80 font-medium">{b.text}</span>
                </li>
              ))}
            </ul>

            <Link to={ROUTES.SELL}>
              <Button
                size="lg"
                className="bg-white text-navy hover:bg-surface-secondary active:scale-[0.97]"
              >
                <span
                  className="material-symbols-outlined text-[1.1rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >add_circle</span>
                Đăng tin miễn phí ngay
              </Button>
            </Link>
          </div>

          {/* Right — decorative circles like Airbnb */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-6 rounded-full border border-white/10" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white/20"
                  style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 1" }}
                >
                  directions_bike
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
