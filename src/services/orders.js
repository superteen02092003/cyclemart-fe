import api from './api'

export const ordersService = {
  // Get payment history (orders) for current user
  getPaymentHistory: async (page = 0, size = 20, sort = 'createdAt', direction = 'desc') => {
    try {
      const response = await api.get('/v1/payments/history', {
        params: { page, size, sort, direction }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payment history:', error)
      throw error
    }
  },

  // Get payment history by status
  getPaymentHistoryByStatus: async (status, page = 0, size = 20) => {
    try {
      const response = await api.get(`/v1/payments/history/status/${status}`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payment history by status:', error)
      throw error
    }
  },

  // Get payment detail by ID
  getPaymentById: async (id) => {
    try {
      const response = await api.get(`/v1/payments/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching payment detail:', error)
      throw error
    }
  }
}
