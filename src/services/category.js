import api from './api'

export const categoryService = {
  // Lấy tất cả danh mục
  getAll: async () => {
    try {
      const response = await api.get('/v1/categories')
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error.response?.data || { message: 'Lỗi khi tải danh mục' }
    }
  },

  // Lấy tất cả danh mục con (chỉ dùng cho trang Sell)
  getAllChildren: async () => {
    try {
      const response = await api.get('/v1/categories/all-children')
      return response.data
    } catch (error) {
      console.error('Failed to fetch child categories:', error)
      throw error.response?.data || { message: 'Lỗi khi tải danh mục con' }
    }
  },

  // Lấy danh mục theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/v1/categories/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Danh mục không tồn tại' }
    }
  },

  // Tạo danh mục mới
  create: async (categoryData) => {
    try {
      const response = await api.post('/v1/categories', categoryData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo danh mục' }
    }
  },

  // Cập nhật danh mục
  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/v1/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật danh mục' }
    }
  },

  // Xóa danh mục
  delete: async (id) => {
    try {
      await api.delete(`/v1/categories/${id}`)
      return { message: 'Xóa danh mục thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa danh mục' }
    }
  }
}
