import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/utils/cn'

const ADMIN_MENU = [
  { title: 'Tổng quan', path: '/admin', icon: 'dashboard' },
  { title: 'Quản lý người dùng', path: '/admin/users', icon: 'group' },
  { title: 'Kiểm duyệt tin đăng', path: '/admin/listings', icon: 'fact_check' },
  { title: 'Báo cáo & tranh chấp', path: '/admin/reports', icon: 'report' },
  { title: 'Danh mục & thương hiệu', path: '/admin/categories', icon: 'label' },
  { title: 'Giao dịch & phí dịch vụ', path: '/admin/transactions', icon: 'payments' },
  { title: 'Thống kê & báo cáo', path: '/admin/statistics', icon: 'bar_chart' },
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
            <span
              className="material-symbols-outlined text-green-container text-[1.4rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              directions_bike
            </span>
            <span className="font-bold text-sm text-white truncate">CycleMart</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors flex-shrink-0 ml-auto text-white/70 hover:text-white"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <span className="material-symbols-outlined text-[1.2rem]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_MENU.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-green-container text-navy font-semibold shadow-md'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )}
              title={isCollapsed ? item.title : ''}
            >
              <span
                className="material-symbols-outlined text-[1.2rem] flex-shrink-0"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-sm">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        {!isCollapsed ? (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-error hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[1.2rem] flex-shrink-0">logout</span>
            Đăng xuất
          </button>
        ) : (
          <button
            className="w-full flex items-center justify-center p-2 hover:bg-white/10 rounded-sm transition-colors text-error"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined text-[1.2rem]">logout</span>
          </button>
        )}
      </div>
    </aside>
  )
}
