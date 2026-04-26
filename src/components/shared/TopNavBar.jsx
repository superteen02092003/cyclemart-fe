import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { UserMenu } from '@/components/shared/UserMenu'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { LoginRequiredModal } from '@/components/modals'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { label: 'Mua xe', href: ROUTES.BROWSE, requireAuth: false },
  { label: 'Bán xe', href: ROUTES.SELL, requireAuth: true },
  { label: 'Kiểm định', href: ROUTES.INSPECTION, requireAuth: true },
  { label: 'Cộng đồng', href: ROUTES.COMMUNITY, requireAuth: false },
]

// Airbnb nav: white sticky, centered content, logo left, auth right
export function TopNavBar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { requireAuth, showLoginModal, loginAction, closeLoginModal } = useAuthGuard()

  const handleNavClick = (e, link) => {
    if (link.requireAuth) {
      e.preventDefault()
      requireAuth(`truy cập ${link.label}`, () => {
        window.location.href = link.href
      })
    }
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo — orange wordmark */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
            <span
              className="material-symbols-outlined text-orange text-[1.6rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              directions_bike
            </span>
            <span className="text-xl font-bold text-orange tracking-tight hidden sm:block">
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
                  onClick={(e) => handleNavClick(e, link)}
                  className={cn(
                    'px-4 py-2 rounded-sm text-sm font-semibold transition-colors duration-150',
                    isActive
                      ? 'text-orange bg-orange-subtle'
                      : 'text-content-primary hover:bg-surface-tertiary'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>

          {/* Mobile hamburger — chỉ hiện khi có nav links */}
          <button
            className="md:hidden w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center hover:shadow-card-hover transition-shadow ml-2"
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
              onClick={(e) => {
                setMobileOpen(false)
                handleNavClick(e, link)
              }}
              className="px-3 py-3 rounded-sm text-sm font-semibold text-content-primary hover:bg-surface-tertiary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        action={loginAction}
      />
    </header>
  )
}
