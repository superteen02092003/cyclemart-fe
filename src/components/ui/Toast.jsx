import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const typeClasses = {
    success: 'bg-green text-white border-green/20',
    error: 'bg-error text-white border-error/20',
    warning: 'bg-warning text-white border-warning/20',
    info: 'bg-orange text-white border-orange/20',
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-sm shadow-card-hover border max-w-sm',
          typeClasses[type]
        )}
      >
        <span
          className="material-symbols-outlined text-[1.2rem] flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icons[type]}
        </span>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[1rem]">close</span>
        </button>
      </div>
    </div>
  )
}

// Hook để sử dụng toast
export function useToast() {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
  })

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type,
    })
  }

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false,
    }))
  }

  return {
    toast,
    showToast,
    hideToast,
  }
}