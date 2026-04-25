import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'

export default function InspectionCriteria() {
  const [criteria, setCriteria] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true })

  useEffect(() => { loadCriteria() }, [])

  const loadCriteria = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllCriteria()
      setCriteria(data)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const handleOpenModal = (item = null) => {
    setEditingItem(item)
    setFormData(item ? { ...item } : { name: '', description: '', isActive: true })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await adminService.updateCriterion(editingItem.id, formData)
      } else {
        await adminService.createCriterion(formData)
      }
      setIsModalOpen(false)
      loadCriteria()
    } catch (error) { alert('Lỗi khi lưu dữ liệu') }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tiêu chí này?')) {
      await adminService.deleteCriterion(id)
      loadCriteria()
    }
  }

  const columns = [
    { key: 'id', label: 'ID', width: '50px' },
    { key: 'name', label: 'Tên hạng mục kiểm tra' },
    { key: 'description', label: 'Mô tả chi tiết' },
    { 
      key: 'isActive', 
      label: 'Trạng thái', 
      render: (val) => val ? <span className="text-green-600">Hoạt động</span> : <span className="text-gray-400">Ẩn</span> 
    }
  ]

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Danh sách hạng mục kiểm định</h1>
        <button onClick={() => handleOpenModal()} className="bg-navy text-white px-4 py-2 rounded-sm text-sm font-bold">
          + Thêm hạng mục mới
        </button>
      </div>

      <Table 
        columns={columns} 
        data={criteria} 
        actions={(item) => [
          <button key="edit" onClick={() => handleOpenModal(item)} className="text-blue-600 mr-3">Sửa</button>,
          <button key="del" onClick={() => handleDelete(item.id)} className="text-red-600">Xóa</button>
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Sửa hạng mục" : "Thêm hạng mục mới"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên hạng mục <span className="text-red-500">*</span></label>
            <input 
              required className="w-full border p-2 rounded-sm" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="VD: Kiểm tra khung sườn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea 
              className="w-full border p-2 rounded-sm" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Các chi tiết cần inspector chú ý..."
            />
          </div>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" checked={formData.isActive} 
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
            />
            <span className="text-sm">Kích hoạt hạng mục này</span>
          </label>
          <button className="w-full bg-navy text-white py-2 font-bold rounded-sm mt-4">Lưu thay đổi</button>
        </form>
      </Modal>
    </div>
  )
}