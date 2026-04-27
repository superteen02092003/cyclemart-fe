// src/services/sellerRating.js
import api from './api'

export const sellerRatingService = {
  /**
   * Lấy thông tin seller (điểm trung bình, số lượng đánh giá)
   */
  getSellerInfo: async (sellerId) => {
    const response = await api.get(`/v1/seller-ratings/seller/${sellerId}/info`)
    return response.data
  },

  /**
   * Lấy tất cả đánh giá của một seller
   */
  getSellerRatings: async (sellerId, page = 0, size = 10) => {
    const response = await api.get(`/v1/seller-ratings/seller/${sellerId}`, {
      params: { page, size }
    })
    return response.data
  },

  /**
   * Tạo hoặc cập nhật đánh giá cho một seller
   */
  createOrUpdateRating: async ({ sellerId, paymentId, score, comment }) => {
    const response = await api.post('/v1/seller-ratings', {
      sellerId,
      paymentId,
      score,
      comment
    })
    return response.data
  },

  /**
   * Lấy đánh giá của buyer hiện tại cho một seller
   */
  getMyRatingForSeller: async (sellerId) => {
    const response = await api.get(`/v1/seller-ratings/seller/${sellerId}/my-rating`)
    return response.data
  },

  /**
   * Xóa một đánh giá
   */
  deleteRating: async (ratingId) => {
    const response = await api.delete(`/v1/seller-ratings/${ratingId}`)
    return response.data
  },

  /**
   * Lấy tất cả đánh giá của buyer hiện tại
   */
  getMySellerRatings: async (page = 0, size = 10) => {
    const response = await api.get('/v1/seller-ratings/my-ratings', {
      params: { page, size }
    })
    return response.data
  }
}
