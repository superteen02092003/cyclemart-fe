import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function PaymentFailurePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason') || 'Lỗi không xác định'
  const bikeId = searchParams.get('bikeId')

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center text-error text-5xl mx-auto mb-6 border-2 border-error/30">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            cancel
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-content-primary mb-2">Thanh toán thất bại</h1>

        {/* Message */}
        <p className="text-content-secondary mb-6 leading-relaxed">
          Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.
        </p>

        {/* Error Reason */}
        <div className="bg-error/5 border border-error/20 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs text-content-tertiary mb-1">Lý do</p>
          <p className="text-sm text-error font-medium">{reason}</p>
        </div>

        {/* Info Box */}
        <div className="bg-orange/5 border border-orange/20 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-orange flex-shrink-0">warning</span>
            <div>
              <p className="text-xs font-semibold text-content-primary mb-1">Lưu ý</p>
              <p className="text-xs text-content-secondary">Tiền của bạn chưa bị trừ. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {bikeId && (
            <button
              onClick={() => navigate(`/checkout/${bikeId}`)}
              className="w-full py-3 bg-orange hover:bg-orange/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[1.1rem]">refresh</span>
              Thử lại thanh toán
            </button>
          )}

          <button
            onClick={() => navigate(ROUTES.BROWSE)}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Tiếp tục mua sắm
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Quay về trang chủ
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-border-light">
          <p className="text-xs text-content-tertiary mb-2">Cần hỗ trợ?</p>
          <a
            href="mailto:support@cyclemart.com"
            className="text-sm text-blue hover:text-blue/80 font-medium transition-colors"
          >
            Liên hệ với chúng tôi
          </a>
        </div>
      </div>
    </div>
  )
}
