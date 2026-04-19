import api from './api'

export const adminService = {
  // Đổi từ '/admin/posts' thành '/v1/admin/posts' (Hoặc '/api/v1/admin/posts' nếu api.js chưa có '/api')
  getAllPosts: async (params) => {
    const response = await api.get('/v1/admin/posts', { params })
    return response.data 
  },

  approvePost: async (id) => {
    const response = await api.put(`/v1/admin/posts/${id}/approve`)
    return response.data
  },

  rejectPost: async (id, reason) => {
    const response = await api.put(`/v1/admin/posts/${id}/reject`, null, { 
      params: { reason } 
    })
    return response.data
  }
}