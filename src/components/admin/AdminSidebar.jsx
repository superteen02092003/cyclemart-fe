import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth' // Bổ sung import hook auth

const ADMIN_MENU = [
  { title: 'Tổng quan', path: '/admin', icon: 'dashboard' },
  { title: 'Quản lý người dùng', path: '/admin/users', icon: 'group' },
  { title: 'Kiểm duyệt tin đăng', path: '/admin/listings', icon: 'fact_check' },
  { title: 'Kiểm định xe', path: '/admin/inspections', icon: 'verified' }, 
  // 🔥 THÊM DÒNG NÀY: Mục Quản lý Hạng mục kiểm định
  { title: 'Hạng mục kiểm định', path: '/admin/inspection-criteria', icon: 'checklist' }, 
  { title: 'Báo cáo vi phạm', path: '/admin/reports', icon: 'report' },
  { title: 'Quản lý tranh chấp', path: '/admin/disputes', icon: 'gavel' },
  { title: 'Danh mục & thương hiệu', path: '/admin/categories', icon: 'label' },
  { title: 'Giao dịch & phí dịch vụ', path: '/admin/transactions', icon: 'payments' },
  { title: 'Thống kê & báo cáo', path: '/admin/statistics', icon: 'bar_chart' },
  { title: 'Gói Ưu Tiên', path: '/admin/priority-packages', icon: 'workspace_premium' },
]

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate() // Khởi tạo điều hướng
  const { logout } = useAuth() // Lấy hàm logout từ Context/Hook
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Hàm xử lý khi bấm đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
      logout() // Xóa token & thông tin user ở LocalStorage
      navigate('/login') // Đẩy về trang đăng nhập
    }
  }

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
          <button 
            onClick={handleLogout} // GẮN SỰ KIỆN Ở ĐÂY
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-error hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[1.2rem] flex-shrink-0">logout</span>
            Đăng xuất
          </button>
        ) : (
          <button
            onClick={handleLogout} 
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