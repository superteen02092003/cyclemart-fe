import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function PaymentFailurePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason') || 'Giao dịch không thành công'
  const bikeId = searchParams.get('bikeId')
  
  // Kiểm tra cờ từ localStorage để biết người dùng đang cố gắng mua gì
  const isPriorityAttempt = localStorage.getItem('payment_intent') === 'PRIORITY_PACKAGE'

  const handleRetry = () => {
    localStorage.removeItem('payment_intent')
    if (isPriorityAttempt) {
      navigate(ROUTES.MY_LISTINGS)
    } else if (bikeId) {
      navigate(`/checkout/${bikeId}`)
    } else {
      navigate(ROUTES.HOME)
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-error/20">
        
        {/* Error Icon */}
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center text-error text-5xl mx-auto mb-6 border-2 border-error/30">
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            cancel
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          Thanh toán thất bại
        </h1>

        {/* Message */}
        <p className="text-sm text-content-secondary mb-6 leading-relaxed">
          Rất tiếc, yêu cầu thanh toán của bạn đã bị từ chối hoặc bị hủy bỏ.
        </p>

        {/* Error Details */}
        <div className="bg-error/5 rounded-lg p-4 mb-8 border border-error/10">
          <p className="text-xs font-bold text-error uppercase mb-1">
            Lý do lỗi:
          </p>
          <p className="text-sm text-content-primary italic">
            "{reason}"
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-error hover:bg-error/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-[1.1rem]">
              refresh
            </span>
            Thử lại ngay
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Quay về trang chủ
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-xs text-content-tertiary">
            Bạn gặp khó khăn khi thanh toán? Hãy liên hệ{" "}
            <span className="text-blue font-bold">
              CSKH CycleMart
            </span>{" "}
            để được hỗ trợ 24/7.
          </p>
        </div>

      </div>
    </div>
  )
}