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
        const params = Object.fromEntries(searchParams)
        const response = await api.get('/v1/payments/vnpay/return', { params })
        
        const paymentType = response.data?.type // Lấy type từ backend trả về

        if (params.vnp_ResponseCode === '00') {
          
          navigate(`/payment-success?orderId=${params.vnp_TxnRef}&type=${paymentType}`)
        } else {
          navigate(`/payment-failure?reason=Giao dịch thất bại (Mã: ${params.vnp_ResponseCode})`)
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
