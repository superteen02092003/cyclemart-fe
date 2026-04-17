import { useState, useEffect } from 'react'
import { priorityService } from '@/services/priority'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

// Cấu hình UI cho từng cấp độ ưu tiên
const LEVEL_CONFIG = {
  PLATINUM: {
    bg: 'bg-gradient-to-b from-amber-50 to-white',
    text: 'text-amber-600',
    icon: 'diamond',
    badge: 'Ưu tiên Cao nhất',
    border: 'border-amber-400 shadow-amber-500/20 shadow-xl scale-105 z-10' // Phóng to & bóng đổ nổi bật
  },
  GOLD: {
    bg: 'bg-white',
    text: 'text-[#ff6b35]', // Màu cam thương hiệu
    icon: 'workspace_premium',
    badge: 'Nổi bật',
    border: 'border-[#ff6b35]/50 hover:border-[#ff6b35] shadow-sm'
  },
  SILVER: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    icon: 'star',
    badge: 'Cơ bản',
    border: 'border-border-light hover:border-slate-400 shadow-sm'
  }
}

// Fallback phòng hờ trường hợp data lỗi
const DEFAULT_CONFIG = { ...LEVEL_CONFIG.SILVER }

export default function SubscribeModal({ postId, onClose }) {
  const [activePackages, setActivePackages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    priorityService.getActivePackages().then((data) => {
      // Sắp xếp tự động: PLATINUM (1) -> GOLD (2) -> SILVER (3)
      const sorted = [...data].sort((a, b) => {
        const order = { PLATINUM: 1, GOLD: 2, SILVER: 3 }
        return (order[a.priorityLevel] || 99) - (order[b.priorityLevel] || 99)
      })
      setActivePackages(sorted)
    })
  }, [])

  const handleSubscribe = async (packageId) => {
    try {
      setLoading(true)
      await priorityService.subscribePost(postId, packageId)
      alert('Đăng ký gói thành công! Bài viết của bạn đã được ưu tiên hiển thị.')
      
      // Gọi callback onClose (và lý tưởng là truyền thêm tín hiệu onSuccess để refetch data bên ngoài)
      if (typeof onClose === 'function') {
        onClose(true) // true = success
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi đăng ký gói')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between sticky top-0 bg-white z-20">
          <div>
            <h2 className="text-xl font-bold text-content-primary">Nâng cấp bài đăng</h2>
            <p className="text-sm text-content-secondary mt-0.5">Tiếp cận khách hàng nhanh gấp 3 lần với các gói ưu tiên.</p>
          </div>
          <button
            onClick={() => onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary text-content-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[1.2rem]">close</span>
          </button>
        </div>

        {/* Content (Danh sách gói) */}
        <div className="p-6 overflow-y-auto">
          {activePackages.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-content-tertiary mb-2">inventory_2</span>
              <p className="text-content-secondary">Hiện tại chưa có gói ưu tiên nào đang hoạt động.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-4 px-2">
              {activePackages.map((pkg) => {
                const config = LEVEL_CONFIG[pkg.priorityLevel] || DEFAULT_CONFIG

                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative rounded-xl border p-6 flex flex-col h-full transition-all duration-300",
                      config.bg,
                      config.border
                    )}
                  >
                    {/* Ruy băng "Khuyên dùng" cho gói PLATINUM */}
                    {pkg.priorityLevel === 'PLATINUM' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[0.65rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                        Khuyên dùng
                      </div>
                    )}

                    {/* Huy hiệu Cấp bậc */}
                    <div className={cn("flex items-center gap-1.5 mb-4", config.text)}>
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {config.icon}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {config.badge}
                      </span>
                    </div>

                    {/* Tên & Mô tả */}
                    <h3 className="font-bold text-xl text-content-primary mb-2 leading-tight">{pkg.name}</h3>
                    <p className="text-sm text-content-secondary mb-6 flex-grow">{pkg.description}</p>

                    {/* Giá & Thời hạn */}
                    <div className="mt-auto pt-4 border-t border-black/5">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={cn(
                          "text-2xl font-bold", 
                          pkg.priorityLevel === 'PLATINUM' ? 'text-amber-600' : 'text-content-primary'
                        )}>
                          {formatPrice(pkg.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-content-secondary mb-5">
                        <span className="material-symbols-outlined text-[1rem]">schedule</span>
                        Thời hạn: <span className="font-semibold text-content-primary">{pkg.durationDays} ngày</span>
                      </div>

                      {/* Nút Mua */}
                      <button
                        onClick={() => handleSubscribe(pkg.id)}
                        disabled={loading}
                        className={cn(
                          "w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                          pkg.priorityLevel === 'PLATINUM'
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg"
                            : pkg.priorityLevel === 'GOLD'
                              ? "bg-[#ff6b35] hover:bg-[#e05a2b] text-white"
                              : "bg-slate-800 hover:bg-slate-900 text-white"
                        )}
                      >
                        {loading ? 'Đang xử lý...' : 'Đăng ký gói này'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}