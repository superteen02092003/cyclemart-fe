// src/components/seller/SubscribeModal.jsx
import { useState, useEffect } from 'react'
import { priorityService } from '@/services/priority'

// Truyền vào postId của bài đăng mà Seller muốn đẩy tin
export default function SubscribeModal({ postId, onClose }) {
  const [activePackages, setActivePackages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Lấy các gói đang Active do Admin tạo
    priorityService.getActivePackages().then(setActivePackages)
  }, [])

  const handleSubscribe = async (packageId) => {
    try {
      setLoading(true)
      await priorityService.subscribePost(postId, packageId)
      alert('Đăng ký gói thành công! Bài viết của bạn đã được ưu tiên hiển thị.')
      onClose() // Đóng modal
    } catch (error) {
      alert(error.message || 'Lỗi khi đăng ký gói')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold">X</button>
        
        <h2 className="text-xl font-bold mb-2">Đẩy tin / Nâng cấp bài đăng</h2>
        <p className="text-sm text-gray-500 mb-6">Chọn một gói ưu tiên dưới đây để tiếp cận được nhiều khách hàng hơn.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activePackages.map(pkg => (
            <div key={pkg.id} className="border rounded-sm p-4 text-center hover:border-[#ff6b35] transition-colors cursor-pointer flex flex-col">
              <h3 className="font-bold text-lg">{pkg.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">{pkg.description}</p>
              
              <div className="mt-auto">
                <div className="text-xl font-bold text-[#ff6b35] mb-1">
                  {pkg.price.toLocaleString()} đ
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Sử dụng trong {pkg.durationDays} ngày
                </div>
                
                <button 
                  onClick={() => handleSubscribe(pkg.id)}
                  disabled={loading}
                  className="w-full bg-[#ff6b35] text-white py-2 rounded-sm text-sm font-semibold hover:bg-[#e05a2b]"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {activePackages.length === 0 && (
          <p className="text-center text-gray-500">Hiện tại chưa có gói ưu tiên nào.</p>
        )}
      </div>
    </div>
  )
}