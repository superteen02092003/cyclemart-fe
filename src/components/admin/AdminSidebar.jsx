import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAdminStats } from '@/contexts/AdminStatsContext'

export function AdminSidebar() {
  const location = useLocation()
  const { stats } = useAdminStats()

  const menuItems = [
    { label: 'Tổng quan', icon: 'dashboard', href: '/admin', exact: true },
    { label: 'Quản lý người dùng', icon: 'group', href: '/admin/users' },
    { 
      label: 'Kiểm duyệt tin đăng', 
      icon: 'fact_check', 
      href: '/admin/listings',
      badge: stats?.pending
    },
    { 
      label: 'Kiểm định xe', 
      icon: 'verified', 
      href: '/admin/inspections',
      badge: stats?.inspections
    },
    { label: 'Hạng mục kiểm định', icon: 'checklist', href: '/admin/inspection-criteria' },
    { label: 'Báo cáo vi phạm', icon: 'report', href: '/admin/reports' },
    { label: 'Quản lý tranh chấp', icon: 'gavel', href: '/admin/disputes' },
    { label: 'Danh mục & thương hiệu', icon: 'label', href: '/admin/categories' },
    { label: 'Giao dịch & phí dịch vụ', icon: 'payments', href: '/admin/transactions' },
    { label: 'Quản lý dòng tiền', icon: 'account_balance', href: '/admin/finance' },
    { label: 'Thống kê & báo cáo', icon: 'bar_chart', href: '/admin/statistics' },
    { label: 'Gói Ưu Tiên', icon: 'workspace_premium', href: '/admin/priority-packages' },
  ]

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.href
    }
    return location.pathname.startsWith(item.href)
  }

  return (
    <div className="w-64 bg-navy text-white min-h-screen flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-orange text-[1.6rem]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            directions_bike
          </span>
          <span className="text-lg font-bold">CycleMart</span>
        </div>
        <p className="text-xs text-white/60 mt-1">Admin Dashboard</p>
      </div>

      {/* Menu */}
      <nav className="p-4 flex-1">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors',
                isActive(item)
                  ? 'bg-orange text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="material-symbols-outlined text-[1.1rem]">
                {item.icon}
              </span>

              <span className="flex-1">{item.label}</span>

              {/* Badge */}
              {item.badge > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 mt-auto text-xs text-white/60 text-center">
        <p>CycleMart Admin v1.0</p>
        <p className="mt-1">© 2024 All rights reserved</p>
      </div>
    </div>
  )
}