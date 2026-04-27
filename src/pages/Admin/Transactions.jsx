import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { adminService } from '@/services/admin'
import { formatPrice } from '@/utils/formatPrice'

const STATUS_CONFIG = {
  SUCCESS:   { label: 'Hoàn tất',   color: 'bg-success/20 text-success' },
  PENDING:   { label: 'Chờ xử lý', color: 'bg-warning/20 text-warning' },
  FAILED:    { label: 'Thất bại',   color: 'bg-error/20 text-error' },
  REFUNDED:  { label: 'Đã hoàn',    color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Đã hủy',     color: 'bg-gray-100 text-gray-600' },
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
  const [stats, setStats] = useState(null)

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
      label: 'Trạng thái',
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
      key: 'createdAt',
      label: 'Ngày',
      render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
      width: '110px',
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
        <Table columns={columns} data={filtered} />
      )}
    </div>
  )
}
