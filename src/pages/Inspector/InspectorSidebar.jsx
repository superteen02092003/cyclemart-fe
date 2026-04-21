import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'

const INSPECTOR_MENU = [
  { title: 'Tổng quan công việc', path: '/inspector', icon: 'dashboard' },
  { title: 'Lịch hẹn kiểm định', path: '/inspector/tasks', icon: 'assignment_turned_in' },
  { title: 'Biên bản & Báo cáo', path: '/inspector/reports', icon: 'upload_file' },
  { title: 'Hỗ trợ tranh chấp', path: '/inspector/disputes', icon: 'gavel' },
]

export function InspectorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col transition-all duration-300 overflow-hidden',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      // Dùng màu xanh lá mạ / teal đậm để phân biệt với màu Navy của Admin
      style={{ background: 'linear-gradient(180deg, #0f3f3f 0%, #175d5d 100%)' }}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
        {!isCollapsed && (
          <Link to="/inspector" className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#ff6b35] text-[1.4rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
            <span className="font-bold text-sm text-white truncate">Inspector Portal</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors flex-shrink-0 ml-auto text-white/70 hover:text-white"
        >
          <span className="material-symbols-outlined text-[1.2rem]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-xs text-white/60 uppercase font-bold tracking-wider mb-1">Xin chào,</p>
          <p className="text-sm font-bold text-white truncate">{user?.fullName || 'Kiểm duyệt viên'}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
        {INSPECTOR_MENU.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          // Riêng dashboard chỉ active khi khớp hoàn toàn
          const isExact = item.path === '/inspector' ? location.pathname === item.path : isActive

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 whitespace-nowrap',
                isExact
                  ? 'bg-white text-[#175d5d] font-bold shadow-md'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? item.title : ''}
            >
              <span className="material-symbols-outlined text-[1.2rem] flex-shrink-0" style={{ fontVariationSettings: `'FILL' ${isExact ? 1 : 0}` }}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-sm">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center justify-center gap-3 p-2.5 rounded-sm text-sm font-medium text-error hover:bg-white/10 transition-colors",
            !isCollapsed && "px-3"
          )}
          title="Đăng xuất"
        >
          <span className="material-symbols-outlined text-[1.2rem] flex-shrink-0">logout</span>
          {!isCollapsed && "Đăng xuất"}
        </button>
      </div>
    </aside>
  )
}