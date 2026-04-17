// src/services/priority.js
import api from './api'

export const priorityService = {
  // ==========================================
  // DÀNH CHO ADMIN: Quản lý gói ưu tiên
  // ==========================================
  getAllPackages: async () => {
    const response = await api.get('/v1/priority-packages')
    return response.data
  },
  
  createPackage: async (data) => {
    const response = await api.post('/v1/priority-packages', data)
    return response.data
  },

  updatePackage: async (id, data) => {
    const response = await api.put(`/v1/priority-packages/${id}`, data)
    return response.data
  },

  deletePackage: async (id) => {
    const response = await api.delete(`/v1/priority-packages/${id}`)
    return response.data
  },

  // ==========================================
  // DÀNH CHO SELLER: Đăng ký gói cho bài viết
  // ==========================================
  
  // Seller chỉ được xem các gói đang Active
  getActivePackages: async () => {
    const response = await api.get('/v1/priority-packages/active')
    return response.data
  },

  // Mua/Đăng ký gói cho 1 bài post
  subscribePost: async (postId, packageId) => {
    const response = await api.post('/v1/post-priority-subscriptions', {
      postId: postId,
      packageId: packageId
    })
    return response.data
  },

  // Xem bài post hiện tại đang xài gói nào
  getPostSubscriptions: async (postId) => {
    const response = await api.get(`/v1/post-priority-subscriptions/post/${postId}`)
    return response.data
  },

  // Hủy gói của 1 bài post
  unsubscribeByPostId: async (postId) => {
    const response = await api.delete(`/v1/post-priority-subscriptions/post/${postId}`)
    return response.data
  }
}