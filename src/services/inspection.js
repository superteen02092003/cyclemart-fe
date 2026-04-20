import api from './api'

export const inspectionService = {
  // --- CHO NGƯỜI BÁN (SELLER) ---
  createRequest: async (data) => {
    const response = await api.post('/v1/inspections', data)
    return response.data
  },
  getMyRequests: async (params) => {
    const response = await api.get('/v1/inspections/me', { params })
    return response.data
  },

  // --- CHO ADMIN ---
  getAllAdminRequests: async (params) => {
    const response = await api.get('/v1/inspections/admin/all', { params })
    return response.data
  },
  assignInspector: async (id, inspectorId) => {
    const response = await api.put(`/v1/inspections/admin/${id}/assign`, null, { params: { inspectorId } })
    return response.data
  },
  reschedule: async (id, newTime) => {
    const response = await api.put(`/v1/inspections/admin/${id}/reschedule`, null, { params: { newTime } })
    return response.data
  },

  // --- CHO INSPECTOR ---
  getInspectorTasks: async (params) => {
    const response = await api.get('/v1/inspections/inspector/me', { params })
    return response.data
  },
  updateResult: async (id, status, note) => {
    const response = await api.put(`/v1/inspections/inspector/${id}/result`, null, { params: { status, note } })
    return response.data
  }
}