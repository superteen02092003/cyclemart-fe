import { useState } from 'react'
import { Table } from '@/components/admin/Table'

const TRANSACTIONS_DATA = [
  {
    id: 'TXN001',
    buyer: 'Nguyễn Văn A',
    seller: 'Trần Thị B',
    amount: '45000000',
    fee: '1350000',
    status: 'completed',
    date: '2024-04-14',
    paymentMethod: 'Thẻ tín dụng',
  },
  {
    id: 'TXN002',
    buyer: 'Lê Thị C',
    seller: 'Phạm Văn D',
    amount: '3500000',
    fee: '105000',
    status: 'completed',
    date: '2024-04-13',
    paymentMethod: 'Chuyển khoản ngân hàng',
  },
  {
    id: 'TXN003',
    buyer: 'Hoàng Văn E',
    seller: 'Vũ Thị F',
    amount: '32000000',
    fee: '960000',
    status: 'pending',
    date: '2024-04-12',
    paymentMethod: 'Ví điện tử',
  },
]

export default function AdminTransactions() {
  const [transactions] = useState(TRANSACTIONS_DATA)
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTransactions = filterStatus === 'all' ? transactions : transactions.filter((t) => t.status === filterStatus)

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseInt(t.amount), 0)
  const totalFee = filteredTransactions.reduce((sum, t) => sum + parseInt(t.fee), 0)

  const columns = [
    { key: 'id', label: 'Mã giao dịch', width: '120px' },
    { key: 'buyer', label: 'Người mua', width: '150px' },
    { key: 'seller', label: 'Người bán', width: '150px' },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (value) => `₫${parseInt(value).toLocaleString('vi-VN')}`,
      width: '140px',
    },
    {
      key: 'fee',
      label: 'Phí dịch vụ (3%)',
      render: (value) => `₫${parseInt(value).toLocaleString('vi-VN')}`,
      width: '140px',
    },
    { key: 'paymentMethod', label: 'Phương thức thanh toán', width: '180px' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'completed'
              ? 'bg-success/20 text-success'
              : value === 'pending'
                ? 'bg-warning/20 text-warning'
                : 'bg-error/20 text-error'
          }`}
        >
          {value === 'completed' ? 'Hoàn tất' : value === 'pending' ? 'Chờ xử lý' : 'Hủy'}
        </span>
      ),
    },
    { key: 'date', label: 'Ngày', width: '120px' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Giao dịch & Phí dịch vụ</h1>
        <p className="text-content-secondary mt-2">Quản lý và theo dõi giao dịch, phí dịch vụ</p>
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
            <option value="completed">Hoàn tất</option>
            <option value="pending">Chờ xử lý</option>
            <option value="cancelled">Hủy</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Tổng giao dịch</p>
          <p className="text-3xl font-bold text-content-primary mt-2">{filteredTransactions.length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Tổng giá trị</p>
          <p className="text-2xl font-bold text-content-primary mt-2">₫{(totalAmount / 1e6).toFixed(0)}M</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Tổng phí dịch vụ</p>
          <p className="text-2xl font-bold text-content-primary mt-2">₫{(totalFee / 1e6).toFixed(1)}M</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Hoàn tất hôm nay</p>
          <p className="text-3xl font-bold text-success mt-2">{transactions.filter((t) => t.status === 'completed').length}</p>
        </div>
      </div>

      {/* Fee Settings */}
      <div className="mb-8 bg-surface rounded-sm border border-border-light p-6 shadow-card">
        <h2 className="text-lg font-bold text-content-primary mb-4">Cài đặt phí dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Phí giao dịch mặc định', value: '3%', description: 'Áp dụng cho tất cả các giao dịch' },
            { name: 'Phí rút tiền', value: '0%', description: 'Phí khi người bán rút tiền' },
            { name: 'Giảm phí VIP', value: '1.5%', description: 'Cho người bán VIP' },
            { name: 'Chiết khấu mùa vụ', value: 'Không', description: 'Áp dụng theo từng kỳ' },
          ].map((fee, idx) => (
            <div key={idx} className="p-4 rounded-sm bg-surface-tertiary">
              <p className="font-medium text-content-primary">{fee.name}</p>
              <p className="text-2xl font-bold text-content-primary mt-2">{fee.value}</p>
              <p className="text-xs text-content-secondary mt-1">{fee.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <Table
        columns={columns}
        data={filteredTransactions}
        actions={(transaction) => [
          <button
            key="view"
            className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
          >
            Chi tiết
          </button>,
          transaction.status === 'pending' && (
            <button
              key="refund"
              className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
            >
              Hoàn tiền
            </button>
          ),
        ]}
        className="bg-surface"
      />

      {/* Revenue Report */}
      <div className="mt-8 bg-surface rounded-sm border border-border-light p-6 shadow-card">
        <h2 className="text-lg font-bold text-content-primary mb-4">Báo cáo doanh thu 30 ngày gần đây</h2>
        <div className="h-64 flex items-end justify-around gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-navy/50 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }}></div>
              <span className="text-xs text-content-secondary">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}





