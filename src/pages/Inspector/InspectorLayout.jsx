import { Outlet, Navigate } from 'react-router-dom'
import { InspectorSidebar } from '@/components/inspector/InspectorSidebar'
import { useAuth } from '@/hooks/useAuth'

export function InspectorLayout() {
  const { user, isAuthenticated } = useAuth()

  // Bảo vệ route: Phải đăng nhập VÀ phải có role là INSPECTOR
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'INSPECTOR') {
    return <Navigate to="/" replace /> // Đuổi về trang chủ nếu mạo danh
  }

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden text-content-primary font-sans">
      <InspectorSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}