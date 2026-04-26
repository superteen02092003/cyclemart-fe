import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { AdminStatsProvider } from '@/contexts/AdminStatsContext'

export function AdminLayout() {
  return (
    <AdminStatsProvider>
      <div className="min-h-screen bg-surface-primary">
        <AdminTopBar />
        
        <div className="flex">
          <AdminSidebar />
          
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminStatsProvider>
  )
}
