import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export function LoginRequiredModal({ isOpen, onClose, action = 'mua hàng' }) {
  const location = useLocation()
  
  if (!isOpen) return null

  const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`
  const registerUrl = `${ROUTES.REGISTER}?redirect=${encodeURIComponent(location.pathname + location.search)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-card-hover w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-bold text-content-primary">Yêu cầu đăng nhập</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange/10 flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-orange text-[2rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_circle
            </span>
          </div>
          
          <h4 className="text-lg font-bold text-content-primary mb-2">
            Bạn cần đăng nhập để {action}
          </h4>
          
          <p className="text-sm text-content-secondary mb-6 leading-relaxed">
            Để đảm bảo an toàn và bảo mật cho giao dịch, bạn cần đăng nhập tài khoản trước khi thực hiện {action}.
          </p>

          <div className="flex flex-col gap-3">
            <Link to={loginUrl} className="w-full">
              <Button variant="primary" fullWidth size="lg">
                Đăng nhập ngay
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border-light" />
              <span className="text-xs text-content-tertiary">hoặc</span>
              <div className="flex-1 h-px bg-border-light" />
            </div>
            
            <Link to={registerUrl} className="w-full">
              <Button variant="secondary" fullWidth>
                Tạo tài khoản mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}