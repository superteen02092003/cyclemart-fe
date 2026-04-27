import { Outlet } from 'react-router-dom'
import { TopNavBar } from '@/components/shared/TopNavBar'
import { Footer } from '@/components/shared/Footer'
import { useWebSocket } from '@/hooks/useWebSocket'
import { authService } from '@/services/auth'

export function MainLayout() {
  const user = authService.getCurrentUser()
  useWebSocket(user?.id)

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
