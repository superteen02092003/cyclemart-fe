import { useState } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'

// Mock data
const USERS_DATA = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    type: 'seller',
    status: 'active',
    createdAt: '2024-01-15',
    verified: true,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    type: 'buyer',
    status: 'active',
    createdAt: '2024-02-20',
    verified: true,
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    type: 'seller',
    status: 'suspended',
    createdAt: '2024-03-10',
    verified: false,
  },
]

export default function AdminUsers() {
  const [users, setUsers] = useState(USERS_DATA)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const filteredUsers = filterType === 'all' ? users : users.filter((u) => u.type === filterType)

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const handleBanUser = (userId) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: 'banned' } : u)))
  }

  const handleVerifyUser = (userId) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, verified: true } : u)))
  }

  const columns = [
    { key: 'name', label: 'Tên người dùng', width: '200px' },
    { key: 'email', label: 'Email', width: '220px' },
    {
      key: 'type',
      label: 'Loại',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${value === 'seller' ? 'bg-navy/10 text-content-primary' : 'bg-success/10 text-success'}`}>
          {value === 'seller' ? 'Người bán' : 'Người mua'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
            value === 'active'
              ? 'bg-success/10 text-success'
              : value === 'suspended'
                ? 'bg-warning/10 text-warning'
                : 'bg-error/10 text-error'
          }`}
        >
          {value === 'active' ? 'Hoạt động' : value === 'suspended' ? 'Tạm khóa' : 'Cấm'}
        </span>
      ),
    },
    {
      key: 'verified',
      label: 'Xác thực',
      render: (value) => (value ? <span className="text-success">✓ Đã xác thực</span> : <span className="text-warning">Chưa xác thực</span>),
    },
    { key: 'createdAt', label: 'Ngày tạo', width: '120px' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Quản lý người dùng</h1>
        <p className="text-content-secondary mt-2">Quản lý người mua và người bán</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-content-primary block mb-2">Loại người dùng</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 bg-surface"
          >
            <option value="all">Tất cả</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Tổng người dùng</p>
          <p className="text-3xl font-bold text-content-primary mt-2">{users.length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Hoạt động</p>
          <p className="text-3xl font-bold text-success mt-2">{users.filter((u) => u.status === 'active').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Chưa xác thực</p>
          <p className="text-3xl font-bold text-warning mt-2">{users.filter((u) => !u.verified).length}</p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        actions={(user) => [
          <button
            key="view"
            onClick={() => handleViewDetails(user)}
            className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
          >
            Xem chi tiết
          </button>,
          !user.verified && (
            <button
              key="verify"
              onClick={() => handleVerifyUser(user.id)}
              className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-sm transition-colors"
            >
              Xác thực
            </button>
          ),
          user.status === 'active' && (
            <button
              key="ban"
              onClick={() => handleBanUser(user.id)}
              className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
            >
              Cấm
            </button>
          ),
        ]}
        className="bg-surface"
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết người dùng"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Tên người dùng</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Email</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Loại tài khoản</p>
              <p className="text-content-primary font-medium mt-1">
                {selectedUser.type === 'seller' ? 'Người bán' : 'Người mua'}
              </p>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Trạng thái</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.status}</p>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Ngày tạo</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.createdAt}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}




