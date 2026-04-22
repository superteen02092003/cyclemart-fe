import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // Auto redirect sau 5 giây
    const timer = setTimeout(() => {
      navigate(ROUTES.ORDERS)
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center text-green text-5xl mx-auto mb-6 border-2 border-green/30">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-content-primary mb-2">Thanh toán thành công!</h1>

        {/* Message */}
        <p className="text-content-secondary mb-6 leading-relaxed">
          Đơn hàng của bạn đã được xác nhận. Tiền đang được giữ an toàn tại hệ thống Escrow. Người bán sẽ tiến hành giao hàng cho bạn sớm nhất.
        </p>

        {/* Order ID */}
        {orderId && (
          <div className="bg-surface-secondary rounded-lg p-4 mb-6 border border-border-light">
            <p className="text-xs text-content-tertiary mb-1">Mã đơn hàng</p>
            <p className="text-sm font-mono font-bold text-content-primary break-all">{orderId}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue/5 border border-blue/20 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3 mb-3">
            <span className="material-symbols-outlined text-blue flex-shrink-0">info</span>
            <div>
              <p className="text-xs font-semibold text-content-primary mb-1">Tiếp theo</p>
              <p className="text-xs text-content-secondary">Bạn sẽ nhận được email xác nhận. Vui lòng kiểm tra email để cập nhật tình trạng đơn hàng.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="w-full py-3 bg-green hover:bg-green/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[1.1rem]">shopping_bag</span>
            Xem đơn hàng của tôi
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Quay về trang chủ
          </button>
        </div>

        {/* Auto redirect message */}
        <p className="text-xs text-content-tertiary mt-6">
          Tự động chuyển hướng sau 5 giây...
        </p>
      </div>
    </div>
  )
}
