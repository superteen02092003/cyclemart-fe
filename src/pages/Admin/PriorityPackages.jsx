import { useState, useEffect } from 'react'
import { priorityService } from '@/services/priority'

export default function PriorityPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    priorityLevel: 'SILVER',
    isActive: true
  })

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const data = await priorityService.getAllPackages()
      setPackages(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate logic: Giá phải bằng 0 (Free) hoặc >= 10,000 (Thanh toán VNPay)
    const priceValue = Number(formData.price)
    if (priceValue > 0 && priceValue < 10000) {
      alert('Lỗi: Giá gói phải bằng 0 (miễn phí) hoặc từ 10.000 VNĐ trở lên (do quy định của cổng thanh toán).')
      return
    }

    if (formData.name.trim().length < 3) {
      alert('Lỗi: Tên gói phải có ít nhất 3 ký tự.')
      return
    }

    try {
      await priorityService.createPackage({
        ...formData,
        price: priceValue,
        durationDays: Number(formData.durationDays)
      })
      alert('Tạo gói ưu tiên thành công!')
      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        price: '',
        durationDays: '',
        priorityLevel: 'SILVER',
        isActive: true
      })
      fetchPackages() 
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi tạo gói'
      const errorData = error.response?.data
      
      if (errorData) {
        if (typeof errorData === 'string') {
           errorMessage = errorData
        } else if (errorData.errors && typeof errorData.errors === 'object') {
           errorMessage = Object.values(errorData.errors).join('\n')
        } else if (errorData.message) {
           errorMessage = errorData.message
        }
      }
      alert('Lỗi từ hệ thống: \n' + errorMessage)
    }
  }

  const handleDelete = async (id) => {
    if(window.confirm('Bạn có chắc muốn xóa gói này?')) {
      try {
        await priorityService.deletePackage(id)
        alert('Xóa thành công')
        fetchPackages()
      } catch (error) {
        alert('Lỗi khi xóa gói')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Gói Ưu Tiên</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#ff6b35] text-white px-4 py-2 rounded-sm font-semibold"
        >
          {showForm ? 'Đóng' : '+ Tạo gói mới'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm mb-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tên gói (Ít nhất 3 ký tự)</label>
              <input 
                required 
                minLength={3}
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full border p-2 rounded-sm focus:ring-1 focus:ring-[#ff6b35] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mức ưu tiên</label>
              <select 
                value={formData.priorityLevel} 
                onChange={e => setFormData({...formData, priorityLevel: e.target.value})} 
                className="w-full border p-2 rounded-sm outline-none"
              >
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Giá (VNĐ) - 0 hoặc {'>'}= 10,000</label>
              <input 
                required 
                type="number" 
                min="0"
                placeholder="Ví dụ: 0 hoặc 10000"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                className="w-full border p-2 rounded-sm focus:ring-1 focus:ring-[#ff6b35] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Thời hạn (Ngày)</label>
              <input 
                required 
                type="number" 
                min="1" 
                max="365" 
                value={formData.durationDays} 
                onChange={e => setFormData({...formData, durationDays: e.target.value})} 
                className="w-full border p-2 rounded-sm focus:ring-1 focus:ring-[#ff6b35] outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full border p-2 rounded-sm h-24 outline-none"
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-[#ff6b35] text-white px-6 py-2 rounded-sm font-bold">Lưu gói</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-sm font-bold">Hủy</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-bold text-gray-700">Tên gói</th>
              <th className="p-4 font-bold text-gray-700 text-center">Level</th>
              <th className="p-4 font-bold text-gray-700">Giá</th>
              <th className="p-4 font-bold text-gray-700 text-center">Thời hạn</th>
              <th className="p-4 font-bold text-gray-700 text-center">Trạng thái</th>
              <th className="p-4 font-bold text-gray-700 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{pkg.name}</td>
                <td className="p-4 text-center">
                   <span className={`font-bold ${pkg.priorityLevel === 'PLATINUM' ? 'text-purple-600' : pkg.priorityLevel === 'GOLD' ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {pkg.priorityLevel}
                   </span>
                </td>
                <td className="p-4 font-bold text-orange-600">
                  {pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()} đ`}
                </td>
                <td className="p-4 text-center">{pkg.durationDays} ngày</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pkg.isActive ? 'Hoạt động' : 'Đã ẩn'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDelete(pkg.id)} 
                    className="text-red-500 hover:text-red-700 material-symbols-outlined"
                    title="Xóa gói"
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packages.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-500 italic">Chưa có gói ưu tiên nào được tạo.</div>
        )}
      </div>
    </div>
  )
}