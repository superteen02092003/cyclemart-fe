import api from './api'

export const ordersService = {
  getPaymentHistory: async (page = 0, size = 50, sort = 'createdAt', direction = 'desc') => {
    const response = await api.get('/v1/payments/history', { params: { page, size, sort, direction } })
    return response.data
  },

  getPaymentHistoryByStatus: async (status, page = 0, size = 20) => {
    const response = await api.get(`/v1/payments/history/status/${status}`, { params: { page, size } })
    return response.data
  },

  getPaymentById: async (id) => {
    const response = await api.get(`/v1/payments/${id}`)
    return response.data
  },

  // Seller submits delivery evidence
  submitDelivery: async (paymentId, deliveryMethod, deliveryEvidenceUrls, deliveryNote = '') => {
    const response = await api.post(`/v1/payments/${paymentId}/delivery`, {
      deliveryMethod,
      deliveryEvidenceUrls,
      deliveryNote,
    })
    return response.data
  },

  // Buyer confirms order received
  confirmReceived: async (paymentId) => {
    const response = await api.post(`/v1/payments/${paymentId}/confirm-received`)
    return response.data
  },

  // Buyer requests cancellation before delivery
  cancelRequest: async (paymentId, reason = 'Người mua yêu cầu hủy') => {
    const response = await api.post(`/v1/payments/${paymentId}/cancel-request`, null, {
      params: { reason },
    })
    return response.data
  },
}

export const disputeService = {
  openDispute: async (paymentId, reason, evidenceUrls = '') => {
    const response = await api.post('/v1/disputes', { paymentId, reason, evidenceUrls })
    return response.data
  },

  sellerApprove: async (disputeId) => {
    const response = await api.put(`/v1/disputes/${disputeId}/seller-approve`)
    return response.data
  },

  sellerReject: async (disputeId) => {
    const response = await api.put(`/v1/disputes/${disputeId}/seller-reject`)
    return response.data
  },

  getMyDisputesAsBuyer: async (page = 0, size = 20) => {
    const response = await api.get('/v1/disputes/my/buyer', { params: { page, size } })
    return response.data
  },

  getMyDisputesAsSeller: async (page = 0, size = 20) => {
    const response = await api.get('/v1/disputes/my/seller', { params: { page, size } })
    return response.data
  },
}
