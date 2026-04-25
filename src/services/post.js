import api from './api'

export const postService = {
  create: async (postData) => {
    try {
      const formData = new FormData()
      
      // Lặp qua tất cả các trường dữ liệu được truyền vào
      Object.keys(postData).forEach(key => {
        if (key === 'images') {
          // Xử lý riêng mảng hình ảnh
          if (postData.images && postData.images.length > 0) {
            postData.images.forEach((image) => {
              formData.append('images', image)
            })
          }
        } else {
          // QUAN TRỌNG: Chỉ append nếu giá trị khác undefined và null
          // Giúp tránh lỗi chuỗi "undefined" gửi xuống Backend
          if (postData[key] !== undefined && postData[key] !== null && postData[key] !== '') {
            formData.append(key, postData[key])
          }
        }
      })
      
      const response = await api.post('/v1/posts', formData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo bài đăng' }
    }
  },

  getAll: async () => {
    try {
      const response = await api.get('/v1/posts')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách bài đăng' }
    }
  },

  getPostsByUserId: async (userId) => {
    try {
      const response = await api.get(`/v1/posts/user/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải bài đăng của người dùng' }
    }
  },

  getMyPosts: async () => {
    try {
      const response = await api.get('/v1/posts/my-posts')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải tin đăng của tôi' }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/v1/posts/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Bài đăng không tồn tại' }
    }
  },

  update: async (id, postData) => {
    try {
      const formData = new FormData()
      
      // Update cũng cần gửi dạng form-data giống hệt lúc Create
      Object.keys(postData).forEach(key => {
        if (key === 'images') {
          if (postData.images && postData.images.length > 0) {
            postData.images.forEach((image) => {
              formData.append('images', image)
            })
          }
        } else {
          if (postData[key] !== undefined && postData[key] !== null && postData[key] !== '') {
            formData.append(key, postData[key])
          }
        }
      })

      const response = await api.put(`/v1/posts/${id}`, formData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật bài đăng' }
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/v1/posts/${id}`)
      return { message: 'Xóa bài đăng thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa bài đăng' }
    }
  }
}