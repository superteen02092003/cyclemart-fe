import { useState } from 'react'
import { useAuth } from './useAuth'

export function useAuthGuard() {
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState('')

  const requireAuth = (action, callback) => {
    if (!isAuthenticated) {
      setLoginAction(action)
      setShowLoginModal(true)
      return false
    }
    
    if (callback) callback()
    return true
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
    setLoginAction('')
  }

  return {
    isAuthenticated,
    showLoginModal,
    loginAction,
    requireAuth,
    closeLoginModal,
  }
}