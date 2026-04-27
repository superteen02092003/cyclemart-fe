import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminStats } from '@/contexts/AdminStatsContext'
import { AdminNotificationBell } from './AdminNotificationBell'
import { useNavigate } from 'react-router-dom'

export function AdminTopBar() {
  const { user, logout } = useAuth()
  const { stats } = useAdminStats()
  const navigate = useNavigate()

  // State quản lý việc đóng/mở dropdown
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Xử lý click ra ngoài để tự động đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setShowMenu(false)
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="bg-white border-b border-border-light px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-content-primary">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange text-[1rem]">
                pending_actions
              </span>
              <span className="text-content-secondary">Chờ duyệt:</span>
              <span className="font-bold text-orange">{stats?.loading ? '...' : stats?.pending || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[1rem]">
                verified
              </span>
              <span className="text-content-secondary">Kiểm định:</span>
              <span className="font-bold text-blue-600">{stats?.loading ? '...' : stats?.inspections || 0}</span>
            </div>
          </div>

          {/* Notification Bell */}
          <AdminNotificationBell />

          {/* User Menu (Bấm để xổ Dropdown) */}
          <div className="relative pl-4 border-l border-border-light" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 focus:outline-none hover:bg-surface-secondary p-1.5 rounded-md transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-content-primary">
                  {user?.fullName || 'Admin CycleMart'}
                </p>
                <p className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wider mt-0.5">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-[#ff6b35] text-white font-bold flex items-center justify-center shadow-md">
                {user?.fullName?.charAt(0) || 'A'}
              </div>

              {/* Mũi tên xổ xuống để báo hiệu có menu */}
              <span className={`material-symbols-outlined text-content-secondary transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border-light rounded-sm shadow-xl z-50 animate-fade-in overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-border-light mb-2 sm:hidden bg-surface-secondary">
                    <p className="text-sm font-bold text-content-primary">{user?.fullName || 'Admin CycleMart'}</p>
                    <p className="text-xs text-content-secondary">{user?.role || 'ADMIN'}</p>
                  </div>
              
                  
                  <hr className="my-2 border-border-light" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-error hover:bg-error/10 transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}