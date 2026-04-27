import { Client } from '@stomp/stompjs'

class WebSocketService {
  constructor() {
    this.client = null
    this.userId = null
    this.subscriptions = []
  }

  connect(userId) {
    if (this.client?.active) return

    this.userId = userId
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const wsUrl = (import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws').replace('http', 'ws')

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected')
        this.subscribeAll()
      },
      onStompError: (frame) => console.error('❌ STOMP error:', frame),
      onWebSocketClose: () => console.log('WebSocket closed'),
    })

    this.client.activate()
  }

  subscribeAll() {
    this.subscribe(`/user/${this.userId}/queue/orders`, this.handleOrderUpdate)
    this.subscribe(`/user/${this.userId}/queue/disputes`, this.handleDisputeUpdate)
    this.subscribe(`/user/${this.userId}/queue/points`, this.handlePointsUpdate)
    this.subscribe(`/user/${this.userId}/queue/notifications`, this.handleNotification)
  }

  subscribe(destination, callback) {
    if (!this.client?.active) return
    const sub = this.client.subscribe(destination, (message) => {
      callback(JSON.parse(message.body))
    })
    this.subscriptions.push(sub)
  }

  handleOrderUpdate(data) {
    window.dispatchEvent(new CustomEvent('order-update', { detail: data }))
  }

  handleDisputeUpdate(data) {
    window.dispatchEvent(new CustomEvent('dispute-update', { detail: data }))
  }

  handlePointsUpdate(data) {
    window.dispatchEvent(new CustomEvent('points-update', { detail: data }))
  }

  handleNotification(data) {
    window.dispatchEvent(new CustomEvent('notification-update', { detail: data }))
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions = []
    this.client?.deactivate()
  }
}

export default new WebSocketService()
