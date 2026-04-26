import { Outlet, Navigate } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useAuth } from '@/hooks/useAuth'

export function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth()

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-surface-secondary">
        <Outlet />
      </main>
    </div>
  )
}
