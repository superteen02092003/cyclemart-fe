import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'
import { formatPrice } from '@/utils/formatPrice'

const STATUS_CONFIG = {
  OPENED:                  { label: 'Vừa mở',          color: 'bg-blue-100 text-blue-700' },
  SELLER_APPROVED:         { label: 'Seller đồng ý',    color: 'bg-green-100 text-green-700' },
  SELLER_REJECTED:         { label: 'Chờ Admin xét',    color: 'bg-warning/20 text-warning' },
  ADMIN_REVIEW:            { label: 'Chờ Admin xét',    color: 'bg-warning/20 text-warning' },
  INSPECTOR_REVIEW:        { label: 'Chờ Inspector',    color: 'bg-blue-500/20 text-blue-600' },
  RESOLVED_REFUND_BUYER:   { label: 'Hoàn buyer',       color: 'bg-success/20 text-success' },
  RESOLVED_RELEASE_SELLER: { label: 'Giải phóng seller', color: 'bg-success/20 text-success' },
  RESOLVED_PARTIAL:        { label: 'Giải quyết một phần', color: 'bg-gray-100 text-gray-600' },
}

const NEEDS_ACTION = ['SELLER_REJECTED', 'ADMIN_REVIEW']
const IS_RESOLVED = ['RESOLVED_REFUND_BUYER', 'RESOLVED_RELEASE_SELLER', 'RESOLVED_PARTIAL']

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [resolving, setResolving] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllDisputes({ page: 0, size: 100 })
      setDisputes(data.content || [])
    } catch (err) {
      console.error('Lỗi tải tranh chấp:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDisputes() }, [])

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute)
    setResolutionNote('')
    setIsDetailModalOpen(true)
  }

  const handleResolve = async (resolution) => {
    if (!selectedDispute) return
    setResolving(true)
    try {
      await adminService.adminResolveDispute(selectedDispute.id, resolution, resolutionNote)
      setIsDetailModalOpen(false)
      fetchDisputes()
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xử lý tranh chấp')
    } finally {
      setResolving(false)
    }
  }

  const filteredDisputes = filterStatus === 'ALL'
    ? disputes
    : disputes.filter(d => d.status === filterStatus)

  const pendingCount = disputes.filter(d => NEEDS_ACTION.includes(d.status)).length

  const columns = [
    { key: 'paymentOrderId', label: 'Mã Đơn', width: '140px' },
    {
      key: 'bikeTitle',
      label: 'Sản phẩm',
      render: (_, row) => (
        <span className="font-medium text-content-primary line-clamp-1">
          {row.bikeTitle || `Payment #${row.paymentId}`}
        </span>
      ),
    },
    { key: 'buyerName', label: 'Người Mua' },
    { key: 'sellerName', label: 'Người Bán' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => {
        const cfg = STATUS_CONFIG[value] || { label: value, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày mở',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Quản lý Tranh chấp</h1>
          <p className="text-content-secondary mt-1">Xem xét và ra quyết định cho các tranh chấp buyer-seller</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-warning/20 text-warning text-sm font-bold rounded-full">
            {pendingCount} chờ xử lý
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
        >
          <option value="ALL">Tất cả ({disputes.length})</option>
          <option value="SELLER_REJECTED">Chờ Admin xét ({disputes.filter(d => ['SELLER_REJECTED','ADMIN_REVIEW'].includes(d.status)).length})</option>
          <option value="OPENED">Vừa mở</option>
          <option value="RESOLVED_REFUND_BUYER">Đã giải quyết</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-content-secondary">Đang tải...</div>
      ) : (
        <Table
          columns={columns}
          data={filteredDisputes}
          actions={(dispute) => [
            <button
              key="view"
              onClick={() => handleViewDetails(dispute)}
              className="px-3 py-2 text-sm font-medium text-white bg-navy hover:bg-navy/90 rounded-sm transition-colors"
            >
              Xem & Xét Xử
            </button>,
          ]}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Xử lý Tranh chấp #${selectedDispute?.paymentOrderId || selectedDispute?.id}`}
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 bg-surface-secondary p-4 rounded-sm border border-border-light text-sm">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Người mua</p>
                <p className="font-bold text-navy">{selectedDispute.buyerName}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Người bán</p>
                <p className="font-bold text-navy">{selectedDispute.sellerName}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Trạng thái</p>
                <p className="font-semibold">
                  {STATUS_CONFIG[selectedDispute.status]?.label || selectedDispute.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Kiểm định tại mua</p>
                <p className={`font-semibold ${selectedDispute.verifiedAtPurchase ? 'text-success' : 'text-warning'}`}>
                  {selectedDispute.verifiedAtPurchase ? 'Đã kiểm định ✓' : 'Chưa kiểm định'}
                </p>
              </div>
            </div>

            {/* Lý do tranh chấp */}
            <div className="bg-error/5 p-4 rounded-sm border border-error/20">
              <p className="text-xs text-error font-bold uppercase mb-2">Lý do tranh chấp (Người mua)</p>
              <p className="text-sm leading-relaxed">{selectedDispute.reason || '—'}</p>
              {selectedDispute.evidenceUrls && (
                <a href={selectedDispute.evidenceUrls} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-navy underline mt-2 inline-block">
                  Xem bằng chứng đính kèm →
                </a>
              )}
            </div>

            {/* Ghi chú giải quyết hiện tại */}
            {selectedDispute.resolutionNote && (
              <div className="bg-navy/5 p-4 rounded-sm border border-navy/20">
                <p className="text-xs text-navy font-bold uppercase mb-2">Ghi chú giải quyết</p>
                <p className="text-sm italic">{selectedDispute.resolutionNote}</p>
                {selectedDispute.resolvedByName && (
                  <p className="text-xs text-content-secondary mt-1">— {selectedDispute.resolvedByName}</p>
                )}
              </div>
            )}

            {/* Admin action */}
            {IS_RESOLVED.includes(selectedDispute.status) ? (
              <div className="bg-success/10 p-4 font-bold text-success text-center border border-success/20 rounded-sm">
                Tranh chấp đã được giải quyết: {STATUS_CONFIG[selectedDispute.status]?.label}
              </div>
            ) : (
              <div className="pt-4 border-t border-border-light space-y-3">
                <p className="text-sm font-bold text-error">Quyết định của Admin</p>
                <textarea
                  rows={2}
                  placeholder="Ghi chú quyết định (không bắt buộc)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolve('REFUND_BUYER')}
                    disabled={resolving}
                    className="flex-1 py-2.5 text-sm text-white bg-error hover:bg-error/90 font-bold rounded-sm disabled:opacity-50 transition-colors"
                  >
                    Hoàn Escrow → Buyer
                  </button>
                  <button
                    onClick={() => handleResolve('RELEASE_SELLER')}
                    disabled={resolving}
                    className="flex-1 py-2.5 text-sm text-white bg-[#ff6b35] hover:bg-[#ff7849] font-bold rounded-sm disabled:opacity-50 transition-colors"
                  >
                    Giải phóng Escrow → Seller
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
