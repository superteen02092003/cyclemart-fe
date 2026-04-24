import api from './api'

export const chatService = {
  createOrGetRoom: async (bikePostId) => {
    try {
      const response = await api.post('/v1/chats/rooms', { bikePostId })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không tạo được phòng chat' }
    }
  },

  getMyRooms: async () => {
    try {
      const response = await api.get('/v1/chats/rooms')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không tải được phòng chat' }
    }
  },

  getMessages: async (roomId, params = { page: 0, size: 20 }) => {
    try {
      const response = await api.get(`/v1/chats/rooms/${roomId}/messages`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không tải được tin nhắn' }
    }
  },

  sendMessage: async (roomId, content) => {
    try {
      const response = await api.post('/v1/chats/messages', { roomId, content })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Không gửi được tin nhắn' }
    }
  },
}
