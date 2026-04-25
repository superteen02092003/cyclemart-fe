import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showToast, hideToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    // Lấy email và password từ state của RegisterPage
    if (location.state?.email && location.state?.password) {
      setEmail(location.state.email)
      setPassword(location.state.password)
    } else {
      // Nếu không có state, chuyển hướng về register
      navigate(ROUTES.REGISTER)
    }
  }, [location, navigate])

  // Countdown timer cho nút resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (error) setError('')
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số')
      return
    }

    setIsSubmitting(true)
    try {
      // Xác thực OTP
      await authService.verifyOtp({
        email,
        otpCode: otp
      })

      showToast('Xác thực email thành công! Chuyển hướng đến trang đăng nhập...', 'success')

      // Chuyển hướng sang trang LOGIN sau 2 giây
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 2000)
    } catch (error) {
      console.error('OTP verification error:', error)
      const errorMessage = error.message || 'Xác thực OTP thất bại'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await authService.resendOtp(email)
      showToast('Mã OTP mới đã được gửi đến email của bạn', 'success')
      setResendCountdown(60)
      setOtp('')
      setError('')
    } catch (error) {
      console.error('Resend OTP error:', error)
      showToast(error.message || 'Gửi lại OTP thất bại', 'error')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl p-8 shadow-card">
        <h1
          className="text-2xl font-bold text-content-primary mb-1"
          style={{ letterSpacing: '-0.44px' }}
        >
          Xác thực Email
        </h1>
        <p className="text-sm text-content-secondary mb-2">
          Nhập mã OTP được gửi đến
        </p>
        <p className="text-sm font-semibold text-content-primary mb-8">
          {email}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-sm">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength="6"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all text-center tracking-widest font-mono text-lg ${
                error 
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            <p className="text-xs text-content-tertiary mt-2">
              Kiểm tra email của bạn để lấy mã OTP
            </p>
          </div>

          <Button 
            type="submit"
            fullWidth 
            size="lg" 
            className="mt-2"
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xác thực...
              </div>
            ) : (
              'Xác thực'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-content-secondary mb-3">
            Không nhận được mã OTP?
          </p>
          <button
            onClick={handleResendOtp}
            disabled={resendCountdown > 0}
            className={`w-full py-2 px-4 rounded-sm font-semibold text-sm transition-colors ${
              resendCountdown > 0
                ? 'bg-surface-secondary text-content-tertiary cursor-not-allowed'
                : 'bg-surface-secondary text-orange hover:bg-surface-tertiary'
            }`}
          >
            {resendCountdown > 0 
              ? `Gửi lại sau ${resendCountdown}s` 
              : 'Gửi lại mã OTP'
            }
          </button>
        </div>

        <p className="text-center text-xs text-content-tertiary mt-6">
          Bạn có thể quay lại{' '}
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="text-orange font-semibold hover:underline"
          >
            đăng ký
          </button>
        </p>
      </div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
