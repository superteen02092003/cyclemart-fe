import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Vui lòng nhập email'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Email không hợp lệ'
    return nextErrors
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
      await authService.forgotPassword(email.trim())
      showToast('Đã gửi OTP đến email của bạn', 'success')
      navigate(ROUTES.RESET_PASSWORD, { state: { email: email.trim() } })
    } catch (error) {
      const backendMessage = error?.message || error?.errors?.email || 'Gửi OTP thất bại'
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
          Quên mật khẩu
        </h1>
        <p className="text-sm text-content-secondary mb-8">
          Nhập email của bạn để nhận mã OTP.
        </p>

        {errors.submit && <p className="text-xs text-error mb-3">{errors.submit}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${errors.email ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'}`}
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-1" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi OTP...' : 'Gửi OTP'}
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
