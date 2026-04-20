import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { inspectionService } from '@/services/inspection'
import { adminService } from '@/services/admin'

export default function AdminInspections() {
  const [inspections, setInspections] = useState([])
  const [inspectors, setInspectors] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedInspectorId, setSelectedInspectorId] = useState('')

  useEffect(() => {
    loadData()
    loadInspectors()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await inspectionService.getAllAdminRequests({ page: 0, size: 50 })
      setInspections(data.content || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadInspectors = async () => {
    try {
      const data = await adminService.getAllUsers({ size: 100 })
      // Lọc ra những người có role là INSPECTOR
      setInspectors((data.content || []).filter(u => u.role === 'INSPECTOR'))
    } catch (error) {
      console.error(error)
    }
  }

  const handleAssign = async () => {
    if (!selectedInspectorId) return alert('Vui lòng chọn Kiểm duyệt viên!')
    try {
      await inspectionService.assignInspector(selectedTask.id, selectedInspectorId)
      alert('Phân công thành công!')
      setIsAssignModalOpen(false)
      loadData()
    } catch (error) {
      // NẾU BỊ TRÙNG LỊCH 2 TIẾNG, LỖI SẼ HIỆN Ở ĐÂY
      alert(error.response?.data?.message || 'Lỗi phân công')
    }
  }

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'postTitle', label: 'Bài đăng', width: '200px' },
    { key: 'sellerName', label: 'Người bán' },
    { key: 'inspectorName', label: 'Người kiểm định', render: (val) => val || <span className="text-gray-400">Chưa phân công</span> },
    { 
      key: 'scheduledDateTime', 
      label: 'Thời gian hẹn',
      render: (val) => new Date(val).toLocaleString('vi-VN')
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-medium ${
          value === 'PENDING' ? 'bg-warning/20 text-warning' : 
          value === 'PASSED' ? 'bg-success/20 text-success' : 
          value === 'FAILED' ? 'bg-error/20 text-error' : 'bg-blue-100 text-blue-700'
        }`}>
          {value}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-content-primary mb-6">Quản lý Kiểm định</h1>
      
      {loading ? <p>Đang tải...</p> : (
        <Table
          columns={columns}
          data={inspections}
          actions={(task) => [
            task.status === 'PENDING' && (
              <button 
                key="assign"
                onClick={() => { setSelectedTask(task); setIsAssignModalOpen(true); }}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-sm"
              >
                Phân công
              </button>
            )
          ]}
        />
      )}

      {/* Modal Phân Công */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Phân công Kiểm duyệt viên">
        <div className="space-y-4">
          <p><strong>Xe cần kiểm định:</strong> {selectedTask?.postTitle}</p>
          <p className="text-red-600"><strong>Giờ hẹn:</strong> {new Date(selectedTask?.scheduledDateTime).toLocaleString('vi-VN')}</p>
          
          <div>
            <label className="block text-sm font-medium mb-1">Chọn Inspector rảnh rỗi:</label>
            <select 
              className="w-full border p-2 rounded-sm"
              value={selectedInspectorId}
              onChange={(e) => setSelectedInspectorId(e.target.value)}
            >
              <option value="">-- Chọn người --</option>
              {inspectors.map(ins => (
                <option key={ins.id} value={ins.id}>{ins.fullName} (ID: {ins.id})</option>
              ))}
            </select>
          </div>
          
          <button onClick={handleAssign} className="w-full bg-[#ff6b35] text-white py-2 rounded-sm font-bold">
            Xác nhận Phân công
          </button>
        </div>
      </Modal>
    </div>
  )
}