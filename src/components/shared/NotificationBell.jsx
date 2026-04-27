import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import { cn } from '@/utils/cn'
import { notificationService } from '@/services/notification'
import { authService } from '@/services/auth'

const getTimeLabel = (value) => {
  if (!value) return 'Vừa xong'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'Vừa xong'
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} phút trước`
  if (diff < day) return `${Math.floor(diff / hour)} giờ trước`
  return date.toLocaleDateString('vi-VN')
}

const normalizeNotification = (item) => ({
  id: item.id,
  type: item.type || 'SYSTEM',
  title: item.title || 'Thông báo',
  content: item.message || '',
  actionUrl: item.actionUrl || '',
  time: getTimeLabel(item.createdAt),
  read: Boolean(item.isRead),
})

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const menuRef = useRef(null)
  const stompRef = useRef(null)
  const notificationSubscriptionRef = useRef(null)
  const navigate = useNavigate()

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications()
      const normalized = Array.isArray(data) ? data.map(normalizeNotification) : []
      setNotifications(normalized)
    } catch {
      // keep current notifications on transient errors to avoid losing unread badge state
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleOpen = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // ignore, keep current state
    }
  }

  const handleNotificationClick = async (noti) => {
    if (!noti.read) {
      try {
        await notificationService.markAsRead(noti.id)
      } catch {
        // ignore
      }
      setNotifications((prev) => prev.map((item) => (item.id === noti.id ? { ...item, read: true } : item)))
    }
    if (noti.actionUrl) navigate(noti.actionUrl)
  }

  useEffect(() => {
    if (!authService.isAuthenticated()) return undefined
    if (stompRef.current?.active || stompRef.current?.connected) return undefined

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    })

    client.onConnect = () => {
      notificationSubscriptionRef.current?.unsubscribe?.()
      notificationSubscriptionRef.current = client.subscribe('/user/queue/notifications/messages', (frame) => {
        try {
          JSON.parse(frame.body)
          // Always reload from API so unread badge uses real notification rows/ids.
          loadNotifications()
        } catch {
          // ignore malformed realtime notification payload
        }
      })
    }

    client.onWebSocketError = () => {}
    client.onStompError = () => {}

    stompRef.current = client
    client.activate()

    return () => {
      notificationSubscriptionRef.current?.unsubscribe?.()
      notificationSubscriptionRef.current = null
      if (stompRef.current?.active) {
        stompRef.current.deactivate()
      }
      stompRef.current = null
    }
  }, [loadNotifications])

  const getTypeStyles = (type) => {
    if (type === 'CHAT_MESSAGE') return 'bg-navy/20 text-navy'
    if (type === 'PAYMENT') return 'bg-green/20 text-green'
    if (type === 'DELIVERY') return 'bg-orange/20 text-orange'
    return 'bg-surface-tertiary text-content-secondary'
  }

  const getTypeIcon = (type) => {
    if (type === 'CHAT_MESSAGE') return 'chat_bubble'
    if (type === 'PAYMENT') return 'payments'
    if (type === 'DELIVERY') return 'local_shipping'
    return 'info'
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-tertiary transition-colors relative"
      >
        <span className="material-symbols-outlined text-content-primary">notifications</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-sm shadow-card-hover border border-border-light z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex justify-between items-center bg-surface-secondary">
            <h3 className="text-sm font-bold text-content-primary">Thông báo</h3>
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-orange font-semibold hover:underline disabled:opacity-40"
              disabled={unreadCount === 0}
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-content-secondary text-sm">Không có thông báo nào</div>
            ) : (
              notifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => handleNotificationClick(noti)}
                  className={cn('px-4 py-3 border-b border-border-light hover:bg-surface-secondary transition-colors cursor-pointer', !noti.read && 'bg-orange/5')}
                >
                  <div className="flex gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1', getTypeStyles(noti.type))}>
                      <span className="material-symbols-outlined text-[1rem]">{getTypeIcon(noti.type)}</span>
                    </div>
                    <div>
                      <p className={cn('text-sm', !noti.read ? 'font-bold text-content-primary' : 'font-semibold text-content-secondary')}>{noti.title}</p>
                      <p className="text-xs text-content-secondary mt-0.5 line-clamp-2">{noti.content}</p>
                      <p className="text-[10px] text-content-tertiary mt-1.5">{noti.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border-light p-2 text-center">
            <button className="text-xs font-semibold text-content-secondary hover:text-navy transition-colors" onClick={loadNotifications}>
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
