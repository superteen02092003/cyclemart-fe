// src/services/bikePost.js
import api from './api'

export const bikePostService = {
  createPost: async (postData, images) => {
    // Sử dụng FormData để có thể gửi kèm file ảnh
    const formData = new FormData()
    
    // Gắn các trường text vào với chuyển đổi kiểu dữ liệu đúng
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== '') {
        let value = postData[key]
        
        // Chuyển đổi kiểu dữ liệu cho các trường số
        if (['price', 'year', 'mileage', 'categoryId'].includes(key)) {
          value = String(value)
        }
        
        // Chuyển đổi boolean thành string
        if (typeof value === 'boolean') {
          value = value ? 'true' : 'false'
        }
        
        formData.append(key, value)
      }
    })

    // Gắn các file ảnh vào (nếu có)
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image)
      })
    }

    // Gửi FormData - axios sẽ tự động xử lý Content-Type với boundary
    // Token Authorization sẽ được thêm bởi interceptor
    const response = await api.post('/posts', formData, {
      headers: {
        // Để trống Content-Type để axios tự tính boundary
      }
    })
    
    return response.data
  }
}