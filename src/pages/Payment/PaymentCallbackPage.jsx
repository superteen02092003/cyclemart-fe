import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '@/services/api'

export default function PaymentCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Dùng useRef để tránh việc useEffect bị gọi 2 lần trong React Strict Mode
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        // Lấy tất cả query parameters từ VNPay trả về trên URL
        const params = Object.fromEntries(searchParams)
        console.log('VNPay callback params:', params)

        // Gọi API VNPay return của Backend
        const response = await api.get('/v1/payments/vnpay/return', { params })
        console.log('VNPay response:', response.data)

        // Kiểm tra mã phản hồi từ VNPay (00 là thành công)
        if (params.vnp_ResponseCode === '00') {
          // Đưa người dùng về trang hóa đơn thành công (Success Page)
          // Trang Success Page sẽ tự nhận diện đây là Mua gói hay Mua xe để hiện hóa đơn
          navigate(`/payment-success?orderId=${params.vnp_TxnRef}`)
        } else {
          // Nếu không thành công, đưa về trang Failure kèm lý do
          navigate(`/payment-failure?reason=Giao dịch đã bị hủy hoặc không thành công (Mã: ${params.vnp_ResponseCode})`)
        }
      } catch (error) {
        console.error('Callback error:', error)
        const errorMsg = error.response?.data?.message || error.message || 'Lỗi xử lý kết quả thanh toán'
        navigate(`/payment-failure?reason=${errorMsg}`)
      }
    }

    if (searchParams.toString()) {
      handleCallback()
    } else {
      navigate('/')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-content-secondary font-medium italic">Đang xác thực giao dịch với hệ thống VNPay...</p>
      </div>
    </div>
  )
}
