import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { formatPrice } from '@/utils/formatPrice'
import api from '@/services/api'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await api.get(`/v1/payments/history`) 
        const currentPayment = response.data.content.find(p => p.orderId === orderId)
        setPayment(currentPayment)
      } catch (error) {
        console.error('Không thể lấy thông tin hóa đơn:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchPaymentDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  // 🔥 ĐÂY CHÍNH LÀ BIẾN ĐÃ FIX LỖI "isPriorityPackage is not defined"
  // Kết hợp kiểm tra bằng cả Type (Enum mới) hoặc Description (Code cũ) để chắc chắn 100% không bị hụt
  const isPriorityPackage = payment?.type === 'PRIORITY_PACKAGE' || 
                            payment?.description?.includes('MUA_GOI') || 
                            payment?.description?.includes('Gói')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-border-light">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center text-green text-5xl mx-auto mb-6 border-2 border-green/30">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          {isPriorityPackage ? 'Nâng cấp bài đăng thành công!' : 'Thanh toán thành công!'}
        </h1>
        <p className="text-sm text-content-secondary mb-8">
          Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của CycleMart.
        </p>

        {/* Invoice Box */}
        <div className="bg-surface-secondary rounded-lg p-5 mb-8 text-left space-y-4 border border-dashed border-border-medium">
          <div className="flex justify-between items-center pb-3 border-b border-white">
            <span className="text-xs text-content-tertiary uppercase font-bold">Chi tiết hóa đơn</span>
            <span className="text-[0.7rem] bg-green/20 text-green px-2 py-0.5 rounded-full font-bold">ĐÃ THANH TOÁN</span>
          </div>
          
          <div className="flex justify-between gap-4">
            <span className="text-sm text-content-secondary">Nội dung:</span>
            <span className="text-sm font-bold text-navy text-right">
              {payment?.bikePost ? payment.bikePost.title : (payment?.description || 'Thanh toán dịch vụ')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-content-secondary">Mã đơn hàng:</span>
            <span className="text-sm font-mono font-medium">{orderId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-content-secondary">Số tiền:</span>
            <span className="text-sm font-bold text-green">{formatPrice(payment?.amount || 0)}</span>
          </div>

          {payment?.pointsEarned > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-content-secondary">Điểm tích lũy:</span>
              <span className="text-sm font-bold text-orange">+{payment?.pointsEarned} điểm</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(isPriorityPackage ? ROUTES.MY_LISTINGS : ROUTES.ORDERS)}
            className="w-full py-3 bg-navy hover:bg-navy/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[1.1rem]">
              {isPriorityPackage ? 'format_list_bulleted' : 'shopping_bag'}
            </span>
            {isPriorityPackage ? 'Quản lý bài đăng' : 'Xem đơn hàng của tôi'}
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-white hover:bg-surface-secondary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}