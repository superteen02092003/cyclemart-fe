import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants/routes'
import { verifyOtp, sendOtp } from '@/services/authService'
import { authService } from '@/services/auth'

export default function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const email = location.state?.email || ''
  const password = location.state?.password || ''
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate(ROUTES.REGISTER)
    }
  }, [email, navigate])

  const validateOtp = () => {
    const newErrors = {}

    if (!otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP'
    } else if (!/^[0-9]{6}$/.test(otp)) {
      newErrors.otp = 'Mã OTP phải là 6 chữ số'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateOtp()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await verifyOtp(email, otp)
      
      showToast('Xác nhận email thành công! Đang đăng nhập...', 'success')
      
      // Auto-login sau khi verify OTP thành công
      setTimeout(async () => {
        try {
          await authService.login({ email, password })
          showToast('Đăng nhập thành công!', 'success')
          navigate(ROUTES.HOME)
        } catch (loginError) {
          console.error('Auto-login error:', loginError)
          // Nếu auto-login fail, redirect đến login page
          navigate(ROUTES.LOGIN)
        }
      }, 1500)
    } catch (error) {
      console.error('OTP verification error:', error)
      
      if (error.errors?.otp) {
        setErrors({ otp: error.errors.otp })
        showToast(error.errors.otp, 'error')
      } else if (error.message) {
        setErrors({ otp: error.message })
        showToast(error.message, 'error')
      } else {
        setErrors({ submit: 'Xác nhận OTP thất bại. Vui lòng thử lại.' })
        showToast('Xác nhận OTP thất bại. Vui lòng thử lại.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    try {
      await sendOtp(email)
      
      showToast('Mã OTP mới đã được gửi đến email của bạn', 'success')
      setResendTimer(60) // 60 seconds countdown
      setOtp('')
      setErrors({})
    } catch (error) {
      console.error('Resend OTP error:', error)
      showToast(error.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.', 'error')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl p-8 shadow-card">
        <h1
          className="text-2xl font-bold text-content-primary mb-1"
          style={{ letterSpacing: '-0.44px' }}
        >
          Xác nhận email
        </h1>
        <p className="text-sm text-content-secondary mb-2">
          Kiểm tra email của bạn
        </p>
        <p className="text-sm text-content-tertiary mb-8">
          Chúng tôi đã gửi mã OTP 6 chữ số đến <span className="font-semibold text-content-secondary">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">
              Mã OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                if (errors.otp) {
                  setErrors(prev => ({
                    ...prev,
                    otp: ''
                  }))
                }
              }}
              placeholder="000000"
              maxLength="6"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all text-center tracking-widest font-mono text-lg ${
                errors.otp
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            {errors.otp && <p className="text-xs text-error mt-1">{errors.otp}</p>}
          </div>

          {errors.submit && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-sm">
              <p className="text-sm text-error">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="mt-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xác nhận...
              </div>
            ) : (
              'Xác nhận'
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-content-tertiary">hoặc</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || resendLoading}
            className="w-full py-3 text-sm font-semibold text-orange border border-orange rounded-sm hover:bg-orange/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? (
              `Gửi lại OTP trong ${resendTimer}s`
            ) : resendLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-orange/30 border-t-orange rounded-full animate-spin"></div>
                Đang gửi...
              </div>
            ) : (
              'Gửi lại mã OTP'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-content-secondary mt-6">
          Không nhận được mã?{' '}
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="text-orange font-semibold hover:underline"
          >
            Quay lại đăng ký
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
