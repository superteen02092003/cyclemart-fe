import { useNavigate } from 'react-router-dom'

export function LoginPromptModal({ title, description, icon, iconColor = 'orange', onClose }) {
  const navigate = useNavigate()

  const handleLoginRedirect = () => {
    navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
  }

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-sm border border-border-light shadow-card p-8 text-center">
        <div className="mb-6">
          <span className={`material-symbols-outlined text-5xl block mb-4`} style={{ color: iconColor }}>
            {icon}
          </span>
          <h2 className="text-xl font-bold text-content-primary mb-2">
            {title}
          </h2>
          <p className="text-sm text-content-secondary">
            {description}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleLoginRedirect}
            className="w-full px-4 py-3 text-white font-semibold rounded-sm hover:opacity-90 transition-colors"
            style={{ backgroundColor: iconColor }}
          >
            Đăng nhập / Đăng ký
          </button>
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-3 border border-border-light text-content-primary font-medium rounded-sm hover:bg-surface-secondary transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
