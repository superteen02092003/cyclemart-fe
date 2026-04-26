import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin'
import { inspectionService } from '@/services/inspection' // 🔥 Thêm service kiểm định

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  
  // 🔥 MỚI: State cho Modal xem tiến độ Inspector
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [inspectorTasks, setInspectorTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  
  const [userLogs, setUserLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
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

  const usersWithSTT = filteredUsers.map((user, index) => ({
    ...user,
    stt: index + 1
  }))

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

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

  // 🔥 MỚI: Hàm xử lý mở Modal xem tiến độ của Inspector
  const handleViewInspectorTasks = async (user) => {
    setSelectedUser(user)
    setIsTasksModalOpen(true)
    try {
      setLoadingTasks(true)
      const data = await inspectionService.getInspectorTasksByAdmin(user.id, { page: 0, size: 50 })
      setInspectorTasks(data?.content || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách công việc:', error)
      alert('Không thể tải tiến độ công việc của Kiểm định viên này.')
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleToggleBanStatus = async (user) => {
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

    const reason = window.prompt(`Khóa tài khoản: ${user.email}\nVui lòng nhập lý do khóa (bắt buộc):`)
    if (reason === null) return;
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
    { key: 'stt', label: 'STT', width: '60px' },
    { key: 'fullName', label: 'Tên người dùng', width: '200px' },
    { key: 'email', label: 'Email', width: '220px' },
    {
      key: 'role',
      label: 'Loại',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          value === 'USER' ? 'bg-success/10 text-success' : 
          value === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
          value === 'INSPECTOR' ? 'bg-amber-100 text-amber-700' :
          'bg-success/10 text-success'
        }`}>
          {value === 'USER' ? 'Người dùng' : 
           value === 'ADMIN' ? 'Quản trị viên' : 
           value === 'INSPECTOR' ? 'Kiểm định viên' : value}
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

      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-content-primary block mb-2">Loại người dùng</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
            <option value="inspector">Kiểm định viên</option>
          </select>
        </div>
      </div>

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

      <Table
        columns={columns}
        data={usersWithSTT}
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
          // 🔥 MỚI: Chỉ hiển thị nút "Tiến độ CV" nếu role là INSPECTOR
          user.role === 'INSPECTOR' ? (
            <button
              key="tasks"
              onClick={() => handleViewInspectorTasks(user)}
              className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-sm transition-colors"
            >
              Tiến độ CV
            </button>
          ) : null,
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
        ].filter(Boolean)} // Lọc bỏ các giá trị null (trong trường hợp không phải INSPECTOR)
        className="bg-surface"
      />

      {/* Modal Chi tiết người dùng */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết người dùng"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            {selectedUser.status === 'BANNED' && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 text-sm">
                <strong>Tài khoản đang bị khóa!</strong>
                <p className="mt-1">Lý do: {selectedUser.banReason || 'Không có lý do'}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">ID gốc / Ngày tạo</p>
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

      {/* Modal Lịch sử hoạt động (Log) */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Lịch sử hoạt động: ${selectedUser?.email}`}
        size="lg"
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

      {/* 🔥 MỚI: Modal Tiến độ công việc của Inspector */}
      <Modal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        title={`Công việc của Inspector: ${selectedUser?.fullName || selectedUser?.email}`}
        size="xl"
      >
        {loadingTasks ? (
          <div className="py-10 text-center text-content-secondary">Đang trích xuất danh sách công việc...</div>
        ) : inspectorTasks.length === 0 ? (
          <div className="py-10 text-center text-content-secondary">Kiểm định viên này chưa được phân công hoặc chưa có công việc nào.</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="mb-4 flex gap-4 text-sm text-content-secondary bg-surface-secondary p-3 rounded-sm border">
              <div>Tổng cộng: <strong>{inspectorTasks.length}</strong> việc</div>
              <div>Đã hoàn thành: <strong>{inspectorTasks.filter(t => t.status === 'PASSED').length}</strong> việc</div>
              <div>Đang chờ xử lý: <strong className="text-warning-content">{inspectorTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'INSPECTING').length}</strong> việc</div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-secondary text-content-secondary text-xs uppercase border-b border-border-light">
                  <th className="py-3 px-3 font-semibold">Tên xe / Bài đăng</th>
                  <th className="py-3 px-3 font-semibold text-center">Trạng thái</th>
                  <th className="py-3 px-3 font-semibold">Hẹn lúc</th>
                  <th className="py-3 px-3 font-semibold">Nhận xét của Inspector</th>
                </tr>
              </thead>
              <tbody>
                {inspectorTasks.map((task) => (
                  <tr key={task.id} className="border-b border-border-light hover:bg-surface-secondary/50">
                    <td className="py-3 px-3 text-sm font-medium text-navy">
                      <span className="line-clamp-2" title={task.postTitle}>{task.postTitle}</span>
                      <span className="text-xs text-content-secondary font-normal mt-1 block">Khách: {task.sellerName}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-center whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-sm uppercase tracking-wider ${
                        task.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                        task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-warning/10 text-warning-content'
                      }`}>
                        {task.status === 'PASSED' ? 'Hoàn thành' : 
                         task.status === 'FAILED' ? 'Bị rớt' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-content-secondary whitespace-nowrap">
                      {task.scheduledDateTime ? new Date(task.scheduledDateTime).toLocaleString('vi-VN') : 'Chưa có giờ'}
                    </td>
                    <td className="py-3 px-3 text-sm text-content-secondary">
                      <span className="line-clamp-2 italic" title={task.resultNote || 'Chưa có ghi chú'}>
                        {task.resultNote || '-'}
                      </span>
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