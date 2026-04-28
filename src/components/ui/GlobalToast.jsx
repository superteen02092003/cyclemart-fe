import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { toast as toastEmitter } from '@/utils/toast'

const TYPE_CLASSES = {
  success: 'bg-[#006c49] text-white border-[#006c49]/20',
  error: 'bg-[#c92a12] text-white border-[#c92a12]/20',
  warning: 'bg-[#9a6700] text-white border-[#9a6700]/20',
  info: 'bg-[#0A1628] text-white border-[#0A1628]/20',
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
    <div className="fixed top-20 right-4 z-[9999] flex w-[min(36rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex min-h-[5.75rem] items-center gap-4 rounded-sm border px-6 py-5 shadow-card-hover animate-in slide-in-from-right-full duration-300',
            TYPE_CLASSES[t.type] ?? TYPE_CLASSES.info
          )}
        >
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-[0.95rem] font-black text-current">
            <span
              className="material-symbols-outlined text-[1.05rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {TYPE_ICONS[t.type] ?? TYPE_ICONS.info}
            </span>
          </span>
          <p className="flex-1 text-base font-bold leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[1.2rem]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
