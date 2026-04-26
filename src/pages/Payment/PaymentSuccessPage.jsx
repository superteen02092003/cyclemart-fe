import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { formatPrice } from '@/utils/formatPrice'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentType = searchParams.get('type')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Gọi API mới để lấy dữ liệu thực tế từ DB
        const res = await api.get(`/v1/payments/order/${orderId}`)
        setPayment(res.data)
      } catch (e) {
        console.error("Lỗi khi lấy chi tiết thanh toán:", e)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchPaymentDetails()
    }
  }, [orderId])

  const isService = paymentType === 'PRIORITY_PACKAGE' || paymentType === 'INSPECTION_FEE'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-primary pt-20 pb-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-sm shadow-card p-8 text-center border border-border-light">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
        </div>

        <h1 className="text-2xl font-bold text-content-primary mb-2">Thanh toán thành công!</h1>
        <p className="text-content-secondary mb-8">
          {isService 
            ? 'Dịch vụ của bạn đã được kích hoạt thành công. Cảm ơn bạn đã sử dụng CycleMart!'
            : 'Đơn hàng của bạn đã được thanh toán và đang chờ người bán xác nhận.'}
        </p>

        <div className="bg-surface-secondary rounded-sm p-5 mb-8 text-left border border-border-light">
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-content-secondary">Mã giao dịch:</span>
            <span className="font-mono font-bold text-navy">{orderId}</span>
          </div>
          
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-content-secondary">Số tiền thanh toán:</span>
            <span className="font-bold text-[#ff6b35]">
              {/* Lấy amount từ object payment đã fetch từ API */}
              {formatPrice(payment?.amount || 0)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-content-secondary">Nội dung:</span>
            <span className="font-medium text-content-primary italic">
              {isService ? 'Thanh toán dịch vụ tin đăng' : 'Thanh toán đơn mua xe'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isService ? (
            <Link 
              to="/my-listings" 
              className="w-full bg-[#1e3a5f] text-white py-3 rounded-sm font-bold hover:bg-opacity-90 transition-all shadow-sm"
            >
              Về quản lý tin đăng
            </Link>
          ) : (
            <Link 
              to="/orders" 
              className="w-full bg-[#1e3a5f] text-white py-3 rounded-sm font-bold hover:bg-opacity-90 transition-all shadow-sm"
            >
              Xem đơn mua của tôi
            </Link>
          )}
          
          <Link to="/" className="text-sm text-content-secondary hover:text-navy transition-colors">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}