import api from './api'
import { jwtUtils } from '@/utils/jwt'

export const authService = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        password: userData.password,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Đăng ký thất bại' }
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token } = response.data
      
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', token)
      
      // Decode JWT để lấy thông tin user
      const user = jwtUtils.getUserFromToken(token)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Đăng nhập thất bại' }
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return false
    
    // Kiểm tra token có expired chưa
    return !jwtUtils.isExpired(token)
  },

// ==========================================

// ==========================================
  // API Cập nhật thông tin 
  // ==========================================

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      // Cập nhật lại localStorage để giao diện nhận tên mới ngay lập tức
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        const updatedUser = { ...currentUser, ...profileData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // Kích hoạt event để các component khác (như Header) render lại nếu cần
        window.dispatchEvent(new Event('storage')) 
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật thông tin thất bại' }
    }
  },

  // Đổi mật khẩu 

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Đổi mật khẩu thất bại' }
    }
  },

  // Xác thực OTP
  verifyOtp: async (data) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email: data.email,
        otpCode: data.otpCode
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Xác thực OTP thất bại' }
    }
  },

  // Gửi lại OTP
  resendOtp: async (email) => {
    try {
      const response = await api.post('/auth/send-otp', null, {
        params: { email }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Gửi lại OTP thất bại' }
    }
  }

}