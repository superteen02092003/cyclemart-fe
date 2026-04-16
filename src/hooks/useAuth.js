import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Kiểm tra user đã đăng nhập chưa khi component mount
    const currentUser = authService.getCurrentUser()
    const isAuth = authService.isAuthenticated()
    
    setUser(currentUser)
    setIsAuthenticated(isAuth)
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      const data = await authService.login(credentials)
      
      // Lấy user info từ localStorage sau khi login
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
      
      return data
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      const data = await authService.register(userData)
      return data
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  }
}