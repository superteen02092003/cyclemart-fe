import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/utils/cn'

const ADMIN_MENU = [
  {
    title: 'Tổng quan',
    path: '/admin',
    icon: '📊',
  },
  {
    title: 'Quản lý người dùng',
    path: '/admin/users',
    icon: '👥',
  },
  {
    title: 'Kiểm duyệt tin đăng',
    path: '/admin/listings',
    icon: '📝',
  },
  {
    title: 'Báo cáo & tranh chấp',
    path: '/admin/reports',
    icon: '⚠️',
  },
  {
    title: 'Danh mục & thương hiệu',
    path: '/admin/categories',
    icon: '🏷️',
  },
  {
    title: 'Giao dịch & phí dịch vụ',
    path: '/admin/transactions',
    icon: '💳',
  },
  {
    title: 'Thống kê & báo cáo',
    path: '/admin/statistics',
    icon: '📈',
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col transition-all duration-300 overflow-hidden',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #1e3a5f 100%)' }}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
        {!isCollapsed && (
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🚲</span>
            <span className="font-bold text-sm text-white truncate">CycleMart</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors flex-shrink-0 ml-auto text-white/80"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_MENU.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 whitespace-nowrap',
              location.pathname === item.path
                ? 'bg-green-container text-navy font-semibold shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
            title={isCollapsed ? item.title : ''}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="text-sm">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        {!isCollapsed ? (
          <button className="w-full px-3 py-2 text-sm font-medium text-error hover:bg-white/10 rounded-sm transition-colors">
            Đăng xuất
          </button>
        ) : (
          <button className="w-full px-3 py-2 text-sm text-center hover:bg-white/10 rounded-sm transition-colors text-white/80" title="Đăng xuất">
            🚪
          </button>
        )}
      </div>
    </aside>
  )
}

