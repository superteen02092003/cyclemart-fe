import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  // Lưu ý: Status khớp với Enum của Backend (PENDING, APPROVED, REJECTED)
  const [filterStatus, setFilterStatus] = useState('PENDING')

  // Fetch dữ liệu từ BE
  const fetchListings = async () => {
    try {
      setLoading(true)
      // Lấy danh sách tin (mặc định lấy nhiều để test bộ lọc ở FE)
      const data = await adminService.getAllPosts({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })
      setListings(data.content || [])
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin đăng:", error)
      alert("Không thể tải dữ liệu từ server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Bộ lọc ở Frontend
  const filteredListings = listings.filter((l) => l.postStatus === filterStatus)

  const handleViewDetails = (listing) => {
    setSelectedListing(listing)
    setIsDetailModalOpen(true)
  }

  const handleApproveListing = async (id) => {
    if(window.confirm('Bạn có chắc chắn muốn duyệt bài đăng này?')) {
      try {
        await adminService.approvePost(id)
        alert('Duyệt bài thành công!')
        fetchListings() // Reload danh sách
      } catch (error) {
        alert('Lỗi duyệt bài: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const handleRejectListing = async (id) => {
    const reason = window.prompt('Vui lòng nhập lý do từ chối (bắt buộc):')
    
    if (reason === null) return; // Nhấn Hủy
    if (reason.trim() === '') {
      alert('Lý do không được để trống!')
      return;
    }

    try {
      await adminService.rejectPost(id, reason)
      alert('Đã từ chối bài đăng!')
      fetchListings() // Reload danh sách
    } catch (error) {
      alert('Lỗi từ chối bài: ' + (error.response?.data?.message || error.message))
    }
  }

  const columns = [
    { key: 'title', label: 'Tiêu đề tin đăng', width: '200px' },
    { key: 'sellerName', label: 'Người bán', width: '150px' },
    { 
      key: 'category', 
      label: 'Danh mục', 
      width: '100px',
      render: (_, item) => item.category?.name || 'Không rõ'
    },
    {
      key: 'price',
      label: 'Giá',
      render: (value) => value ? `₫${value.toLocaleString('vi-VN')}` : 'Liên hệ',
    },
    {
      key: 'postStatus',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'PENDING'
              ? 'bg-warning/20 text-warning'
              : value === 'APPROVED'
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error'
          }`}
        >
          {value === 'PENDING' ? 'Chờ duyệt' : value === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
        </span>
      ),
    },
    { 
      key: 'createdAt', 
      label: 'Ngày gửi', 
      width: '120px',
      render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '' 
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Kiểm duyệt tin đăng</h1>
        <p className="text-content-secondary mt-2">Xem xét và duyệt các tin đăng mới</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-content-primary block mb-2">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 bg-white"
          >
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Chờ duyệt</p>
          <p className="text-3xl font-bold text-warning mt-2">{listings.filter((l) => l.postStatus === 'PENDING').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Đã duyệt</p>
          <p className="text-3xl font-bold text-success mt-2">{listings.filter((l) => l.postStatus === 'APPROVED').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Từ chối</p>
          <p className="text-3xl font-bold text-error mt-2">{listings.filter((l) => l.postStatus === 'REJECTED').length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-10 text-center">Đang tải dữ liệu...</div>
      ) : (
        <Table
          columns={columns}
          data={filteredListings}
          actions={(listing) =>
            listing.postStatus === 'PENDING'
              ? [
                  <button
                    key="view"
                    onClick={() => handleViewDetails(listing)}
                    className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
                  >
                    Xem chi tiết
                  </button>,
                  <button
                    key="approve"
                    onClick={() => handleApproveListing(listing.id)}
                    className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-sm transition-colors"
                  >
                    Duyệt
                  </button>,
                  <button
                    key="reject"
                    onClick={() => handleRejectListing(listing.id)}
                    className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
                  >
                    Từ chối
                  </button>,
                ]
              : [
                  <button
                    key="view"
                    onClick={() => handleViewDetails(listing)}
                    className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
                  >
                    Xem chi tiết
                  </button>,
                ]
          }
          className="bg-surface"
        />
      )}

      {/* Listing Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tin đăng"
        size="lg"
      >
        {selectedListing && (
          <div className="space-y-4">
            {selectedListing.postStatus === 'REJECTED' && selectedListing.rejectionReason && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 text-sm">
                <strong>Lý do từ chối:</strong> {selectedListing.rejectionReason}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Tiêu đề</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.title}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người bán (User ID)</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.sellerName || selectedListing.userId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Danh mục</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.category?.name}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Giá</p>
                <p className="text-content-primary font-medium mt-1">₫{selectedListing.price?.toLocaleString('vi-VN')}</p>
              </div>
            </div>
            
            {/* Chi tiết thêm nếu có */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Thương hiệu / Model</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.brand} {selectedListing.model ? `- ${selectedListing.model}` : ''}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Khu vực</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.city} - {selectedListing.district}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-light">
              <p className="text-sm font-medium text-content-primary mb-3">Hình ảnh ({selectedListing.images?.length || 0} ảnh)</p>
              {selectedListing.images && selectedListing.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {selectedListing.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={typeof img === 'string' ? img : img.url} 
                      alt={`Ảnh ${i+1}`} 
                      className="aspect-square object-cover bg-surface-tertiary rounded-sm border border-border-light"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Không có hình ảnh</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}