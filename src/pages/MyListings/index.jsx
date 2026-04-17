import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { postService } from '@/services/post'

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

  const handleDeleteListing = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa tin đăng này?')) {
      try {
        setLoading(true)
        console.log('🗑️ Deleting listing:', id)
        await postService.delete(id)
        await loadMyListings()
      } catch (error) {
        console.error('Error deleting listing:', error)
        alert(error.message || 'Lỗi khi xóa tin đăng')
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'NEW': { label: 'Mới 100%', color: 'bg-green-100 text-green-800' },
      'LIKE_NEW': { label: 'Như mới', color: 'bg-blue-100 text-blue-800' },
      'GOOD': { label: 'Tốt', color: 'bg-yellow-100 text-yellow-800' },
      'USED': { label: 'Đã dùng', color: 'bg-orange-100 text-orange-800' },
      'NEED_REPAIR': { label: 'Cần sửa', color: 'bg-red-100 text-red-800' }
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
    </div>
  )
}