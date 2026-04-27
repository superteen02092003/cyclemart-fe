import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'
import { formatPrice } from '@/utils/formatPrice'
import { toast } from '@/utils/toast'

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xử lý', color: 'bg-warning/20 text-warning' },
  COMPLETED: { label: 'Đã chuyển', color: 'bg-success/20 text-success' },
  REJECTED:  { label: 'Đã từ chối', color: 'bg-error/20 text-error' },
}

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllWithdrawals({ page: 0, size: 100 })
      setRequests(data.content || [])
    } catch (err) {
      console.error('Lỗi tải yêu cầu rút tiền:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openModal = (req) => {
    setSelected(req)
    setNote('')
    setIsModalOpen(true)
  }

  const handleAction = async (action) => {
    if (!selected) return
    setProcessing(true)
    try {
      if (action === 'complete') {
        await adminService.completeWithdrawal(selected.id, note)
        toast.success('Đã xác nhận chuyển khoản.')
      } else {
        await adminService.rejectWithdrawal(selected.id, note)
        toast.success('Đã từ chối yêu cầu. Điểm đã được hoàn lại cho user.')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi xử lý yêu cầu')
    } finally {
      setProcessing(false)
    }
  }

  const filtered = filterStatus === 'ALL'
    ? requests
    : requests.filter(r => r.status === filterStatus)

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  const columns = [
    { key: 'id', label: '#', width: '60px' },
    { key: 'userName', label: 'Người dùng' },
    {
      key: 'amount',
      label: 'Số điểm / VND',
      render: (v) => (
        <span className="font-bold text-navy">
          {v?.toLocaleString('vi-VN')} đ &nbsp;
          <span className="font-normal text-content-tertiary text-xs">≈ {formatPrice(v)}</span>
        </span>
      ),
    },
    { key: 'bankName', label: 'Ngân hàng' },
    { key: 'accountNumber', label: 'Số tài khoản' },
    { key: 'accountHolder', label: 'Tên chủ TK' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || { label: v, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
      width: '110px',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Yêu cầu rút tiền</h1>
          <p className="text-content-secondary mt-1">Xử lý chuyển khoản thủ công cho người dùng</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-warning/20 text-warning text-sm font-bold rounded-full">
            {pendingCount} chờ xử lý
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tổng yêu cầu', value: requests.length },
          { label: 'Chờ xử lý', value: pendingCount, color: 'text-warning' },
          {
            label: 'Tổng cần chuyển',
            value: formatPrice(requests.filter(r => r.status === 'PENDING').reduce((s, r) => s + (r.amount || 0), 0)),
            color: 'text-navy',
          },
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
          <option value="ALL">Tất cả ({requests.length})</option>
          <option value="PENDING">Chờ xử lý ({pendingCount})</option>
          <option value="COMPLETED">Đã chuyển ({requests.filter(r => r.status === 'COMPLETED').length})</option>
          <option value="REJECTED">Đã từ chối ({requests.filter(r => r.status === 'REJECTED').length})</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-content-secondary">Đang tải...</div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          actions={(row) => {
            if (row.status !== 'PENDING') return null
            return [
              <button
                key="action"
                onClick={() => openModal(row)}
                className="px-3 py-2 text-sm font-medium text-white bg-navy hover:bg-navy/90 rounded-sm transition-colors"
              >
                Xử lý
              </button>,
            ]
          }}
        />
      )}

      {/* Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Xử lý yêu cầu rút #${selected?.id}`}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 bg-surface-secondary p-4 rounded-sm border border-border-light text-sm">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Người dùng</p>
                <p className="font-bold text-navy">{selected.userName}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Số tiền</p>
                <p className="font-bold text-navy">{formatPrice(selected.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Ngân hàng</p>
                <p className="font-semibold">{selected.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Số tài khoản</p>
                <p className="font-semibold font-mono">{selected.accountNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-content-secondary font-medium uppercase mb-1">Tên chủ tài khoản</p>
                <p className="font-bold text-content-primary">{selected.accountHolder}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 text-sm text-blue-700">
              <span className="font-bold">Lưu ý:</span> Hãy chuyển khoản thủ công trước rồi mới nhấn "Xác nhận đã chuyển". Nếu từ chối, điểm sẽ được hoàn lại tự động.
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Ghi chú (không bắt buộc)</label>
              <textarea
                rows={2}
                placeholder="VD: Đã chuyển lúc 14:30 ngày 27/04..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction('complete')}
                disabled={processing}
                className="flex-1 py-2.5 text-sm text-white bg-success hover:bg-success/90 font-bold rounded-sm disabled:opacity-50 transition-colors"
              >
                {processing ? '...' : 'Xác nhận đã chuyển khoản'}
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={processing}
                className="flex-1 py-2.5 text-sm text-white bg-error hover:bg-error/90 font-bold rounded-sm disabled:opacity-50 transition-colors"
              >
                {processing ? '...' : 'Từ chối (hoàn điểm)'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
