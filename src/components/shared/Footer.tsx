import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const FOOTER_LINKS = {
  'Nền tảng': [
    { label: 'Mua xe', href: ROUTES.BROWSE },
    { label: 'Bán xe', href: ROUTES.SELL },
    { label: 'Kiểm định xe', href: ROUTES.INSPECTION },
    { label: 'Cộng đồng', href: ROUTES.COMMUNITY },
  ],
  'Hỗ trợ': [
    { label: 'Hướng dẫn mua xe', href: '#' },
    { label: 'Hướng dẫn đăng tin', href: '#' },
    { label: 'Quy trình kiểm định', href: '#' },
    { label: 'Escrow là gì?', href: '#' },
  ],
  'Về CycleMart': [
    { label: 'Về chúng tôi', href: '#' },
    { label: 'Liên hệ', href: '#' },
    { label: 'Chính sách bảo mật', href: '#' },
    { label: 'Điều khoản sử dụng', href: '#' },
  ],
}

// Airbnb footer: white bg, divider line, warm near-black text
export function Footer() {
  return (
    <footer className="bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-navy text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                directions_bike
              </span>
              <span className="text-lg font-bold text-navy">CycleMart</span>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed mb-5">
              Nền tảng mua bán xe đạp thể thao chuyên biệt đầu tiên tại Việt Nam. An toàn, minh bạch, uy tín.
            </p>
            <div className="flex items-center gap-2">
              {['facebook', 'instagram', 'youtube'].map((p) => (
                <a
                  key={p}
                  href="#"
                  className="w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center hover:shadow-card-hover transition-shadow"
                >
                  <span className="material-symbols-outlined text-content-primary text-[1rem]">
                    {p === 'youtube' ? 'smart_display' : 'group'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold text-content-primary mb-4 uppercase tracking-wider">
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-content-secondary hover:text-content-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-border-light flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-content-tertiary">© 2026 CycleMart. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-sm text-content-secondary">
            <span
              className="material-symbols-outlined text-green text-[1rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >verified_user</span>
            Giao dịch bảo vệ bởi CycleMart Escrow
          </div>
        </div>
      </div>
    </footer>
  )
}
