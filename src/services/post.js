import api from './api'

const CONDITION_TO_BIKE_STATUS = {
  'like-new': 'LIKE_NEW',
  'excellent': 'LIKE_NEW',
  'good': 'GOOD',
  'fair': 'USED',
  'needs-repair': 'NEED_REPAIR',
  'new': 'NEW',
  'LIKE_NEW': 'LIKE_NEW',
  'GOOD': 'GOOD',
  'USED': 'USED',
  'NEED_REPAIR': 'NEED_REPAIR',
  'NEW': 'NEW',
}

function buildPostFormData(postData) {
  const formData = new FormData()

  Object.keys(postData).forEach(key => {
    if (key === 'images') {
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach(image => formData.append('images', image))
      }
    } else if (key === 'condition') {
      const bikeStatus = CONDITION_TO_BIKE_STATUS[postData.condition] || 'USED'
      formData.append('status', bikeStatus)
    } else {
      const val = postData[key]
      if (val !== undefined && val !== null && val !== '') {
        formData.append(key, val)
      }
    }
  })

  return formData
}

export const postService = {
  create: async (postData) => {
    try {
      const response = await api.post('/v1/posts', buildPostFormData(postData))
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo bài đăng' }
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await api.get('/v1/posts', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách bài đăng' }
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
      const response = await api.put(`/v1/posts/${id}`, buildPostFormData(postData))
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
  },
}
