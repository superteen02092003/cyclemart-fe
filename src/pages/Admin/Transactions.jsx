import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { adminService } from '@/services/admin'
import { formatPrice } from '@/utils/formatPrice'
import { toast } from '@/utils/toast'

function AdminNoteModal({ isOpen, onClose, onSubmit, action, loading }) {
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú')
      return
    }
    onSubmit(note)
    setNote('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-bold text-content-primary mb-4">
          {action === 'refund' ? 'Hoàn tiền về người mua' : 'Giải phóng escrow cho người bán'}
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú cho người dùng (bắt buộc)..."
          className="w-full border border-border-light rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/50 min-h-[100px]"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border-light text-content-secondary hover:bg-surface-secondary rounded-sm text-sm font-medium disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-navy text-white hover:bg-navy/90 rounded-sm text-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_CONFIG = {
  SUCCESS:   { label: 'Hoàn tất',   color: 'bg-success/20 text-success' },
  PENDING:   { label: 'Chờ xử lý', color: 'bg-warning/20 text-warning' },
  FAILED:    { label: 'Thất bại',   color: 'bg-error/20 text-error' },
  REFUNDED:  { label: 'Đã hoàn',    color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Đã hủy',     color: 'bg-gray-100 text-gray-600' },
}

const ORDER_STATUS_CONFIG = {
  PAID_WAITING_DELIVERY: { label: 'Chờ giao hàng',   color: 'bg-orange/10 text-orange' },
  IN_DELIVERY:           { label: 'Đang vận chuyển',  color: 'bg-blue-50 text-blue-600' },
  DELIVERED:             { label: 'Đã giao',          color: 'bg-green/10 text-green' },
  RETURN_REQUESTED:      { label: 'Yêu cầu hoàn trả', color: 'bg-error/10 text-error font-bold' },
  DISPUTE_SYSTEM:        { label: 'Tranh chấp',        color: 'bg-error/10 text-error' },
  COMPLETED:             { label: 'Hoàn tất',          color: 'bg-gray-100 text-gray-500' },
  CANCELLED:             { label: 'Đã hủy',            color: 'bg-gray-100 text-gray-500' },
}

const TYPE_LABELS = {
  ORDER_PAYMENT:     'Mua xe',
  TOP_UP:            'Nạp điểm',
  PRIORITY_PACKAGE:  'Gói ưu tiên',
  INSPECTION_FEE:    'Phí kiểm định',
}

export default function AdminTransactions() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const [stats, setStats] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [modalPaymentId, setModalPaymentId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [paymentsData, statsData] = await Promise.all([
        adminService.getAllPayments({ page: 0, size: 100, sort: 'createdAt', direction: 'desc' }),
        adminService.getPaymentStatistics().catch(() => null),
      ])
      setPayments(paymentsData.content || [])
      setStats(statsData)
    } catch (err) {
      console.error('Lỗi tải giao dịch:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEscrow = async (note) => {
    setActionLoading(modalPaymentId)
    try {
      if (modalAction === 'refund') {
        await adminService.refundEscrow(modalPaymentId, note)
        toast.success('Đã hoàn tiền escrow về người mua.')
      } else {
        await adminService.releaseEscrow(modalPaymentId, note)
        toast.success('Đã giải phóng escrow cho người bán.')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi xử lý escrow')
    } finally {
      setActionLoading(null)
    }
  }

  const openModal = (paymentId, action) => {
    setModalPaymentId(paymentId)
    setModalAction(action)
    setModalOpen(true)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = filterStatus === 'all'
    ? payments
    : payments.filter(p => (p.status || '').toLowerCase() === filterStatus)

  const totalAmount = filtered
    .filter(p => p.status === 'SUCCESS')
    .reduce((s, p) => s + (p.amount || 0), 0)

  const columns = [
    { key: 'orderId', label: 'Mã giao dịch', width: '160px' },
    { key: 'buyerName', label: 'Người mua' },
    { key: 'sellerName', label: 'Người bán', render: (v) => v || '—' },
    {
      key: 'bikeTitle',
      label: 'Sản phẩm',
      render: (v, row) => v || TYPE_LABELS[row.type] || '—',
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (v) => formatPrice(v),
      width: '130px',
    },
    {
      key: 'type',
      label: 'Loại',
      render: (v) => (
        <span className="text-xs font-medium text-content-secondary">
          {TYPE_LABELS[v] || v || '—'}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'status',
      label: 'Thanh toán',
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || { label: v, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
      width: '110px',
    },
    {
      key: 'orderStatus',
      label: 'Đơn hàng',
      render: (v) => {
        if (!v) return <span className="text-xs text-content-tertiary">—</span>
        const cfg = ORDER_STATUS_CONFIG[v] || { label: v, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
      width: '140px',
    },
    {
      key: 'createdAt',
      label: 'Ngày',
      render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
      width: '100px',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content-primary">Giao dịch & Thanh toán</h1>
        <p className="text-content-secondary mt-1">Theo dõi tất cả giao dịch trên hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng giao dịch', value: payments.length },
          { label: 'Thành công', value: payments.filter(p => p.status === 'SUCCESS').length, color: 'text-success' },
          { label: 'Chờ xử lý', value: payments.filter(p => p.status === 'PENDING').length, color: 'text-warning' },
          { label: 'Tổng giá trị', value: formatPrice(totalAmount), color: 'text-navy' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-sm border border-border-light p-4 shadow-card">
            <p className="text-xs text-content-secondary font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || 'text-content-primary'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border-light rounded-sm text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
        >
          <option value="all">Tất cả</option>
          <option value="success">Thành công</option>
          <option value="pending">Chờ xử lý</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-content-secondary">Đang tải...</div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          actions={(row) => {
            if (row.orderStatus !== 'RETURN_REQUESTED') return null
            const busy = actionLoading === row.id
            return [
              <button
                key="refund"
                onClick={() => openModal(row.id, 'refund')}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-bold text-white bg-error hover:bg-error/90 rounded-sm disabled:opacity-50"
              >
                {busy ? '...' : 'Hoàn tiền → Buyer'}
              </button>,
              <button
                key="release"
                onClick={() => openModal(row.id, 'release')}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#ff6b35] hover:bg-[#ff7849] rounded-sm disabled:opacity-50"
              >
                {busy ? '...' : 'Giải phóng → Seller'}
              </button>,
            ]
          }}
        />
      )}

      <AdminNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEscrow}
        action={modalAction}
        loading={actionLoading !== null}
      />
    </div>
  )
}
