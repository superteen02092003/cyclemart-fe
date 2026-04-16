import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <div className="p-6 bg-white border-b border-border-light">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 w-fit">
          <span
            className="material-symbols-outlined text-orange text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            directions_bike
          </span>
          <span className="text-xl font-bold text-orange">CycleMart</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Outlet />
      </div>
    </div>
  )
}
