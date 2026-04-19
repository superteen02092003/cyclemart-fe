import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
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

 
  const updateUserContext = (updatedFields) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedFields }
      // Lưu đè vào localStorage để khi F5 trang không bị quay lại dữ liệu cũ
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        localStorage.setItem('user', JSON.stringify(newUser))
      }
      return newUser
    })
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserContext, 
  }
}