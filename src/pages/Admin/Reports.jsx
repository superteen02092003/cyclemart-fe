import { useState, useEffect, useCallback } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'

const STATUS_DISPLAY = {
  OPENED: { label: 'Mở', className: 'bg-warning/20 text-warning' },
  ADMIN_REVIEW: { label: 'Chờ admin', className: 'bg-blue-100 text-blue-600' },
  INSPECTOR_REVIEW: { label: 'Đang kiểm tra', className: 'bg-purple-100 text-purple-600' },
  SELLER_APPROVED: { label: 'Seller đồng ý', className: 'bg-teal-100 text-teal-600' },
  SELLER_REJECTED: { label: 'Seller từ chối', className: 'bg-error/20 text-error' },
  RESOLVED_REFUND_BUYER: { label: 'Hoàn tiền buyer', className: 'bg-success/20 text-success' },
  RESOLVED_RELEASE_SELLER: { label: 'Giải ngân seller', className: 'bg-success/20 text-success' },
  RESOLVED_PARTIAL: { label: 'Giải quyết một phần', className: 'bg-success/20 text-success' },
}

const OPEN_STATUSES = new Set(['OPENED', 'ADMIN_REVIEW', 'INSPECTOR_REVIEW', 'SELLER_APPROVED', 'SELLER_REJECTED'])
const RESOLVED_STATUSES = new Set(['RESOLVED_REFUND_BUYER', 'RESOLVED_RELEASE_SELLER', 'RESOLVED_PARTIAL'])

function matchFilter(status, filter) {
  if (filter === 'all') return true
  if (filter === 'open') return OPEN_STATUSES.has(status)
  if (filter === 'resolved') return RESOLVED_STATUSES.has(status)
  return true
}

export default function AdminReports() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterStatus, setFilterStatus] = useState('all')

  const [selectedDispute, setSelectedDispute] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [resolution, setResolution] = useState('REFUND_BUYER')
  const [resolutionNote, setResolutionNote] = useState('')
  const [resolving, setResolving] = useState(false)

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getAllDisputes({ page, size: 20 })
      setDisputes(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      setError('Không thể tải danh sách tranh chấp.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  const handleResolve = async () => {
    if (!selectedDispute) return
    setResolving(true)
    try {
      await adminService.adminResolveDispute(selectedDispute.id, resolution, resolutionNote)
      setIsResolveModalOpen(false)
      setResolutionNote('')
      setResolution('REFUND_BUYER')
      await fetchDisputes()
    } catch (err) {
      console.error(err)
    } finally {
      setResolving(false)
    }
  }

  const openResolveModal = (dispute) => {
    setSelectedDispute(dispute)
    setIsResolveModalOpen(true)
  }

  const openDetailModal = (dispute) => {
    setSelectedDispute(dispute)
    setIsDetailModalOpen(true)
  }

  const filtered = disputes.filter((d) => matchFilter(d.status, filterStatus))

  const openCount = disputes.filter((d) => OPEN_STATUSES.has(d.status)).length
  const resolvedCount = disputes.filter((d) => RESOLVED_STATUSES.has(d.status)).length
  const adminReviewCount = disputes.filter((d) => d.status === 'ADMIN_REVIEW').length

  const columns = [
    {
      key: 'id',
      label: 'Mã tranh chấp',
      width: '130px',
      render: (_, row) => (
        <span className="font-mono text-sm">#{row.paymentOrderId ?? row.id}</span>
      ),
    },
    { key: 'buyerName', label: 'Người mua', width: '150px' },
    { key: 'sellerName', label: 'Người bán', width: '150px' },
    { key: 'reason', label: 'Lý do', width: '220px' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => {
        const s = STATUS_DISPLAY[value] ?? { label: value, className: 'bg-gray-200 text-gray-600' }
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${s.className}`}>
            {s.label}
          </span>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      width: '130px',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Báo cáo & tranh chấp</h1>
        <p className="text-content-secondary mt-2">Xử lý tranh chấp giao dịch giữa người mua và người bán</p>
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
            <option value="all">Tất cả</option>
            <option value="open">Đang mở</option>
            <option value="resolved">Đã giải quyết</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Đang mở</p>
          <p className="text-3xl font-bold text-warning mt-2">{openCount}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Đã giải quyết</p>
          <p className="text-3xl font-bold text-success mt-2">{resolvedCount}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Chờ admin xét</p>
          <p className="text-3xl font-bold text-error mt-2">{adminReviewCount}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-sm text-error text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-content-secondary">Đang tải...</div>
      ) : (
        <>
          <Table
            columns={columns}
            data={filtered}
            actions={(dispute) => [
              <button
                key="view"
                onClick={() => openDetailModal(dispute)}
                className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
              >
                Chi tiết
              </button>,
              OPEN_STATUSES.has(dispute.status) && (
                <button
                  key="resolve"
                  onClick={() => openResolveModal(dispute)}
                  className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-sm transition-colors"
                >
                  Giải quyết
                </button>
              ),
            ].filter(Boolean)}
            className="bg-surface"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-border-light rounded-sm text-sm disabled:opacity-40"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-content-secondary">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-border-light rounded-sm text-sm disabled:opacity-40"
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tranh chấp"
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Mã đơn hàng</p>
                <p className="text-content-primary font-mono font-medium mt-1">
                  #{selectedDispute.paymentOrderId ?? selectedDispute.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Trạng thái</p>
                <p className="text-content-primary font-medium mt-1">
                  {STATUS_DISPLAY[selectedDispute.status]?.label ?? selectedDispute.status}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người mua</p>
                <p className="text-content-primary font-medium mt-1">{selectedDispute.buyerName}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người bán</p>
                <p className="text-content-primary font-medium mt-1">{selectedDispute.sellerName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Lý do tranh chấp</p>
              <p className="text-content-primary mt-1">{selectedDispute.reason}</p>
            </div>
            {selectedDispute.evidenceUrls && (
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Bằng chứng</p>
                <p className="text-content-primary mt-1 break-all text-sm">{selectedDispute.evidenceUrls}</p>
              </div>
            )}
            {selectedDispute.resolutionNote && (
              <div className="pt-4 border-t border-border-light">
                <p className="text-xs text-content-secondary font-medium uppercase">Ghi chú giải quyết</p>
                <p className="text-content-primary mt-1">{selectedDispute.resolutionNote}</p>
                {selectedDispute.resolvedByName && (
                  <p className="text-xs text-content-secondary mt-1">Bởi: {selectedDispute.resolvedByName}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Giải quyết tranh chấp"
        size="md"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <p className="text-sm text-content-secondary">
              Tranh chấp #{selectedDispute.paymentOrderId ?? selectedDispute.id} —{' '}
              <span className="text-content-primary font-medium">{selectedDispute.reason}</span>
            </p>
            <div>
              <label className="text-sm font-medium text-content-primary block mb-2">Quyết định</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              >
                <option value="REFUND_BUYER">Hoàn tiền cho người mua</option>
                <option value="RELEASE_SELLER">Giải ngân cho người bán</option>
                <option value="PARTIAL">Giải quyết một phần</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-content-primary block mb-2">Ghi chú (tuỳ chọn)</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                placeholder="Lý do quyết định..."
                className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 text-sm border border-border-light rounded-sm hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="px-4 py-2 text-sm bg-navy text-white rounded-sm hover:bg-navy/90 disabled:opacity-50"
              >
                {resolving ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
