import api from './api'

export const adminService = {
  // === QUẢN LÝ BÀI ĐĂNG ===
  getAllPosts: async (params) => {
    const response = await api.get('/v1/admin/posts', { params })
    return response.data 
  },
  approvePost: async (id) => {
    const response = await api.put(`/v1/admin/posts/${id}/approve`)
    return response.data
  },
  rejectPost: async (id, reason) => {
    const response = await api.put(`/v1/admin/posts/${id}/reject`, null, { params: { reason } })
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
  }
}