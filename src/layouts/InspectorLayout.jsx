import { Outlet, Navigate } from 'react-router-dom'
import { InspectorSidebar } from '@/components/inspector/InspectorSidebar'
import { useAuth } from '@/hooks/useAuth'

export function InspectorLayout() {
  // 1. 🔥 Lấy thêm biến isLoading ra từ hook
  const { user, isAuthenticated, isLoading } = useAuth()

  // 2. 🔥 CHỐT CHẶN QUAN TRỌNG: Nếu đang load dữ liệu thì hiện màn hình chờ, tuyệt đối không được chuyển trang
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#175d5d]"></div>
          <p className="text-content-secondary text-sm font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // 3. Chờ load xong mới kiểm tra đăng nhập
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