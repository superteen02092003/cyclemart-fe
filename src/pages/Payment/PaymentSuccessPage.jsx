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

  const isPriorityPackage = payment?.type === 'PRIORITY_PACKAGE' || payment?.description?.toLowerCase().includes('ưu tiên')
  const isInspection = payment?.type === 'INSPECTION_FEE' || payment?.description?.toLowerCase().includes('kiểm định')

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-success/20">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success text-5xl mx-auto mb-6 border-2 border-success/30">
          <span className="material-symbols-outlined text-[3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-content-primary text-center mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-sm text-content-secondary text-center mb-8">
          Cảm ơn bạn đã sử dụng dịch vụ của CycleMart.
        </p>

        {/* Payment Details */}
        <div className="bg-surface-secondary rounded-lg p-5 mb-8 space-y-3 border border-border-light">
          <div className="flex justify-between border-b border-border-light pb-3">
            <span className="text-sm text-content-secondary">Mã giao dịch:</span>
            <span className="text-sm font-mono font-bold text-content-primary">
              {payment?.orderId || orderId}
            </span>
          </div>

          {/* 🔥 THÊM DÒNG MÔ TẢ TẠI ĐÂY */}
          <div className="flex justify-between border-b border-border-light pb-3">
            <span className="text-sm text-content-secondary">Nội dung:</span>
            <span className="text-sm font-bold text-content-primary text-right max-w-[60%]">
              {payment?.description || 'Thanh toán dịch vụ'}
            </span>
          </div>
          
          <div className="flex justify-between pt-1">
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
            onClick={() => navigate((isPriorityPackage || isInspection) ? ROUTES.MY_LISTINGS : ROUTES.ORDERS)}
            className="w-full py-3 bg-navy hover:bg-navy/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[1.1rem]">
              {(isPriorityPackage || isInspection) ? 'format_list_bulleted' : 'shopping_bag'}
            </span>
            {(isPriorityPackage || isInspection) ? 'Quản lý bài đăng' : 'Xem đơn hàng của tôi'}
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-white hover:bg-surface-secondary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}