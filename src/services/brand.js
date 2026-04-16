import api from './api'

export const brandService = {
  // Lấy tất cả thương hiệu
  getAll: async () => {
    try {
      const response = await api.get('/brands')
      return response.data
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      throw error.response?.data || { message: 'Lỗi khi tải thương hiệu' }
    }
  },

  // Lấy thương hiệu theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/brands/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Thương hiệu không tồn tại' }
    }
  },

  // Tạo thương hiệu mới
  create: async (brandData) => {
    try {
      const response = await api.post('/brands', brandData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo thương hiệu' }
    }
  },

  // Cập nhật thương hiệu
  update: async (id, brandData) => {
    try {
      const response = await api.put(`/brands/${id}`, brandData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật thương hiệu' }
    }
  },

  // Xóa thương hiệu
  delete: async (id) => {
    try {
      await api.delete(`/brands/${id}`)
      return { message: 'Xóa thương hiệu thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa thương hiệu' }
    }
  }
}
