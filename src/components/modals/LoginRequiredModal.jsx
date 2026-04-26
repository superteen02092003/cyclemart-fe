import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function LoginRequiredModal({ isOpen, onClose, action = "thực hiện hành động này" }) {
  if (!isOpen) return null

  const currentPath = window.location.pathname
  const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-sm shadow-card-hover w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-base font-bold text-content-primary">Yêu cầu đăng nhập</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="text-center mb-6">
            <span
              className="material-symbols-outlined text-orange mb-3 block"
              style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}
            >
              account_circle
            </span>
            <h4 className="text-lg font-bold text-content-primary mb-2">
              Bạn cần đăng nhập để {action}
            </h4>
            <p className="text-sm text-content-secondary">
              Đăng nhập để trải nghiệm đầy đủ các tính năng của CycleMart
            </p>
          </div>

          <div className="space-y-3">
            <Link to={loginUrl} className="block">
              <Button variant="primary" fullWidth>
                <span className="material-symbols-outlined text-[1rem]">login</span>
                Đăng nhập ngay
              </Button>
            </Link>
            
            <Link to="/register" className="block">
              <Button variant="outline" fullWidth>
                <span className="material-symbols-outlined text-[1rem]">person_add</span>
                Tạo tài khoản mới
              </Button>
            </Link>
          </div>

          <p className="text-xs text-content-tertiary text-center mt-4">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Link to="/terms" className="text-orange hover:underline">
              Điều khoản sử dụng
            </Link>{' '}
            của chúng tôi
          </p>
        </div>
      </div>
    </div>
  )
}