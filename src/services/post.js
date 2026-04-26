import api from './api'

export const postService = {
  create: async (postData) => {
    try {
      // If postData is already FormData, use it directly
      if (postData instanceof FormData) {
        const response = await api.post('/v1/posts', postData)
        return response.data
      }
      
      // Otherwise, create FormData from object (legacy support)
      const formData = new FormData()
      
      // Required fields
      if (postData.title) formData.append('title', postData.title)
      if (postData.description) formData.append('description', postData.description)
      if (postData.price) formData.append('price', postData.price)
      if (postData.status) formData.append('status', postData.status)
      if (postData.city) formData.append('city', postData.city)
      if (postData.district) formData.append('district', postData.district)
      if (postData.brand) formData.append('brand', postData.brand)
      if (postData.categoryId) formData.append('categoryId', postData.categoryId)
      
      // Optional fields
      if (postData.model) formData.append('model', postData.model)
      if (postData.year) formData.append('year', postData.year)
      if (postData.frameMaterial) formData.append('frameMaterial', postData.frameMaterial)
      if (postData.frameSize) formData.append('frameSize', postData.frameSize)
      if (postData.brakeType) formData.append('brakeType', postData.brakeType)
      if (postData.groupset) formData.append('groupset', postData.groupset)
      if (postData.mileage) formData.append('mileage', postData.mileage)
      
      formData.append('allowNegotiation', postData.allowNegotiation || false)
      
      formData.append('requestInspection', postData.requestInspection || false)
      if (postData.inspectionAddress) formData.append('inspectionAddress', postData.inspectionAddress)
      if (postData.inspectionScheduledDate) formData.append('inspectionScheduledDate', postData.inspectionScheduledDate)
      if (postData.inspectionNote) formData.append('inspectionNote', postData.inspectionNote)
      
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image) => {
          formData.append('images', image)
        })
      }
      
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
      
      // Required fields
      formData.append('title', postData.title)
      formData.append('description', postData.description)
      formData.append('price', postData.price)
      formData.append('status', postData.status)
      formData.append('city', postData.city)
      formData.append('district', postData.district)
      formData.append('brand', postData.brand)
      formData.append('categoryId', postData.categoryId)
      
      // Optional fields - only append if they have values
      if (postData.model) formData.append('model', postData.model)
      if (postData.year) formData.append('year', postData.year)
      if (postData.frameMaterial) formData.append('frameMaterial', postData.frameMaterial)
      if (postData.frameSize) formData.append('frameSize', postData.frameSize)
      if (postData.brakeType) formData.append('brakeType', postData.brakeType)
      if (postData.groupset) formData.append('groupset', postData.groupset)
      if (postData.mileage) formData.append('mileage', postData.mileage)
      
      formData.append('allowNegotiation', postData.allowNegotiation || false)
      
      formData.append('requestInspection', postData.requestInspection || false)
      if (postData.inspectionAddress) formData.append('inspectionAddress', postData.inspectionAddress)
      if (postData.inspectionScheduledDate) formData.append('inspectionScheduledDate', postData.inspectionScheduledDate)
      if (postData.inspectionNote) formData.append('inspectionNote', postData.inspectionNote)
      
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image) => {
          formData.append('images', image)
        })
      }
      
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
  },

  cancelPost: async (id) => {
    try {
      await api.post(`/v1/posts/${id}/cancel`)
      return { message: 'Hủy yêu cầu thành công' }
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi hủy yêu cầu' }
    }
  }
}