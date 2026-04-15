// JWT utility functions
export const jwtUtils = {
  // Decode JWT token
  decode: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (error) {
      console.error('Error decoding JWT:', error)
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
    } catch (error) {
      return true
    }
  },

  // Get user info from token
  getUserFromToken: (token) => {
    try {
      const payload = jwtUtils.decode(token)
      if (!payload) return null
      
      return {
        email: payload.sub,
        exp: payload.exp,
        iat: payload.iat,
        // Add more fields as needed based on your JWT payload
      }
    } catch (error) {
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
    } catch (error) {
      return 0
    }
  }
}