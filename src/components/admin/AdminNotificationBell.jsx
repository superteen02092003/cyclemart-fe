import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin'
import { useAdminStats } from '@/contexts/AdminStatsContext'

export function AdminNotificationBell() {
  const { stats, refreshStats } = useAdminStats()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminNotifications()
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to creating notifications from stats
      const fallbackNotifications = []
      if (stats.pending > 0) {
        fallbackNotifications.push({
          id: 1,
          type: 'POST_PENDING',
          title: 'Tin đăng mới cần duyệt',
          message: `Có ${stats.pending} tin đăng mới đang chờ duyệt`,
          count: stats.pending,
          actionUrl: '/admin/listings?status=PENDING',
          isRead: false,
          createdAt: new Date().toISOString()
        })
      }
      setNotifications(fallbackNotifications)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, stats])

  const handleMarkAsRead = async (id) => {
    try {
      await adminService.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      refreshStats()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      refreshStats()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-content-secondary hover:text-content-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[1.4rem]">
          notifications
        </span>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-white border border-border-light rounded-sm shadow-lg z-50">
            <div className="p-4 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-content-primary">Thông báo</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-content-secondary">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-content-secondary">
                  <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">
                    notifications_none
                  </span>
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border-light hover:bg-gray-50 cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id)
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <span className="material-symbols-outlined text-orange text-[1.2rem]">
                          {notification.type === 'POST_PENDING' ? 'pending_actions' : 'notifications'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-content-primary text-sm">
                          {notification.title}
                        </p>
                        <p className="text-content-secondary text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-content-tertiary text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}