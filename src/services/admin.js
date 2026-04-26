import api from './api'

export const adminService = {
  // === QUẢN LÝ BÀI ĐĂNG ===
  getAllPosts: async () => {
    const response = await api.get('/v1/posts/admin/pending')
    return { content: response.data }
  },
  approvePost: async (id) => {
    const response = await api.post(`/v1/posts/${id}/approve`)
    return response.data
  },
  rejectPost: async (id, reason) => {
    const response = await api.post(`/v1/posts/${id}/reject`, { reason })
    return response.data
  },

  // === QUẢN LÝ NGƯỜI DÙNG ===
  getAllUsers: async (params) => {
    const response = await api.get('/v1/admin/users', { params })
    return response.data
  },
  banUser: async (id, reason) => {
    const response = await api.put(`/v1/admin/users/${id}/ban`, null, { params: { reason } })
    return response.data
  },
  unbanUser: async (id) => {
    const response = await api.put(`/v1/admin/users/${id}/unban`)
    return response.data
  },
  getUserLogs: async (id, params) => {
    const response = await api.get(`/v1/admin/users/${id}/tracking`, { params })
    return response.data
  },

  // === QUẢN LÝ THÔNG BÁO & THỐNG KÊ ===
  getAdminNotifications: async () => {
    const response = await api.get('/v1/admin/notifications')
    return response.data
  },
  getUnreadCount: async () => {
    const response = await api.get('/v1/admin/notifications/unread-count')
    return response.data
  },
  markNotificationAsRead: async (id) => {
    const response = await api.put(`/v1/admin/notifications/${id}/mark-read`)
    return response.data
  },
  markAllNotificationsAsRead: async () => {
    const response = await api.put('/v1/admin/notifications/mark-all-read')
    return response.data
  },

  // === QUẢN LÝ TIÊU CHÍ KIỂM ĐỊNH ===
  getAllCriteria: async () => {
    const response = await api.get('/v1/inspection-criteria')
    return response.data
  },
  createCriterion: async (data) => {
    const response = await api.post('/v1/inspection-criteria', data)
    return response.data
  },
  updateCriterion: async (id, data) => {
    const response = await api.put(`/v1/inspection-criteria/${id}`, data)
    return response.data
  },
  deleteCriterion: async (id) => {
    const response = await api.delete(`/v1/inspection-criteria/${id}`)
    return response.data
  }
}