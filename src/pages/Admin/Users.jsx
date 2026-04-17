import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { userService } from '@/services/user'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)

  // Load users từ API
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('👥 Loading users from backend...')
      const data = await userService.getAll()
      console.log('✅ Users loaded:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('❌ Error loading users:', error)
      alert(error.message || 'Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = filterType === 'all' ? users : users.filter((u) => u.role === filterType.toUpperCase())

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const handleDeleteUser = async (userId) => {
    if (confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
      try {
        setLoading(true)
        console.log('🗑️ Deleting user:', userId)
        await userService.delete(userId)
        await loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert(error.message || 'Lỗi khi xóa người dùng')
      } finally {
        setLoading(false)
      }
    }
  }

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'fullName', label: 'Tên người dùng', width: '200px' },
    { key: 'email', label: 'Email', width: '220px' },
    { key: 'phone', label: 'Số điện thoại', width: '120px' },
    {
      key: 'roleDisplay',
      label: 'Loại',
      render: (value, item) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          item.role === 'SELLER' ? 'bg-navy/10 text-content-primary' : 'bg-success/10 text-success'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'statusDisplay',
      label: 'Trạng thái',
      render: (value, item) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          item.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          {value}
        </span>
      ),
    },
    { 
      key: 'createdAt', 
      label: 'Ngày tạo', 
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <span className="text-content-secondary">Đang tải danh sách người dùng...</span>
        </div>
      </div>
    )
  }

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
          <p className="text-3xl font-bold text-success mt-2">{users.filter((u) => u.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Người bán</p>
          <p className="text-3xl font-bold text-navy mt-2">{users.filter((u) => u.role === 'SELLER').length}</p>
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
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
          >
            Xem
          </button>,
          <button
            key="delete"
            onClick={() => handleDeleteUser(user.id)}
            className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
          >
            Xóa
          </button>,
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">ID</p>
                <p className="text-content-primary font-medium mt-1">{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Ngày tạo</p>
                <p className="text-content-primary font-medium mt-1">
                  {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Tên đầy đủ</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.fullName}</p>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Email</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.email}</p>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Số điện thoại</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.phone}</p>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Loại tài khoản</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.roleDisplay}</p>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Trạng thái</p>
              <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium mt-1 ${
                selectedUser.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {selectedUser.statusDisplay}
              </span>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border-light text-content-primary rounded-sm font-medium hover:bg-surface-tertiary transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}




