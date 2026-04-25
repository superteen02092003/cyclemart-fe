import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import PropTypes from 'prop-types'
import { cn } from '@/utils/cn'
import { chatService } from '@/services/chat'
import { authService } from '@/services/auth'

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-border-light last:border-0',
        isActive ? 'bg-surface-secondary' : 'hover:bg-surface-secondary/50'
      )}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {conv.otherUserName?.charAt(0) || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <Link
            to={conv.otherUserProfilePath || '#'}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'text-sm font-semibold truncate transition-all duration-200',
              conv.otherUserProfilePath
                ? 'text-content-primary hover:text-orange hover:underline hover:decoration-orange hover:decoration-2 hover:underline-offset-4'
                : 'text-content-primary pointer-events-none'
            )}
          >
            {conv.otherUserName}
          </Link>
          <span className="text-xs text-content-secondary flex-shrink-0">{conv.lastMessageTime}</span>
        </div>
        <p className="text-xs text-content-secondary truncate">{conv.bikeTitle}</p>
        <p className="text-xs text-content-secondary truncate mt-0.5">{conv.lastMessage}</p>
      </div>

      {conv.unreadCount > 0 ? (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#ff6b35' }}
        >
          {conv.unreadCount}
        </div>
      ) : null}
    </button>
  )
}

ConversationItem.propTypes = {
  conv: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    otherUserName: PropTypes.string,
    otherUserProfilePath: PropTypes.string,
    lastMessageTime: PropTypes.string,
    bikeTitle: PropTypes.string,
    lastMessage: PropTypes.string,
    unreadCount: PropTypes.number,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-sm px-4 py-2.5',
          isMe
            ? 'text-white rounded-br-none'
            : 'bg-white border border-border-light text-content-primary rounded-bl-none shadow-sm'
        )}
        style={isMe ? { backgroundColor: '#1e3a5f' } : {}}
      >
        <p className="text-sm leading-relaxed">{msg.text}</p>
        <p className={cn('text-xs mt-1', isMe ? 'text-white/60 text-right' : 'text-content-secondary text-right')}>
          {msg.time}
        </p>
      </div>
    </div>
  )
}

