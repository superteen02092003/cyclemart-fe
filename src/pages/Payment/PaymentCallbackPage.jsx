import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '@/services/api'

export default function PaymentCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy tất cả query parameters từ Sepay
        const params = Object.fromEntries(searchParams)
        
        console.log('Payment callback params:', params)

        // Gửi callback data đến backend để verify signature
        const response = await api.post('/v1/payments/sepay/ipn', params)
        
        console.log('IPN response:', response.data)

        // Redirect dựa trên status
        if (params.status === 'COMPLETED' || params.status === 'success') {
          navigate(`/payment-success?orderId=${params.orderCode}`)
        } else {
          navigate(`/payment-failure?reason=${params.message || 'Thanh toán bị hủy'}&bikeId=${params.bikeId}`)
        }
      } catch (error) {
        console.error('Callback error:', error)
        navigate(`/payment-failure?reason=${error.message}`)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-content-secondary font-medium">Đang xử lý thanh toán...</p>
      </div>
    </div>
  )
}
