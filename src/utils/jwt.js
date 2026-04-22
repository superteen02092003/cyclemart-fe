// JWT utility functions
const normalizeVietnameseText = (value) => {
  if (typeof value !== 'string' || !value) return value

  try {
    const hasMojibake = /[ÃÂáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/.test(value)
    if (!hasMojibake) return value

    return decodeURIComponent(escape(value))
  } catch {
    return value
  }
}

export const jwtUtils = {
  // Decode JWT token
  decode: (token) => {
    try {
      if (!token || typeof token !== 'string') return null

      const parts = token.split('.')
      if (parts.length < 2 || !parts[1]) return null

      // JWT payload is base64url, normalize before decoding
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
      const decoded = atob(paddedBase64)

      return JSON.parse(decoded)
    } catch {
      console.error('Error decoding JWT')
      return null
    }
  },

  // Check if token is expired
  isExpired: (token) => {
    try {
      const payload = jwtUtils.decode(token)
      if (!payload || !payload.exp) return true
      
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  },

  // Get user info from token
  getUserFromToken: (token) => {
    try {
      const payload = jwtUtils.decode(token)
      if (!payload) return null
      
      return {
        id: payload.id,
        email: normalizeVietnameseText(payload.sub),
        fullName: normalizeVietnameseText(payload.fullName),
        phone: payload.phone,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat,
      }
    } catch {
      return null
    }
  },

  // Get time until token expires (in seconds)
  getTimeUntilExpiry: (token) => {
    try {
      const payload = jwtUtils.decode(token)
      if (!payload || !payload.exp) return 0
      
      const currentTime = Math.floor(Date.now() / 1000)
      return Math.max(0, payload.exp - currentTime)
    } catch {
      return 0
    }
  }
}