import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  // Nếu chưa đăng nhập - hiển thị nút Login/Register
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link to={ROUTES.LOGIN}>
          <button className="px-4 py-2 text-sm font-semibold text-content-primary hover:bg-surface-tertiary rounded-sm transition-colors">
            Đăng nhập
          </button>
        </Link>
        <Link to={ROUTES.REGISTER}>
          <button 
            className="px-4 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
            style={{ backgroundColor: '#ff6b35' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ff7849'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b35'}
          >
            Đăng ký
          </button>
        </Link>
      </div>
    )
  }

  // Nếu đã đăng nhập - hiển thị user menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-surface-tertiary transition-colors"
      >
        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold"
          style={{ backgroundColor: '#ff6b35' }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        {/* User Email (desktop only) */}
        <span className="text-sm font-medium text-content-primary hidden sm:block max-w-32 truncate">
          {user?.email || 'User'}
        </span>
        
        {/* Dropdown Arrow */}
        <span
          className={cn(
            'material-symbols-outlined text-content-secondary transition-transform text-[1rem]',
            isOpen && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-sm shadow-card-hover border border-border-light py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border-light">
            <p className="text-sm font-semibold text-content-primary truncate">
              {user?.fullName || user?.email}
            </p>
            <p className="text-xs text-content-secondary truncate">
              {user?.email}
            </p>
            {user?.phone && (
              <p className="text-xs text-content-secondary">
                {user.phone}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              ></span>
              <span className="text-xs text-green">
                {user?.statusDisplay || 'Đang hoạt động'}
              </span>
            </div>
            {user?.point !== undefined && (
              <p className="text-xs text-content-tertiary mt-1">
                Điểm: <span className="font-semibold text-orange">{user.point}</span>
              </p>
            )}
          </div>
          
          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">person</span>
              Hồ sơ cá nhân
            </Link>
            
            <Link
              to="/my-listings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">list_alt</span>
              Tin đăng của tôi
            </Link>
            
            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">shopping_bag</span>
              Đơn hàng của tôi
            </Link>
            
            <Link
              to="/favorites"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">favorite</span>
              Yêu thích
            </Link>
            
            <Link
              to="/messages"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">chat_bubble</span>
              Tin nhắn
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.1rem]">settings</span>
              Cài đặt
            </Link>
          </div>
          
          {/* Logout */}
          <div className="border-t border-border-light pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined text-[1.1rem]">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}