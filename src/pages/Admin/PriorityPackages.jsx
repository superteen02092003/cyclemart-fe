// src/pages/Admin/PriorityPackages.jsx
import { useState, useEffect } from 'react'
import { priorityService } from '@/services/priority'

export default function PriorityPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  
  // State cho Form tạo/sửa
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    priorityLevel: 'SILVER', // Mặc định
    isActive: true
  })

  // Load danh sách gói
  const fetchPackages = async () => {
    try {
      setLoading(true)
      const data = await priorityService.getAllPackages()
      setPackages(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách gói:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Xử lý Lưu (Tạo mới)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await priorityService.createPackage({
        ...formData,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays)
      })
      alert('Tạo gói thành công!')
      setShowForm(false)
      fetchPackages() 
    } catch (error) {
      // Sửa lại đoạn này để lấy message lỗi thực sự từ Backend
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      alert('Lỗi: ' + errorMessage);
    }
  }

  // Xử lý Xóa
  const handleDelete = async (id) => {
    if(window.confirm('Bạn có chắc muốn xóa gói này?')) {
      try {
        await priorityService.deletePackage(id)
        alert('Xóa thành công')
        fetchPackages()
      } catch (error) {
        alert('Lỗi xóa gói')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Gói Ưu Tiên</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#ff6b35] text-white px-4 py-2 rounded-sm"
        >
          {showForm ? 'Đóng' : '+ Tạo gói mới'}
        </button>
      </div>

      {/* Form Tạo Gói (Chỉ hiện khi bấm nút) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên gói</label>
            <input required minLength={3} type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mức ưu tiên</label>
            <select value={formData.priorityLevel} onChange={e => setFormData({...formData, priorityLevel: e.target.value})} className="w-full border p-2">
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
            <input required type="number" min="0" value={formData.price} onChange={e => {
  const value = e.target.value;
  setFormData({
    ...formData,
    price: value === "" ? "" : Number(value)
  });
}} className="w-full border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thời hạn (Ngày)</label>
            <input required type="number" min="1" max="365" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} className="w-full border p-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2"></textarea>
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-[#ff6b35] text-white px-4 py-2 rounded-sm">Lưu gói ưu tiên</button>
          </div>
        </form>
      )}

      {/* Bảng Danh sách Gói */}
      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Tên gói</th>
              <th className="p-3">Level</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Thời hạn</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{pkg.name}</td>
                <td className="p-3 text-sm font-bold text-orange-500">{pkg.priorityLevel}</td>
                <td className="p-3">{pkg.price.toLocaleString()} đ</td>
                <td className="p-3">{pkg.durationDays} ngày</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pkg.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:underline text-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}