MessageBubble.propTypes = {
  msg: PropTypes.shape({
    text: PropTypes.string,
    time: PropTypes.string,
    type: PropTypes.string,
    offerPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    senderId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  isMe: PropTypes.bool.isRequired,
}

const getTimeLabel = (value) => {
  if (!value) return 'Vừa xong'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const normalizeMessage = (msg, fallbackText = '') => ({
  id: msg.id ?? msg.messageId ?? `msg-${Date.now()}`,
  senderId: msg.senderId ?? msg.sender_id ?? msg.userId,
  text: msg.content ?? msg.text ?? fallbackText,
  time: getTimeLabel(msg.createdAt ?? msg.created_at ?? msg.sentAt ?? msg.timestamp),
  type: msg.type,
  offerPrice: msg.offerPrice,
})

const normalizeRoom = (room, currentUserId) => {
  const buyerId = room.buyerId
  const sellerId = room.sellerId
  const buyerName = room.buyerName || 'Người mua'
  const sellerName = room.sellerName || 'Người bán'

  const otherUser = currentUserId && String(currentUserId) === String(sellerId)
    ? { id: buyerId, name: buyerName }
    : currentUserId && String(currentUserId) === String(buyerId)
      ? { id: sellerId, name: sellerName }
      : { id: sellerId, name: sellerName }

  return {
    id: room.id,
    bikeId: room.bikePostId,
    bikeTitle: room.bikePostTitle || 'Bài đăng',
    otherUserId: otherUser.id,
    otherUserName: otherUser.name,
    otherUserProfilePath: otherUser.id ? `/profile?userId=${otherUser.id}` : '',
    lastMessage: room.lastMessage || 'Chưa có tin nhắn',
    lastMessageTime: getTimeLabel(room.lastMessageAt || room.updatedAt || room.createdAt),
    unreadCount: 0,
    buyerId: room.buyerId,
    sellerId: room.sellerId,
  }
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileView, setMobileView] = useState('list')
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [connecting, setConnecting] = useState(false)

  const messagesEndRef = useRef(null)
  const stompRef = useRef(null)
  const subscriptionRef = useRef(null)

  const currentUser = authService.getCurrentUser()
  const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub || null
  const isAuthenticated = authService.isAuthenticated()
  const bikePostId = searchParams.get('bikePostId') || location.state?.bikePostId || null
  const routeRoomId = searchParams.get('roomId') || location.state?.roomId || null

  const activeRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(activeRoomId)),
    [rooms, activeRoomId]
  )

  const activeMessages = messagesByRoom[activeRoomId] || []

  const filteredRooms = useMemo(
    () => rooms.filter((room) =>
      room.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.bikeTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [rooms, searchQuery]
  )

  const upsertMessage = useCallback((roomId, rawMessage) => {
    const message = normalizeMessage(rawMessage)
    setMessagesByRoom((prev) => {
      const existing = prev[roomId] || []
      if (existing.some((item) => String(item.id) === String(message.id))) return prev
      return { ...prev, [roomId]: [...existing, message] }
    })

    setRooms((prev) =>
      prev.map((room) =>
        String(room.id) === String(roomId)
          ? { ...room, lastMessage: message.text, lastMessageTime: message.time }
          : room
      )
    )
  }, [])

  const mergeMessageDedup = useCallback((roomId, message, fallbackText) => {
    const normalized = normalizeMessage(message, fallbackText)
    setMessagesByRoom((prev) => {
      const existing = prev[roomId] || []
      if (existing.some((item) => String(item.id) === String(normalized.id) || (item.text === normalized.text && item.senderId === normalized.senderId))) {
        return prev
      }
      return { ...prev, [roomId]: [...existing, normalized] }
    })
  }, [])

  const disconnectSocket = useCallback(() => {
    subscriptionRef.current?.unsubscribe?.()
    subscriptionRef.current = null
    if (stompRef.current?.active) {
      stompRef.current.deactivate()
    }
    stompRef.current = null
    setConnecting(false)
  }, [])

  const connectSocket = useCallback(() => {
    if (!currentUserId || !isAuthenticated || !activeRoomId) return
    if (stompRef.current?.active || stompRef.current?.connected) return

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    })

    client.onConnect = () => {
      subscriptionRef.current?.unsubscribe?.()
      subscriptionRef.current = client.subscribe(`/topic/chats/${activeRoomId}`, (frame) => {
        try {
          const payload = JSON.parse(frame.body)
          upsertMessage(activeRoomId, payload)
        } catch {
          // ignore malformed payload
        }
      })
      setConnecting(false)
    }

    client.onWebSocketError = () => {
      setConnecting(false)
      setError('Không thể kết nối realtime chat')
    }

    client.onStompError = () => {
      setConnecting(false)
      setError('Không thể kết nối realtime chat')
    }

    stompRef.current = client
    setConnecting(true)
    client.activate()
  }, [activeRoomId, currentUserId, isAuthenticated, upsertMessage])

  const loadRooms = useCallback(async () => {
    if (!isAuthenticated) {
      setLoadingRooms(false)
      setRooms([])
      return
    }

    setLoadingRooms(true)
    setError('')
    try {
      const data = await chatService.getMyRooms()
      const normalizedRooms = Array.isArray(data) ? data.map((room) => normalizeRoom(room, currentUserId)) : []
      setRooms(normalizedRooms)

      const initialRoomId = routeRoomId || null
      if (initialRoomId) {
        setActiveRoomId((prev) => (String(prev) === String(initialRoomId) ? prev : initialRoomId))
        setMobileView('chat')
      }
    } catch (err) {
      setError(err?.message || 'Không tải được phòng chat')
      setRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }, [currentUserId, isAuthenticated, routeRoomId])

  const loadMessages = useCallback(async (roomId) => {
    if (!roomId) return
    setLoadingMessages(true)
    try {
      const data = await chatService.getMessages(roomId, { page: 0, size: 100 })
      const content = data?.content || []
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: content.map((message) => normalizeMessage(message)),
      }))
    } catch {
      setMessagesByRoom((prev) => ({ ...prev, [roomId]: [] }))
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  useEffect(() => {
    if (activeRoomId && isAuthenticated) {
      loadMessages(activeRoomId)
    }
  }, [activeRoomId, isAuthenticated, loadMessages])

  useEffect(() => {
    if (!isAuthenticated) return
    if (!activeRoomId) return
    connectSocket()
  }, [activeRoomId, connectSocket, isAuthenticated])

  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [disconnectSocket])

  useEffect(() => {
    if (!activeRoomId) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeRoomId, activeMessages.length])

  useEffect(() => {
    if (stompRef.current?.connected && activeRoomId) {
      subscriptionRef.current?.unsubscribe?.()
      subscriptionRef.current = stompRef.current.subscribe(`/topic/chats/${activeRoomId}`, (frame) => {
        try {
          const payload = JSON.parse(frame.body)
          upsertMessage(activeRoomId, payload)
        } catch {
          // ignore malformed payload
        }
      })
    }
  }, [activeRoomId, upsertMessage])


  useEffect(() => {
    const ensureRoom = async () => {
      if (!bikePostId || routeRoomId || !isAuthenticated) return
      try {
        const room = await chatService.createOrGetRoom(bikePostId)
        const normalized = normalizeRoom(room, currentUserId)
        setRooms((prev) => {
          const exists = prev.some((item) => String(item.id) === String(normalized.id))
          return exists ? prev : [normalized, ...prev]
        })
        setActiveRoomId(normalized.id)
      } catch (err) {
        setError(err?.message || 'Không tạo được phòng chat cho bài đăng')
      }
    }

    ensureRoom()
  }, [bikePostId, currentUserId, isAuthenticated, routeRoomId])

  useEffect(() => {
    if (!routeRoomId) return
    setActiveRoomId((prev) => (String(prev) === String(routeRoomId) ? prev : routeRoomId))
    setMobileView('chat')
  }, [routeRoomId])

  useEffect(() => {
    if (!bikePostId || routeRoomId || activeRoomId || rooms.length === 0) return
    const matched = rooms.find((room) => String(room.bikeId) === String(bikePostId))
    if (matched) {
      setActiveRoomId(matched.id)
      setMobileView('chat')
    }
  }, [activeRoomId, bikePostId, rooms, routeRoomId])

  const handleSelectRoom = (roomId) => {
    setActiveRoomId(roomId)
    setMobileView('chat')
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room)))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeRoomId) return

    const text = inputText.trim()
    const optimistic = {
      id: `local-${Date.now()}`,
      senderId: currentUserId,
      text,
      time: 'Vừa xong',
    }

    upsertMessage(activeRoomId, optimistic)
    setInputText('')

    try {
      const saved = await chatService.sendMessage(activeRoomId, text)
      mergeMessageDedup(activeRoomId, saved, text)

      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify({ roomId: activeRoomId, content: text }),
        })
      }
    } catch (err) {
      setError(err?.message || 'Không gửi được tin nhắn')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
      <div className="bg-white rounded-none sm:rounded-sm border-0 sm:border border-border-light shadow-none sm:shadow-card overflow-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex flex-1 min-h-0">
          <div className={cn('w-full sm:w-80 flex-shrink-0 border-r border-border-light flex flex-col', mobileView === 'chat' ? 'hidden sm:flex' : 'flex')}>
            <div className="px-4 py-4 border-b border-border-light">
              <h2 className="text-base font-bold text-content-primary mb-3">Tin nhắn</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-content-secondary text-[1rem]">search</span>
                <input
                  type="text"
                  placeholder="Tìm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-surface-secondary transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingRooms ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <p className="text-sm text-content-secondary">Đang tải phòng chat...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <span className="material-symbols-outlined text-content-tertiary mb-2" style={{ fontSize: '2.5rem' }}>chat_bubble</span>
                  <p className="text-sm text-content-secondary">Không có cuộc trò chuyện</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <ConversationItem
                    key={room.id}
                    conv={room}
                    isActive={String(room.id) === String(activeRoomId)}
                    onClick={() => handleSelectRoom(room.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className={cn('flex-1 flex flex-col min-w-0', mobileView === 'list' ? 'hidden sm:flex' : 'flex')}>
            {!activeRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <span className="material-symbols-outlined mb-4" style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 0", color: '#d1d5db' }}>forum</span>
                <h3 className="text-base font-semibold text-content-primary mb-1">Chọn một cuộc trò chuyện</h3>
                <p className="text-sm text-content-secondary max-w-xs">Chọn tin nhắn từ danh sách bên trái để xem và trả lời.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-light bg-white">
                  <button onClick={() => setMobileView('list')} className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors">
                    <span className="material-symbols-outlined text-[1.2rem]">arrow_back</span>
                  </button>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#1e3a5f' }}>
                    {activeRoom.otherUserName?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={activeRoom.otherUserProfilePath || '#'}
                      className={cn(
                        'text-sm font-semibold transition-all duration-200 inline-block',
                        activeRoom.otherUserProfilePath
                          ? 'text-content-primary hover:text-orange hover:underline hover:decoration-orange hover:decoration-2 hover:underline-offset-4'
                          : 'text-content-primary pointer-events-none'
                      )}
                    >
                      {activeRoom.otherUserName}
                    </Link>
                    <p className="text-xs text-content-secondary truncate">{activeRoom.bikeTitle}</p>
                  </div>

                  <Link to={`/bike/${activeRoom.bikeId}`} className="hidden sm:flex items-center gap-1 text-xs text-navy hover:underline">
                    <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
                    Xem xe
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-secondary/30">
                  {connecting ? (
                    <div className="text-center py-6 text-sm text-content-secondary">Đang kết nối chat...</div>
                  ) : loadingMessages ? (
                    <div className="text-center py-6 text-sm text-content-secondary">Đang tải tin nhắn...</div>
                  ) : activeMessages.length === 0 ? (
                    <div className="text-center py-6 text-sm text-content-secondary">Chưa có tin nhắn nào</div>
                  ) : (
                    activeMessages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isMe={String(msg.senderId) === String(currentUserId)} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border-light bg-white">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-surface-secondary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-sm text-white disabled:opacity-40 transition-colors flex-shrink-0"
                    style={{ backgroundColor: '#ff6b35' }}
                    onMouseEnter={(e) => {
                      if (inputText.trim()) e.currentTarget.style.backgroundColor = '#ff7849'
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
                  >
                    <span className="material-symbols-outlined text-[1.1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      send
                    </span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      {error ? <div className="mt-3 text-sm text-error">{error}</div> : null}
    </div>
  )
}
