import api from './api'

export const wishlistService = {
  getMyWishlist: async (page = 0, size = 20) => {
    const response = await api.get('/v1/wishlist', {
      params: { page, size },
    })
    return response.data
  },

  addToWishlist: async (postId) => {
    const response = await api.post(`/v1/wishlist/${postId}`)
    return response.data
  },

  removeFromWishlist: async (postId) => {
    const response = await api.delete(`/v1/wishlist/${postId}`)
    return response.data
  },

  checkInWishlist: async (postId) => {
    const response = await api.get(`/v1/wishlist/check/${postId}`)
    return response.data
  },
}
