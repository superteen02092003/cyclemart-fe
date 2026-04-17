import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import SubscribeModal from '@/components/seller/SubscribeModal'

const STATUS_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'REJECTED', label: 'Bị từ chối' },
]

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', badge: 'subtle' },
  PENDING_REVIEW: { label: 'Chờ duyệt', badge: 'navy' },
  ACTIVE: { label: 'Đang bán', badge: 'verified' },
  SOLD: { label: 'Đã bán', badge: 'subtle' },
  REJECTED: { label: 'Từ chối', badge: 'subtle' },
}

function ListingCard({ listing, onAction }) {
  const cfg = STATUS_CONFIG[listing.status]

  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
      <div className="flex gap-4">
        {/* Thumbnail placeholder */}
        <div className="w-20 h-20 flex-shrink-0 rounded-sm bg-surface-secondary flex items-center justify-center border border-border-light">
          <span
            className="material-symbols-outlined text-content-tertiary"
            style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 0" }}
          >
            directions_bike
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-content-primary leading-snug line-clamp-2">
              {listing.title}
            </h3>
            <Badge variant={cfg.badge} className="flex-shrink-0">
              {cfg.label}
            </Badge>
          </div>

          <p className="text-base font-bold text-content-primary mb-1">{formatPrice(listing.price)}</p>

          <div className="flex items-center gap-3 text-xs text-content-secondary mb-2">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[0.85rem]">visibility</span>
              {listing.views} lượt xem
            </span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[0.85rem]">calendar_today</span>
              {listing.createdAt}
            </span>
          </div>

          {/* Rejected reason */}
          {listing.status === 'REJECTED' && listing.rejectedReason && (
            <div className="flex items-start gap-1.5 bg-error/5 border border-error/20 rounded-sm px-3 py-2 mt-2">
              <span className="material-symbols-outlined text-error text-[0.9rem] mt-0.5">error</span>
              <p className="text-xs text-error">{listing.rejectedReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-light">
        {listing.status === 'DRAFT' && (
          <>
            <Link to={`${ROUTES.SELL}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Chỉnh sửa
              </Button>
            </Link>
            <button
              onClick={() => onAction('submit', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#ff6b35' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
            >
              <span className="material-symbols-outlined text-[0.9rem]">send</span>
              Submit
            </button>
          </>
        )}

        {listing.status === 'PENDING_REVIEW' && (
          <Button variant="secondary" size="sm" disabled>
            <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
            Đang xử lý...
          </Button>
        )}

        {listing.status === 'ACTIVE' && (
          <>
            <Link to={`${ROUTES.SELL}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Chỉnh sửa
              </Button>
            </Link>
            <button
              onClick={() => onAction('hide', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-content-secondary border border-border-light rounded-sm hover:bg-surface-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[0.9rem]">visibility_off</span>
              Ẩn tin
            </button>
            <button
              onClick={() => onAction('boost', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#1e3a5f' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a4f7a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
            >
              <span className="material-symbols-outlined text-[0.9rem]">rocket_launch</span>
              Mua gói ưu tiên
            </button>
          </>
        )}

        {listing.status === 'SOLD' && (
          <Link to={`/bike/${listing.id}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
              Xem
            </Button>
          </Link>
        )}

        {listing.status === 'REJECTED' && (
          <Link to={`${ROUTES.SELL}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">edit</span>
              Chỉnh sửa lại
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function MyListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, active, pending, sold

  useEffect(() => {
    loadMyListings()
  }, [])

  const loadMyListings = async () => {
    try {
      setLoading(true)
      console.log('📋 Loading my listings...')
      // Sử dụng API riêng cho user's posts nếu có, nếu không thì dùng getAll
      const data = await postService.getMyPosts()
      console.log('✅ My listings loaded:', data)
      setListings(data || [])
    } catch (error) {
      console.error('❌ Error loading listings:', error)
      // Fallback to getAll if getMyPosts doesn't exist yet
      try {
        const allPosts = await postService.getAll()
        setListings(allPosts || [])
      } catch (fallbackError) {
        alert(error.message || 'Lỗi khi tải danh sách tin đăng')
      }
    } finally {
      setLoading(false)
    }
  }

  // State cho Modal Đăng ký gói ưu tiên
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleAction = (action, id) => {
    if (action === 'submit') {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'PENDING_REVIEW' } : l))
      )
      showToast('Đã gửi tin để kiểm duyệt!')
    } else if (action === 'hide') {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'DRAFT' } : l))
      )
      showToast('Đã ẩn tin đăng.')
    } else if (action === 'boost') {
      // Mở modal và lưu lại ID của bài đăng đang được chọn
      setSelectedPostId(id)
      setShowSubscribeModal(true)
    }
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="text-content-secondary">Đang tải danh sách tin đăng...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Tin đăng của tôi</h1>
        <p className="text-content-secondary mt-2">Quản lý các tin đăng bán xe của bạn</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-navy text-white' 
                : 'bg-surface border border-border-light text-content-primary hover:bg-surface-secondary'
            }`}
          >
            Tất cả ({listings.length})
          </button>
        </div>
        
        <Link to={ROUTES.SELL}>
          <Button variant="primary">
            <span className="material-symbols-outlined text-[1rem] mr-2">add</span>
            Đăng tin mới
          </Button>
        </Link>
      </div>

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-content-secondary mb-4 block">
            inventory_2
          </span>
          <h3 className="text-xl font-semibold text-content-primary mb-2">Chưa có tin đăng nào</h3>
          <p className="text-content-secondary mb-6">Bắt đầu bán xe đạp của bạn ngay hôm nay</p>
          <Link to={ROUTES.SELL}>
            <Button variant="primary">Đăng tin đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border-light">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Tin đăng</th>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Thông tin xe</th>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Giá</th>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Tình trạng</th>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Ngày đăng</th>
                  <th className="text-left py-3 px-4 font-medium text-content-primary">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, index) => (
                  <tr key={listing.id} className={`border-b border-border-light hover:bg-surface-secondary/50 ${index % 2 === 0 ? 'bg-white' : 'bg-surface-secondary/20'}`}>
                    {/* Tin đăng */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-surface-secondary rounded-sm flex items-center justify-center flex-shrink-0">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-xl text-content-secondary">
                              directions_bike
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-content-primary line-clamp-2 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-content-secondary line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Thông tin xe */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Thương hiệu:</span> {listing.brand}</p>
                        <p><span className="font-medium">Model:</span> {listing.model || 'N/A'}</p>
                        <p><span className="font-medium">Năm:</span> {listing.year || 'N/A'}</p>
                        <p><span className="font-medium">Danh mục:</span> {listing.categoryName}</p>
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-navy text-lg">
                        {formatPrice(listing.price)}
                      </div>
                      {listing.allowNegotiation && (
                        <span className="text-xs text-content-secondary">Có thể thương lượng</span>
                      )}
                    </td>

                    {/* Tình trạng */}
                    <td className="py-4 px-4">
                      {getStatusBadge(listing.status)}
                    </td>

                    {/* Ngày đăng */}
                    <td className="py-4 px-4 text-sm text-content-secondary">
                      {formatDate(listing.createdAt)}
                    </td>

                    {/* Hành động */}
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-content-primary border border-border-light rounded-sm hover:bg-surface-secondary transition-colors">
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteListing(listing.id)}
                          className="px-3 py-1.5 text-xs font-medium text-error border border-error rounded-sm hover:bg-error/10 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal mua gói ưu tiên */}
      {showSubscribeModal && (
        <SubscribeModal 
          postId={selectedPostId} 
          onClose={() => {
            setShowSubscribeModal(false)
            setSelectedPostId(null)
            // (Tuỳ chọn) Bạn có thể gọi fetch lại API danh sách bài đăng ở đây
            // để trạng thái của nút cập nhật nếu mua gói thành công.
          }}
        />
      )}
    </div>
  )
}