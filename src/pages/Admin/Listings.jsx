import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { ImageViewerModal } from '@/components/admin/ImageViewerModal'
import { ImageThumbnails } from '@/components/admin/ImageThumbnails'
import { adminService } from '@/services/admin'
import { useAdminStats } from '@/contexts/AdminStatsContext'

export default function AdminListings() {
  const { refreshStats } = useAdminStats()
  
  // State management
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('PENDING')
  
  // Modal states
  const [selectedListing, setSelectedListing] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  
  // Form states
  const [rejectReason, setRejectReason] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Image viewer states
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)

  // Data fetching
  const fetchListings = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllPosts({ 
        page: 0, 
        size: 100, 
        sortBy: 'createdAt', 
        sortDir: 'desc' 
      })
      setListings(data.content || [])
    } catch (error) {
      console.error("Error loading listings:", error)
      alert("Không thể tải dữ liệu từ server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Computed values
  const filteredListings = listings.filter(l => l.postStatus === filterStatus)
  const stats = {
    pending: listings.filter(l => l.postStatus === 'PENDING').length,
    approved: listings.filter(l => l.postStatus === 'APPROVED').length,
    rejected: listings.filter(l => l.postStatus === 'REJECTED').length
  }

  // Event handlers
  const handleViewDetails = (listing) => {
    setSelectedListing(listing)
    setIsDetailModalOpen(true)
  }

  const handleApproveListing = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt bài đăng này?')) return
    
    try {
      await adminService.approvePost(id)
      alert('Duyệt bài thành công!')
      fetchListings()
      refreshStats() // Refresh sidebar and topbar stats
      setIsDetailModalOpen(false)
    } catch (error) {
      alert('Lỗi duyệt bài: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleRejectListing = (listing) => {
    setSelectedListing(listing)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Lý do từ chối không được để trống!')
      return
    }

    try {
      await adminService.rejectPost(selectedListing.id, rejectReason)
      setSuccessMessage(`Bài đăng "${selectedListing.title}" đã được từ chối thành công`)
      setIsSuccessModalOpen(true)
      fetchListings()
      refreshStats() // Refresh sidebar and topbar stats
      setIsRejectModalOpen(false)
      setIsDetailModalOpen(false)
      setRejectReason('')
    } catch (error) {
      alert('Lỗi từ chối bài: ' + (error.response?.data?.message || error.message))
    }
  }

  // Table configuration
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
      render: (value) => value ? `₫${value.toLocaleString('vi-VN')}` : 'Liên hệ'
    },
    {
      key: 'postStatus',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          value === 'PENDING' ? 'bg-warning/20 text-warning' :
          value === 'APPROVED' ? 'bg-success/20 text-success' : 
          'bg-error/20 text-error'
        }`}>
          {value === 'PENDING' ? 'Chờ duyệt' : 
           value === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Ngày gửi', 
      width: '120px',
      render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '' 
    }
  ]

  const getActions = (listing) => {
    const baseActions = [
      <button
        key="view"
        onClick={() => handleViewDetails(listing)}
        className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
      >
        Xem chi tiết
      </button>
    ]

    if (listing.postStatus === 'PENDING') {
      baseActions.push(
        <button
          key="approve"
          onClick={() => handleApproveListing(listing.id)}
          className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-sm transition-colors"
        >
          Duyệt
        </button>,
        <button
          key="reject"
          onClick={() => handleRejectListing(listing)}
          className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
        >
          Từ chối
        </button>
      )
    }

    return baseActions
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Kiểm duyệt tin đăng</h1>
        <p className="text-content-secondary mt-2">Xem xét và duyệt các tin đăng mới</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Chờ duyệt</p>
          <p className="text-3xl font-bold text-warning mt-2">{stats.pending}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Đã duyệt</p>
          <p className="text-3xl font-bold text-success mt-2">{stats.approved}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Từ chối</p>
          <p className="text-3xl font-bold text-error mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-10 text-center">Đang tải dữ liệu...</div>
      ) : (
        <Table
          columns={columns}
          data={filteredListings}
          actions={getActions}
          className="bg-surface"
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tin đăng"
        size="lg"
      >
        {selectedListing && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            {selectedListing.postStatus === 'REJECTED' && selectedListing.rejectionReason && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 text-sm">
                <strong>Lý do từ chối:</strong> {selectedListing.rejectionReason}
              </div>
            )}
            
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Tiêu đề</p>
                  <p className="text-content-primary font-medium mt-1 break-words">{selectedListing.title}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Người bán</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.sellerName} (ID: {selectedListing.userId})</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Danh mục</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.categoryName || selectedListing.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Giá</p>
                  <p className="text-content-primary font-medium mt-1">₫{selectedListing.price?.toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>

            {/* Bike Info */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Thông tin xe</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Thương hiệu', value: selectedListing.brand },
                  { label: 'Model', value: selectedListing.model },
                  { label: 'Năm sản xuất', value: selectedListing.year },
                  { label: 'Tình trạng', value: selectedListing.status },
                  { label: 'Chất liệu khung', value: selectedListing.frameMaterial },
                  { label: 'Size khung', value: selectedListing.frameSize },
                  { label: 'Loại phanh', value: selectedListing.brakeType },
                  { label: 'Groupset', value: selectedListing.groupset }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-content-secondary font-medium uppercase">{label}</p>
                    <p className="text-content-primary font-medium mt-1">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Địa điểm</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Thành phố</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Quận/Huyện</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.district || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Mô tả chi tiết</h3>
              <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-sm border">
                <p className="text-content-primary text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {selectedListing.description || 'Không có mô tả'}
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Hình ảnh</h3>
              <ImageThumbnails 
                images={selectedListing.images || []} 
                onImageClick={(index) => {
                  setImageViewerIndex(index)
                  setShowImageViewer(true)
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Từ chối bài đăng"
        size="md"
      >
        {selectedListing && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-sm p-4">
              <p className="text-sm text-red-800">
                <strong>Bài đăng:</strong> {selectedListing.title}
              </p>
              <p className="text-sm text-red-800 mt-2">
                <strong>Người bán:</strong> {selectedListing.sellerName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-2">
                Lý do từ chối <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối bài đăng này..."
                className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-sm"
                rows="4"
              />
              <p className="text-xs text-content-secondary mt-1">
                Lý do này sẽ được gửi cho người bán
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border-light">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-content-primary border border-border-light rounded-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-error rounded-sm hover:bg-error/90 transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-success text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>
                check_circle
              </span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-content-primary mb-2">Từ chối thành công</h3>
          <p className="text-sm text-content-secondary mb-6">{successMessage}</p>
          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-success rounded-sm hover:bg-success/90 transition-colors"
          >
            Đóng
          </button>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        images={selectedListing?.images || []}
        initialIndex={imageViewerIndex}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </>
  )
}