import api from './api'

export const userService = {
  // Lấy tất cả người dùng
  getAll: async () => {
    try {
      const response = await api.get('/auth/users')
      return response.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error.response?.data || { message: 'Lỗi khi tải danh sách người dùng' }
    }
  },

  // Lấy người dùng theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/auth/users/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Người dùng không tồn tại' }
    }
  },

  // Cập nhật thông tin người dùng
  update: async (id, userData) => {
    try {
      const response = await api.put(`/auth/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật thông tin người dùng' }
    }
  },

  // Xóa người dùng
  delete: async (id) => {
    try {
      await api.delete(`/auth/users/${id}`)
      return { message: 'Xóa người dùng thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa người dùng' }
    }
  }
}