import api from './api'

export const bikePostService = {
  getAll: async (params = {}) => {
    const response = await api.get('/v1/posts', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/v1/posts/${id}`)
    return response.data
  },
}
