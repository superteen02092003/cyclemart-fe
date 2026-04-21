import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Lấy token linh hoạt hơn
api.interceptors.request.use(
  (config) => {
    // 🔥 SỬA Ở ĐÂY: Quét cả 2 trường hợp tên biến mà anh em dev hay dùng
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("🚨 BACKEND TRẢ VỀ 401 LỖI TOKEN TẠI ĐƯỜNG DẪN: ", error.config.url);
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token') // Xóa luôn phòng hờ
      localStorage.removeItem('user')
      
      // 🔥 TẠM THỜI COMMENT ĐOẠN NÀY LẠI ĐỂ KIỂM TRA
      // Nếu có lỗi, trang sẽ đứng yên thay vì chớp tắt, giúp bạn xem lỗi đỏ trong Console
      /*
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
      */
    }
    return Promise.reject(error)
  }
)

export default api