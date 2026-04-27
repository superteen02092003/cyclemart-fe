import api from './api'

export const notificationService = {
  getMyNotifications: async () => {
    try {
      const response = await api.get('/v1/notifications')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không tải được thông báo' }
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/v1/notifications/${id}/read`)
    } catch (error) {
      throw error.response?.data || { message: 'Không thể đánh dấu đã đọc' }
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/v1/notifications/read-all')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không thể đánh dấu đã đọc tất cả' }
    }
  },
}
