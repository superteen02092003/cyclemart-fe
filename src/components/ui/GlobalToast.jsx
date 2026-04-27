import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { toast as toastEmitter } from '@/utils/toast'

const TYPE_CLASSES = {
  success: 'bg-green text-white border-green/20',
  error: 'bg-error text-white border-error/20',
  warning: 'bg-warning text-white border-warning/20',
  info: 'bg-orange text-white border-orange/20',
}

const TYPE_ICONS = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

let nextId = 0

export function GlobalToast() {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    return toastEmitter._subscribe(({ message, type }) => {
      const id = ++nextId
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    })
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-sm shadow-card-hover border animate-in slide-in-from-right-full duration-300',
            TYPE_CLASSES[t.type] ?? TYPE_CLASSES.info
          )}
        >
          <span
            className="material-symbols-outlined text-[1.2rem] flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {TYPE_ICONS[t.type] ?? TYPE_ICONS.info}
          </span>
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[1rem]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
