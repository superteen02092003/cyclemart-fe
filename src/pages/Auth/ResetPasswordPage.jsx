import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showToast, hideToast } = useToast()

  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    const prefilledEmail = location.state?.email || ''
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
  }, [location.state])

  useEffect(() => {
    if (resendCountdown <= 0) return undefined
    const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const validate = () => {
    const nextErrors = {}

    if (!email.trim()) nextErrors.email = 'Vui lòng nhập email'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Email không hợp lệ'

    if (!otpCode.trim()) nextErrors.otpCode = 'Vui lòng nhập mã OTP'
    else if (!/^[0-9]{6}$/.test(otpCode.trim())) nextErrors.otpCode = 'Mã OTP phải là 6 chữ số'

    if (!newPassword.trim()) nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    else if (newPassword.length < 8) nextErrors.newPassword = 'Password phải có ít nhất 8 ký tự'
    else if (!/(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/.test(newPassword)) nextErrors.newPassword = 'Password phải có ít nhất 1 chữ hoa và 1 ký tự đặc biệt'

    if (!confirmPassword.trim()) nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
    else if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Xác nhận mật khẩu không khớp'

    return nextErrors
  }

  const handleResendOtp = async () => {
    const targetEmail = email.trim() || location.state?.email || ''

    if (!targetEmail) {
      setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email để gửi lại OTP' }))
      return
    }
    if (resendCountdown > 0 || isResending) return

    try {
      setIsResending(true)
      setErrors(prev => ({ ...prev, submit: '' }))
      await authService.forgotPassword(targetEmail)
      setEmail(targetEmail)
      setResendCountdown(60)
      showToast('Đã gửi lại mã OTP đến email của bạn', 'success')
    } catch (error) {
      const backendMessage = error?.message || error?.errors?.email || 'Gửi lại OTP thất bại'
      setErrors(prev => ({ ...prev, submit: backendMessage }))
      showToast(backendMessage, 'error')
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setErrors({})
      await authService.resetPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword,
        confirmPassword,
      })
      showToast('Đặt lại mật khẩu thành công', 'success')
      setTimeout(() => navigate(ROUTES.LOGIN), 1200)
    } catch (error) {
      const backendMessage =
        error?.errors?.otpCode ||
        error?.errors?.newPassword ||
        error?.errors?.confirmPassword ||
        error?.errors?.email ||
        error?.message ||
        'Đặt lại mật khẩu thất bại'
      setErrors(prev => ({ ...prev, submit: backendMessage }))
      showToast(backendMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl p-8 shadow-card">
        <h1 className="text-2xl font-bold text-content-primary mb-1" style={{ letterSpacing: '-0.44px' }}>
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-content-secondary mb-8">
          Nhập mã OTP và mật khẩu mới để hoàn tất.
        </p>

        {errors.submit && <p className="text-xs text-error mb-3">{errors.submit}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Email</label>
            <div className="w-full rounded-sm border border-border-light bg-surface-secondary px-4 py-3 text-sm text-content-primary">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-orange">mail</span>
                  <span className="truncate font-medium">{email || 'Chưa có email'}</span>
                </div>
                <span className="text-[11px] font-semibold text-content-tertiary whitespace-nowrap">Đã xác nhận</span>
              </div>
            </div>
            <p className="text-xs text-content-tertiary mt-1">Email này đã được xác nhận để nhận OTP.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Mã OTP</label>
            <input
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${errors.otpCode ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'}`}
            />
            {errors.otpCode && <p className="text-xs text-error mt-1">{errors.otpCode}</p>}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || resendCountdown > 0}
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${resendCountdown > 0 ? 'text-content-tertiary cursor-not-allowed' : 'text-orange hover:underline'}`}
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              {isResending
                ? 'Đang gửi lại...'
                : resendCountdown > 0
                  ? `Gửi lại sau ${resendCountdown}s`
                  : 'Gửi lại mã OTP'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                className={`w-full rounded-sm px-4 py-3 pr-10 text-sm border bg-white text-content-primary outline-none transition-all ${errors.newPassword ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary"
                aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
              >
                <span className="material-symbols-outlined text-[18px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-error mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full rounded-sm px-4 py-3 pr-10 text-sm border bg-white text-content-primary outline-none transition-all ${errors.confirmPassword ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary"
                aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              >
                <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-1" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </Button>

          <button type="button" onClick={() => navigate(ROUTES.LOGIN)} className="text-sm text-orange font-semibold hover:underline">
            Quay lại đăng nhập
          </button>
        </form>
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  )
}
