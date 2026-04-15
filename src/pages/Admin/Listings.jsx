import { useState } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'

const LISTINGS_DATA = [
  {
    id: 1,
    title: 'Honda CB150R 2024',
    seller: 'Nguyễn Văn A',
    category: 'Xe máy',
    price: '45000000',
    status: 'pending',
    submittedAt: '2024-04-14',
    images: 3,
  },
  {
    id: 2,
    title: 'Xe đạp Leo núi Trek',
    seller: 'Trần Thị B',
    category: 'Xe đạp',
    price: '3500000',
    status: 'pending',
    submittedAt: '2024-04-13',
    images: 5,
  },
  {
    id: 3,
    title: 'Yamaha Grande',
    seller: 'Lê Văn C',
    category: 'Xe máy',
    price: '32000000',
    status: 'approved',
    submittedAt: '2024-04-12',
    images: 4,
  },
]

export default function AdminListings() {
  const [listings, setListings] = useState(LISTINGS_DATA)
  const [selectedListing, setSelectedListing] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('pending')

  const filteredListings = listings.filter((l) => l.status === filterStatus)

  const handleViewDetails = (listing) => {
    setSelectedListing(listing)
    setIsDetailModalOpen(true)
  }

  const handleApproveListing = (id) => {
    setListings(listings.map((l) => (l.id === id ? { ...l, status: 'approved' } : l)))
  }

  const handleRejectListing = (id) => {
    setListings(listings.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l)))
  }

  const columns = [
    { key: 'title', label: 'Tiêu đề tin đăng', width: '200px' },
    { key: 'seller', label: 'Người bán', width: '150px' },
    { key: 'category', label: 'Danh mục', width: '100px' },
    {
      key: 'price',
      label: 'Giá',
      render: (value) => `₫${parseInt(value).toLocaleString('vi-VN')}`,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'pending'
              ? 'bg-warning/20 text-warning'
              : value === 'approved'
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error'
          }`}
        >
          {value === 'pending' ? 'Chờ duyệt' : value === 'approved' ? 'Đã duyệt' : 'Từ chối'}
        </span>
      ),
    },
    { key: 'submittedAt', label: 'Ngày gửi', width: '120px' },
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
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
          >
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Chờ duyệt</p>
          <p className="text-3xl font-bold text-warning mt-2">{listings.filter((l) => l.status === 'pending').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Đã duyệt</p>
          <p className="text-3xl font-bold text-success mt-2">{listings.filter((l) => l.status === 'approved').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Từ chối</p>
          <p className="text-3xl font-bold text-error mt-2">{listings.filter((l) => l.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredListings}
        actions={(listing) =>
          listing.status === 'pending'
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

      {/* Listing Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tin đăng"
        size="lg"
      >
        {selectedListing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Tiêu đề</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.title}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người bán</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.seller}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Danh mục</p>
                <p className="text-content-primary font-medium mt-1">{selectedListing.category}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Giá</p>
                <p className="text-content-primary font-medium mt-1">₫{parseInt(selectedListing.price).toLocaleString('vi-VN')}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border-light">
              <p className="text-sm font-medium text-content-primary mb-3">Hình ảnh: {selectedListing.images} ảnh</p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: selectedListing.images }).map((_, i) => (
                  <div key={i} className="aspect-square bg-surface-tertiary rounded-sm flex items-center justify-center">
                    📷 Ảnh {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}





