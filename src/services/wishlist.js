import api from './api'

const ACTIVE_POST_STATUSES = new Set(['APPROVED'])

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

  cleanupUnavailableItems: async (items = []) => {
    const safeItems = Array.isArray(items) ? items : []
    const toRemove = safeItems.filter((item) => {
      const status = String(item?.postStatus || item?.status || '').toUpperCase()
      return status && !ACTIVE_POST_STATUSES.has(status)
    })

    if (toRemove.length === 0) {
      return safeItems
    }

    await Promise.allSettled(
      toRemove
        .map((item) => item?.postId)
        .filter(Boolean)
        .map((postId) => wishlistService.removeFromWishlist(postId))
    )

    return safeItems.filter((item) => {
      const status = String(item?.postStatus || item?.status || '').toUpperCase()
      return !status || ACTIVE_POST_STATUSES.has(status)
    })
  },
}
