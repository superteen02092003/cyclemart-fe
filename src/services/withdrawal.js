import api from './api'

export const withdrawalService = {
  createRequest: async (data) => {
    const response = await api.post('/v1/withdrawals', data)
    return response.data
  },

  getMyRequests: async (params = {}) => {
    const response = await api.get('/v1/withdrawals/my', { params })
    return response.data
  },
}
