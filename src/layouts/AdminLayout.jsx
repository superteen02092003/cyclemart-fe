import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-surface-secondary">
        <Outlet />
      </main>
    </div>
  )
}
