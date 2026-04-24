import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [fieldComments, setFieldComments] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  
  const [filterStatus, setFilterStatus] = useState('PENDING')

  const fetchListings = async () => {
    try {
      setLoading(true)
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

  const filteredListings = listings.filter((l) => l.postStatus === filterStatus)

  const handleViewDetails = (listing) => {
    setSelectedListing(listing)
    setIsDetailModalOpen(true)
  }

  const handleApproveListing = async (id) => {
    if(window.confirm('Bạn có chắc chắn muốn duyệt bài đăng này?')) {
      try {
        await adminService.approvePost(id)
        alert('Duyệt bài thành công! Hệ thống đã tạo yêu cầu kiểm định (nếu có).')
        fetchListings() // Reload danh sách
        setIsDetailModalOpen(false)
      } catch (error) {
        alert('Lỗi duyệt bài: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const handleRejectListing = async (id) => {
    const listing = listings.find(l => l.id === id)
    setSelectedListing(listing)
    setRejectReason('')
    setFieldComments({})
    setIsRejectModalOpen(true)
  }

  const handleFieldCommentChange = (fieldName, value) => {
    setFieldComments(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleConfirmReject = async () => {
    if (rejectReason.trim() === '') {
      alert('Lý do từ chối không được để trống!')
      return
    }

    try {
      await adminService.rejectPost(selectedListing.id, rejectReason)
      setSuccessMessage(`Bài đăng "${selectedListing.title}" đã được từ chối thành công`)
      setIsSuccessModalOpen(true)
      fetchListings()
      setIsRejectModalOpen(false)
      setIsDetailModalOpen(false)
      setRejectReason('')
      setFieldComments({})
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
    // 🔥 CỘT YÊU CẦU KIỂM ĐỊNH ĐÃ ĐƯỢC SỬA LẠI KEY BẮT DỮ LIỆU
    {
    key: 'isRequestedInspection', 
    label: 'Kiểm định',
    width: '100px',
    render: (value, item) => {
      // Bắt cả 2 trường hợp key (isRequestedInspection hoặc requestedInspection)
      const hasInspection = value === true || item.requestedInspection === true;
      
      return hasInspection ? (
        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-sm border border-orange-200">
          <span className="material-symbols-outlined text-[1rem]" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
          CÓ 
        </span>
      ) : <span className="text-gray-400 font-medium">-</span>
    }
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

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tin đăng"
        size="lg"
      >
        {selectedListing && (
          <div className="space-y-6">
            
            {/* 🔥 HIỂN THỊ CẢNH BÁO CHO ADMIN TRONG MODAL */}
            {(selectedListing.requestedInspection || selectedListing.isRequestedInspection) && selectedListing.postStatus === 'PENDING' && (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-sm border border-orange-200 text-sm flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-600 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
                <div>
                  <p className="font-bold mb-1">Tin đăng có kèm Yêu cầu Kiểm định</p>
                  <p>Khi bạn nhấn <strong>Duyệt</strong>, hệ thống sẽ tự động tạo một phiên kiểm định mới cho nhân viên. Hãy kiểm tra kỹ thông tin xe trước khi duyệt.</p>
                </div>
              </div>
            )}

            {selectedListing.postStatus === 'REJECTED' && selectedListing.rejectionReason && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 text-sm">
                <strong>Lý do từ chối:</strong> {selectedListing.rejectionReason}
              </div>
            )}
            
            {/* THÔNG TIN CƠ BẢN */}
            <div>
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Tiêu đề</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.title}</p>
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

            {/* THÔNG TIN XE */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Thông tin xe</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Thương hiệu</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Model</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Năm sản xuất</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Tình trạng</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Chất liệu khung</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.frameMaterial || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Size khung</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.frameSize || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Loại phanh</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.brakeType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-content-secondary font-medium uppercase">Groupset</p>
                  <p className="text-content-primary font-medium mt-1">{selectedListing.groupset || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* THÔNG TIN ĐỊA ĐIỂM */}
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

            {/* MÔ TẢ */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Mô tả chi tiết</h3>
              <p className="text-content-primary text-sm leading-relaxed whitespace-pre-wrap">{selectedListing.description || 'Không có mô tả'}</p>
            </div>

            {/* HÌNH ẢNH */}
            <div className="border-t border-border-light pt-4">
              <h3 className="text-sm font-bold text-content-primary uppercase mb-3">Hình ảnh</h3>
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
                <div className="bg-gray-50 border border-border-light rounded-sm p-6 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-4xl block mb-2">image_not_supported</span>
                  <p className="text-gray-500 font-medium">User không gửi ảnh</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL TỪ CHỐI */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Từ chối bài đăng"
        size="lg"
      >
        {selectedListing && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-red-50 border border-red-200 rounded-sm p-4">
              <p className="text-sm text-red-800">
                <strong>Bài đăng:</strong> {selectedListing.title}
              </p>
              <p className="text-sm text-red-800 mt-2">
                <strong>Người bán:</strong> {selectedListing.sellerName}
              </p>
            </div>

            {/* COMMENT FIELDS */}
            <div className="border border-border-light rounded-sm p-4 bg-gray-50">
              <p className="text-sm font-bold text-content-primary mb-3">Ghi chú chi tiết từng field</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Tiêu đề</label>
                  <p className="text-sm text-content-primary font-medium mb-2">{selectedListing.title}</p>
                  <textarea
                    value={fieldComments.title || ''}
                    onChange={(e) => handleFieldCommentChange('title', e.target.value)}
                    placeholder="Nhận xét về tiêu đề..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Thương hiệu</label>
                  <p className="text-sm text-content-primary font-medium mb-2">{selectedListing.brand || 'N/A'}</p>
                  <textarea
                    value={fieldComments.brand || ''}
                    onChange={(e) => handleFieldCommentChange('brand', e.target.value)}
                    placeholder="Nhận xét về thương hiệu..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Model</label>
                  <p className="text-sm text-content-primary font-medium mb-2">{selectedListing.model || 'N/A'}</p>
                  <textarea
                    value={fieldComments.model || ''}
                    onChange={(e) => handleFieldCommentChange('model', e.target.value)}
                    placeholder="Nhận xét về model..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Năm sản xuất</label>
                  <p className="text-sm text-content-primary font-medium mb-2">{selectedListing.year || 'N/A'}</p>
                  <textarea
                    value={fieldComments.year || ''}
                    onChange={(e) => handleFieldCommentChange('year', e.target.value)}
                    placeholder="Nhận xét về năm sản xuất..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Giá</label>
                  <p className="text-sm text-content-primary font-medium mb-2">₫{selectedListing.price?.toLocaleString('vi-VN')}</p>
                  <textarea
                    value={fieldComments.price || ''}
                    onChange={(e) => handleFieldCommentChange('price', e.target.value)}
                    placeholder="Nhận xét về giá..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Hình ảnh</label>
                  <p className="text-sm text-content-primary font-medium mb-2">{selectedListing.images?.length || 0} ảnh</p>
                  <textarea
                    value={fieldComments.images || ''}
                    onChange={(e) => handleFieldCommentChange('images', e.target.value)}
                    placeholder="Nhận xét về hình ảnh..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-secondary uppercase block mb-1">Mô tả</label>
                  <p className="text-sm text-content-primary font-medium mb-2 line-clamp-2">{selectedListing.description || 'Không có mô tả'}</p>
                  <textarea
                    value={fieldComments.description || ''}
                    onChange={(e) => handleFieldCommentChange('description', e.target.value)}
                    placeholder="Nhận xét về mô tả..."
                    className="w-full px-2 py-1 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-xs"
                    rows="1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-2">
                Lý do từ chối <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối bài đăng này (ví dụ: Ảnh không rõ, thông tin không đầy đủ, giá không hợp lý...)"
                className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:ring-2 focus:ring-navy/50 text-sm"
                rows="4"
              />
              <p className="text-xs text-content-secondary mt-1">
                Lý do này sẽ được gửi cho người bán để họ biết tại sao bài đăng bị từ chối
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

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-success text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-content-primary mb-2">Từ chối thành công</h3>
          <p className="text-sm text-content-secondary mb-6">{successMessage}</p>
          <p className="text-xs text-content-secondary mb-6">Người bán sẽ nhận được thông báo về lý do từ chối</p>
          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-success rounded-sm hover:bg-success/90 transition-colors"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  )
}