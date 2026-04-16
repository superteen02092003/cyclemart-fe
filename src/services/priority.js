// src/services/priority.js
import api from './api'

export const priorityService = {
  // ==========================================
  // DÀNH CHO ADMIN: Quản lý gói ưu tiên
  // ==========================================
  getAllPackages: async () => {
    const response = await api.get('/priority-packages')
    return response.data
  },
  
  createPackage: async (data) => {
    const response = await api.post('/priority-packages', data)
    return response.data
  },

  updatePackage: async (id, data) => {
    const response = await api.put(`/priority-packages/${id}`, data)
    return response.data
  },

  deletePackage: async (id) => {
    const response = await api.delete(`/priority-packages/${id}`)
    return response.data
  },

  // ==========================================
  // DÀNH CHO SELLER: Đăng ký gói cho bài viết
  // ==========================================
  
  // Seller chỉ được xem các gói đang Active
  getActivePackages: async () => {
    const response = await api.get('/priority-packages/active')
    return response.data
  },

  // Mua/Đăng ký gói cho 1 bài post
  subscribePost: async (postId, packageId) => {
    const response = await api.post('/post-priority-subscriptions', {
      postId: postId,
      packageId: packageId
    })
    return response.data
  },

  // Xem bài post hiện tại đang xài gói nào
  getPostSubscriptions: async (postId) => {
    const response = await api.get(`/post-priority-subscriptions/post/${postId}`)
    return response.data
  },

  // Hủy gói của 1 bài post
  unsubscribeByPostId: async (postId) => {
    const response = await api.delete(`/post-priority-subscriptions/post/${postId}`)
    return response.data
  }
}