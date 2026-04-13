import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { label: 'Mua xe', href: ROUTES.BROWSE },
  { label: 'Bán xe', href: ROUTES.SELL },
  { label: 'Kiểm định', href: ROUTES.INSPECTION },
  { label: 'Cộng đồng', href: ROUTES.COMMUNITY },
]

// Airbnb nav: white sticky, centered content, logo left, auth right
export function TopNavBar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo — navy wordmark */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
            <span
              className="material-symbols-outlined text-navy text-[1.6rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              directions_bike
            </span>
            <span className="text-xl font-bold text-navy tracking-tight hidden sm:block">
              CycleMart
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-sm text-sm font-semibold transition-colors duration-150',
                    isActive
                      ? 'text-navy bg-navy-subtle'
                      : 'text-content-primary hover:bg-surface-tertiary'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Đăng nhập</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="sm">Đăng ký</Button>
            </Link>
          </div>

          {/* Mobile hamburger — Airbnb circular style */}
          <button
            className="md:hidden w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center hover:shadow-card-hover transition-shadow"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-content-primary text-[1.2rem]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border-light px-6 py-4 flex flex-col gap-1 shadow-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 rounded-sm text-sm font-semibold text-content-primary hover:bg-surface-tertiary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 mt-2 border-t border-border-light">
            <Link to={ROUTES.LOGIN} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>Đăng nhập</Button>
            </Link>
            <Link to={ROUTES.REGISTER} className="flex-1">
              <Button variant="primary" size="sm" fullWidth>Đăng ký</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
