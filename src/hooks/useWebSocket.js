import { useEffect } from 'react'
import websocketService from '../services/websocket'

export function useWebSocket(userId) {
  useEffect(() => {
    if (!userId) return

    websocketService.connect(userId)

    return () => websocketService.disconnect()
  }, [userId])
}

export function useOrderUpdates(callback) {
  useEffect(() => {
    const handler = (e) => callback(e.detail)
    window.addEventListener('order-update', handler)
    return () => window.removeEventListener('order-update', handler)
  }, [callback])
}

export function useDisputeUpdates(callback) {
  useEffect(() => {
    const handler = (e) => callback(e.detail)
    window.addEventListener('dispute-update', handler)
    return () => window.removeEventListener('dispute-update', handler)
  }, [callback])
}

export function usePointsUpdates(callback) {
  useEffect(() => {
    const handler = (e) => callback(e.detail)
    window.addEventListener('points-update', handler)
    return () => window.removeEventListener('points-update', handler)
  }, [callback])
}

export function useNotificationUpdates(callback) {
  useEffect(() => {
    const handler = (e) => callback(e.detail)
    window.addEventListener('notification-update', handler)
    return () => window.removeEventListener('notification-update', handler)
  }, [callback])
}
