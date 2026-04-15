import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const { toast, showToast, hideToast } = useToast()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Xóa error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await register(formData)
      
      // Hiển thị toast thành công
      showToast('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...', 'success')
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 2000)
    } catch (error) {
      console.error('Register error:', error)
      
      // Hiển thị lỗi từ server
      if (error.message) {
        setErrors({ submit: error.message })
        showToast(error.message, 'error')
      } else {
        setErrors({ submit: 'Đăng ký thất bại. Vui lòng thử lại.' })
        showToast('Đăng ký thất bại. Vui lòng thử lại.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl p-8 shadow-card">
        <h1
          className="text-2xl font-bold text-content-primary mb-1"
          style={{ letterSpacing: '-0.44px' }}
        >
          Tạo tài khoản
        </h1>
        <p className="text-sm text-content-secondary mb-8">Tham gia cộng đồng CycleMart</p>

        {errors.submit && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-sm">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Họ tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${
                errors.fullName 
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${
                errors.email 
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${
                errors.phone 
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-content-primary mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ít nhất 8 ký tự"
              className={`w-full rounded-sm px-4 py-3 text-sm border bg-white text-content-primary outline-none transition-all ${
                errors.password 
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                  : 'border-border focus:border-orange focus:ring-2 focus:ring-orange-subtle'
              }`}
            />
            {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
          </div>

          <Button 
            type="submit"
            fullWidth 
            size="lg" 
            className="mt-1"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang đăng ký...
              </div>
            ) : (
              'Đăng ký'
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-content-tertiary">hoặc</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border rounded-sm py-3 text-sm font-semibold text-content-primary hover:bg-surface-secondary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Tiếp tục với Google
          </button>
        </form>

        <p className="text-center text-sm text-content-secondary mt-6">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="text-orange font-semibold hover:underline">
            Đăng nhập
          </Link>
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
