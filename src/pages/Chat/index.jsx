import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/utils/formatPrice'
import { MOCK_CONVERSATIONS } from '@/constants/mockData'
import { cn } from '@/utils/cn'

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-border-light last:border-0',
        isActive ? 'bg-surface-secondary' : 'hover:bg-surface-secondary/50'
      )}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {conv.otherUserName.charAt(0)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className="text-sm font-semibold text-content-primary truncate">{conv.otherUserName}</p>
          <span className="text-xs text-content-secondary flex-shrink-0">{conv.lastMessageTime}</span>
        </div>
        <p className="text-xs text-content-secondary truncate">{conv.bikeTitle}</p>
        <p className="text-xs text-content-secondary truncate mt-0.5">{conv.lastMessage}</p>
      </div>

      {/* Unread badge */}
      {conv.unreadCount > 0 && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#ff6b35' }}
        >
          {conv.unreadCount}
        </div>
      )}
    </button>
  )
}

function MessageBubble({ msg, isMe }) {
  if (msg.type === 'offer') {
    return (
      <div className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[85%] bg-white border border-border-light rounded-sm shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[1rem]" style={{ color: '#ff6b35' }}>gavel</span>
            <p className="text-xs font-bold text-content-primary uppercase tracking-wide">Đề xuất giá</p>
          </div>
          <p className="text-lg font-black text-content-primary mb-1">{formatPrice(msg.offerPrice)}</p>
          <p className="text-xs text-content-secondary mb-3">{msg.text}</p>
          {!isMe && (
            <div className="flex gap-2">
              <button
                className="flex-1 py-1.5 text-xs font-semibold text-white rounded-sm transition-colors"
                style={{ backgroundColor: '#10b981' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
              >
                Chấp nhận
              </button>
              <button className="flex-1 py-1.5 text-xs font-semibold border border-error text-error rounded-sm hover:bg-error/5 transition-colors">
                Từ chối
              </button>
            </div>
          )}
          <p className="text-xs text-content-secondary mt-2 text-right">{msg.time}</p>
        </div>
      </div>
    )
  }

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

export default function ChatPage() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const messagesEndRef = useRef(null)

  const activeConv = conversations.find((c) => c.id === activeId)

  const filteredConvs = conversations.filter((c) =>
    c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bikeTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages?.length])

  const handleSelectConv = (id) => {
    setActiveId(id)
    setMobileView('chat')
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeId) return

    const newMsg = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastMessageTime: 'Vừa xong' }
          : c
      )
    )
    setInputText('')
  }

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
      <div className="bg-white rounded-none sm:rounded-sm border-0 sm:border border-border-light shadow-none sm:shadow-card overflow-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex flex-1 min-h-0">

          {/* ── Conversation list ──────────────────────────────────────── */}
          <div
            className={cn(
              'w-full sm:w-80 flex-shrink-0 border-r border-border-light flex flex-col',
              mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
            )}
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-border-light">
              <h2 className="text-base font-bold text-content-primary mb-3">Tin nhắn</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-content-secondary text-[1rem]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-surface-secondary transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <span className="material-symbols-outlined text-content-tertiary mb-2" style={{ fontSize: '2.5rem' }}>
                    chat_bubble
                  </span>
                  <p className="text-sm text-content-secondary">Không có cuộc trò chuyện</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    onClick={() => handleSelectConv(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Chat panel ────────────────────────────────────────────── */}
          <div
            className={cn(
              'flex-1 flex flex-col min-w-0',
              mobileView === 'list' ? 'hidden sm:flex' : 'flex'
            )}
          >
            {!activeConv ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <span
                  className="material-symbols-outlined mb-4"
                  style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 0", color: '#d1d5db' }}
                >
                  forum
                </span>
                <h3 className="text-base font-semibold text-content-primary mb-1">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-sm text-content-secondary max-w-xs">
                  Chọn tin nhắn từ danh sách bên trái để xem và trả lời.
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-light bg-white">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[1.2rem]">arrow_back</span>
                  </button>

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#1e3a5f' }}
                  >
                    {activeConv.otherUserName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content-primary">{activeConv.otherUserName}</p>
                    <p className="text-xs text-content-secondary truncate">
                      {activeConv.bikeTitle} · {formatPrice(activeConv.bikePrice)}
                    </p>
                  </div>

                  <Link
                    to={`/bike/${activeConv.bikeId}`}
                    className="hidden sm:flex items-center gap-1 text-xs text-navy hover:underline"
                  >
                    <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
                    Xem xe
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-secondary/30">
                  {activeConv.messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === 'me'} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 px-4 py-3 border-t border-border-light bg-white"
                >
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
    </div>
  )
}
