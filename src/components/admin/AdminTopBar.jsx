import { useAuth } from '@/hooks/useAuth'
import { useAdminStats } from '@/contexts/AdminStatsContext'
import { AdminNotificationBell } from './AdminNotificationBell'

export function AdminTopBar() {
  const { user, logout } = useAuth()
  const { stats } = useAdminStats()

  return (
    <div className="bg-white border-b border-border-light px-6 py-4">
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
              <span className="font-bold text-orange">{stats.loading ? '...' : stats.pending}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[1rem]">
                verified
              </span>
              <span className="text-content-secondary">Kiểm định:</span>
              <span className="font-bold text-blue-600">{stats.loading ? '...' : stats.inspections}</span>
            </div>
          </div>

          {/* Notification Bell */}
          <AdminNotificationBell />

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-border-light">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-content-primary">
                {user?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-content-secondary">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-orange text-white font-bold flex items-center justify-center hover:bg-orange/90 transition-colors">
                {user?.fullName?.charAt(0) || 'A'}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-12 w-48 bg-white border border-border-light rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem]">person</span>
                    Thông tin cá nhân
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-content-primary hover:bg-surface-secondary transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem]">settings</span>
                    Cài đặt
                  </button>
                  <hr className="my-2 border-border-light" />
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[1rem]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}