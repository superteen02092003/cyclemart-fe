import api from './api'

export const postService = {
  // Tạo bài đăng mới
  create: async (postData) => {
    try {
      // Tạo FormData để gửi file và data
      const formData = new FormData()
      
      // Thêm các field text
      formData.append('title', postData.title)
      formData.append('description', postData.description)
      formData.append('price', postData.price)
      formData.append('status', postData.status)
      formData.append('city', postData.city)
      formData.append('district', postData.district)
      formData.append('brand', postData.brand)
      formData.append('model', postData.model)
      formData.append('year', postData.year)
      formData.append('frameMaterial', postData.frameMaterial)
      formData.append('frameSize', postData.frameSize)
      formData.append('brakeType', postData.brakeType)
      formData.append('groupset', postData.groupset)
      formData.append('mileage', postData.mileage)
      formData.append('categoryId', postData.categoryId)
      formData.append('allowNegotiation', postData.allowNegotiation)
      
      // Thêm images nếu có
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image, index) => {
          formData.append('images', image)
        })
      }
      
      const response = await api.post('/v1/posts', formData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo bài đăng' }
    }
  },

  // Lấy tất cả bài đăng
  getAll: async () => {
    try {
      const response = await api.get('/v1/posts')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách bài đăng' }
    }
  },

  // Lấy bài đăng của user hiện tại
  getMyPosts: async () => {
    try {
      const response = await api.get('/v1/posts/my-posts')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải tin đăng của tôi' }
    }
  },

  // Lấy bài đăng theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/v1/posts/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Bài đăng không tồn tại' }
    }
  },

  // Cập nhật bài đăng
  update: async (id, postData) => {
    try {
      const response = await api.put(`/v1/posts/${id}`, postData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật bài đăng' }
    }
  },

  // Xóa bài đăng
  delete: async (id) => {
    try {
      await api.delete(`/v1/posts/${id}`)
      return { message: 'Xóa bài đăng thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa bài đăng' }
    }
  }
}