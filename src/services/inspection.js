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
  // 🔥 SỬA: Đổi tên tham số thành resultNote và thêm checklistData
  updateResult: async (id, status, resultNote, checklistData) => {
    const response = await api.put(`/v1/inspections/inspector/${id}/result`, null, { 
      params: { status, resultNote, checklistData } 
    })
    return response.data
  },

  // 🔥 MỚI: API lấy danh sách tiêu chí động từ Backend
  getActiveCriteria: async () => {
    const response = await api.get('/v1/inspection-criteria/active')
    return response.data
  }
}