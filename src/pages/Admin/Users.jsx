import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin' // Gọi từ adminService thay vì userService

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  
  // States cho các Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  
  // States cho User Log Tracking
  const [userLogs, setUserLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)

  // Load users từ API
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Lấy 100 user mới nhất
      const data = await adminService.getAllUsers({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })
      setUsers(data?.content || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      alert(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = filterType === 'all' 
    ? users 
    : users.filter((u) => u.role?.toLowerCase() === filterType.toLowerCase())

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  // --- XỬ LÝ XEM LOG ---
  const handleViewLogs = async (user) => {
    setSelectedUser(user)
    setIsLogModalOpen(true)
    try {
      setLoadingLogs(true)
      const logData = await adminService.getUserLogs(user.id, { page: 0, size: 50 })
      setUserLogs(logData?.content || [])
    } catch (error) {
      console.error('Lỗi khi tải log:', error)
      alert('Không thể tải lịch sử hoạt động của người dùng này.')
    } finally {
      setLoadingLogs(false)
    }
  }

  // --- XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN ---
  const handleToggleBanStatus = async (user) => {
    // Nếu đang bị Banned -> Hỏi xem có muốn mở khóa không
    if (user.status === 'BANNED') {
      if (window.confirm(`Bạn có chắc chắn muốn MỞ KHÓA cho tài khoản ${user.email}?`)) {
        try {
          setLoading(true)
          await adminService.unbanUser(user.id)
          alert('Mở khóa tài khoản thành công!')
          loadUsers()
        } catch (error) {
          alert('Lỗi: ' + (error.response?.data?.message || error.message))
        } finally {
          setLoading(false)
        }
      }
      return;
    }

    // Nếu đang Active -> Hỏi lý do Ban
    const reason = window.prompt(`Khóa tài khoản: ${user.email}\nVui lòng nhập lý do khóa (bắt buộc):`)
    if (reason === null) return; // Bấm hủy
    if (reason.trim() === '') {
      alert('Lý do không được để trống!')
      return;
    }

    try {
      setLoading(true)
      await adminService.banUser(user.id, reason)
      alert('Đã khóa tài khoản thành công!')
      loadUsers()
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'fullName', label: 'Tên người dùng', width: '200px' },
    { key: 'email', label: 'Email', width: '220px' },
    {
      key: 'role',
      label: 'Loại',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          value === 'SELLER' ? 'bg-navy/10 text-content-primary' : 'bg-success/10 text-success'
        }`}>
          {value || 'BUYER'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          {value === 'ACTIVE' ? 'Hoạt động' : value === 'BANNED' ? 'Bị khóa' : value}
        </span>
      ),
    },
    { 
      key: 'createdAt', 
      label: 'Ngày tạo', 
      width: '120px',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
    },
  ]

  if (loading && users.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center py-12">
        <span className="text-content-secondary">Đang tải dữ liệu...</span>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Quản lý người dùng</h1>
        <p className="text-content-secondary mt-2">Giám sát hoạt động, khóa hoặc mở khóa tài khoản</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-content-primary block mb-2">Loại người dùng</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Tổng người dùng</p>
          <p className="text-3xl font-bold text-content-primary mt-2">{users.length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Hoạt động</p>
          <p className="text-3xl font-bold text-success mt-2">{users.filter((u) => u.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4 shadow-sm">
          <p className="text-sm text-content-secondary font-medium">Bị khóa (Banned)</p>
          <p className="text-3xl font-bold text-error mt-2">{users.filter((u) => u.status === 'BANNED').length}</p>
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
            Chi tiết
          </button>,
          <button
            key="log"
            onClick={() => handleViewLogs(user)}
            className="px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-sm transition-colors"
          >
            Xem Log
          </button>,
          <button
            key="ban"
            onClick={() => handleToggleBanStatus(user)}
            className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
              user.status === 'BANNED' 
                ? 'text-success hover:bg-success/10' 
                : 'text-error hover:bg-error/10'
            }`}
          >
            {user.status === 'BANNED' ? 'Mở khóa' : 'Khóa TK'}
          </button>,
        ]}
        className="bg-surface"
      />

      {/* --- MODAL 1: CHI TIẾT USER --- */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết người dùng"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            
            {/* Nếu bị khóa thì hiện màu đỏ lý do */}
            {selectedUser.status === 'BANNED' && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 text-sm">
                <strong>Tài khoản đang bị khóa!</strong>
                <p className="mt-1">Lý do: {selectedUser.banReason || 'Không có lý do'}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">ID / Ngày tạo</p>
                <p className="text-content-primary font-medium mt-1">#{selectedUser.id} - {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : ''}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Lần đăng nhập cuối</p>
                <p className="text-content-primary font-medium mt-1">
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('vi-VN') : 'Chưa từng ĐN'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Tên đầy đủ</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.fullName || 'Chưa cập nhật'}</p>
            </div>
            
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Email / Điện thoại</p>
              <p className="text-content-primary font-medium mt-1">{selectedUser.email} / {selectedUser.phone || 'N/A'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 2: XEM LOG HOẠT ĐỘNG --- */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Lịch sử hoạt động: ${selectedUser?.email}`}
        size="lg" // Modal bự hơn một chút để chứa bảng
      >
        {loadingLogs ? (
          <div className="py-10 text-center text-content-secondary">Đang trích xuất dữ liệu log...</div>
        ) : userLogs.length === 0 ? (
          <div className="py-10 text-center text-content-secondary">Người dùng này chưa có hoạt động nào được ghi nhận.</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-secondary text-content-secondary text-xs uppercase border-b border-border-light">
                  <th className="py-3 px-4 font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Hành động (Event)</th>
                  <th className="py-3 px-4 font-semibold">Vị trí / Vùng</th>
                  <th className="py-3 px-4 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {userLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-light hover:bg-surface-secondary/50">
                    <td className="py-3 px-4 text-sm text-content-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-navy">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4 text-sm text-content-secondary">
                      {log.location || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-content-secondary">
                      {log.productId ? `Sản phẩm #${log.productId}` : ''} 
                      {log.sellerId ? ` Shop #${log.sellerId}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

    </div>
  )
}