import { useState, useEffect } from 'react'
import { priorityService } from '@/services/priority'
import api from '@/services/api'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom' // THÊM IMPORTS

const LEVEL_CONFIG = {
  PLATINUM: { bg: 'bg-gradient-to-b from-amber-50 to-white', text: 'text-amber-600', icon: 'diamond', badge: 'Ưu tiên Cao nhất', border: 'border-amber-400 shadow-amber-500/20 shadow-xl scale-105 z-10' },
  GOLD: { bg: 'bg-white', text: 'text-[#ff6b35]', icon: 'workspace_premium', badge: 'Nổi bật', border: 'border-[#ff6b35]/50 hover:border-[#ff6b35] shadow-sm' },
  SILVER: { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'star', badge: 'Cơ bản', border: 'border-border-light hover:border-slate-400 shadow-sm' }
}

const DEFAULT_CONFIG = { ...LEVEL_CONFIG.SILVER }

export default function SubscribeModal({ postId, onClose }) {
  const navigate = useNavigate()
  const [activePackages, setActivePackages] = useState([])
  const [loading, setLoading] = useState(false)
  
  // States cho modal thanh toán
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [isProcessingMock, setIsProcessingMock] = useState(false)

  useEffect(() => {
    priorityService.getActivePackages().then((data) => {
      const sorted = [...data].sort((a, b) => {
        const order = { PLATINUM: 1, GOLD: 2, SILVER: 3 }
        return (order[a.priorityLevel] || 99) - (order[b.priorityLevel] || 99)
      })
      setActivePackages(sorted)
    })
  }, [])

  const handleSubscribe = async (pkg) => {
    try {
      setLoading(true)
      const subRes = await priorityService.subscribePost(postId, pkg.id)

      if (pkg.price === 0) {
        alert('Đăng ký gói miễn phí thành công! Bài viết của bạn đã được ưu tiên hiển thị.')
        onClose()
        window.location.reload()
      } else {
        const paymentData = {
          bikePostId: postId,
          amount: pkg.price,
          description: `Thanh toán ${pkg.name}`,
          type: "PRIORITY_PACKAGE",
          referenceId: subRes.id,
          name: "Khách hàng CycleMart",
          phone: "0999999999",
          address: "Thanh toán gói ưu tiên"
        }

        const paymentRes = await api.post('/v1/payments/create', paymentData)

        if (paymentRes.data) {
          setPaymentResponse({
            ...paymentRes.data,
            amount: pkg.price,
            orderId: paymentRes.data.orderId,
            paymentUrl: paymentRes.data.paymentUrl
          })
          setShowPaymentOptions(true) // Bật bảng tùy chọn thay vì qua VNPay liền
        } else {
          alert('Không thể tạo mã thanh toán lúc này.')
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Lỗi khi đăng ký gói')
    } finally {
      setLoading(false)
    }
  }

  const mockIPNRequest = async (responseCode) => {
    try {
      setIsProcessingMock(true);
      
      // 1. KHAI BÁO BIẾN mockData
      const mockData = {
        vnp_Amount: paymentResponse.amount * 100,
        vnp_BankCode: 'NCB',
        vnp_OrderInfo: paymentResponse.description || 'Mua goi uu tien CycleMart',
        vnp_ResponseCode: responseCode,
        vnp_TransactionNo: '99999999',
        vnp_TxnRef: paymentResponse.orderId,
        vnp_SecureHash: 'mock_hash_test'
      };

      // 2. GỌI API
      await api.get('/v1/payments/vnpay/return', { params: mockData });
      
      // 3. ĐIỀU HƯỚNG
      if (responseCode === '00') {
        navigate(`/payment-success?orderId=${paymentResponse.orderId}&type=PRIORITY_PACKAGE`);
      } else {
        navigate(`/payment-failure?reason=Giao dịch mua gói bị hủy bỏ (Demo)`);
      }
    } catch (error) {
      alert('Lỗi giả lập thanh toán: ' + error.message);
    } finally {
      setIsProcessingMock(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between sticky top-0 bg-white z-20">
            <div>
              <h2 className="text-xl font-bold text-content-primary">Nâng cấp bài đăng</h2>
              <p className="text-sm text-content-secondary mt-0.5">Tiếp cận khách hàng nhanh gấp 3 lần với các gói ưu tiên.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary text-content-secondary transition-colors">
              <span className="material-symbols-outlined text-[1.2rem]">close</span>
            </button>
          </div>

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
                    <div key={pkg.id} className={cn("relative rounded-xl border p-6 flex flex-col h-full transition-all duration-300", config.bg, config.border)}>
                      {pkg.priorityLevel === 'PLATINUM' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[0.65rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">Khuyên dùng</div>
                      )}
                      <div className={cn("flex items-center gap-1.5 mb-4", config.text)}>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wide">{config.badge}</span>
                      </div>
                      <h3 className="font-bold text-xl text-content-primary mb-2 leading-tight">{pkg.name}</h3>
                      <p className="text-sm text-content-secondary mb-6 flex-grow">{pkg.description}</p>
                      <div className="mt-auto pt-4 border-t border-black/5">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className={cn("text-2xl font-bold", pkg.priorityLevel === 'PLATINUM' ? 'text-amber-600' : 'text-content-primary')}>{formatPrice(pkg.price)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-content-secondary mb-5">
                          <span className="material-symbols-outlined text-[1rem]">schedule</span>Thời hạn: <span className="font-semibold text-content-primary">{pkg.durationDays} ngày</span>
                        </div>
                        <button onClick={() => handleSubscribe(pkg)} disabled={loading} className={cn("w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed", pkg.priorityLevel === 'PLATINUM' ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-md" : pkg.priorityLevel === 'GOLD' ? "bg-[#ff6b35] hover:bg-[#e05a2b] text-white" : "bg-slate-800 hover:bg-slate-900 text-white")}>
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

      {/* 🔥 MODAL LỰA CHỌN PHƯƠNG THỨC THANH TOÁN (CÓ MOCK DATA) */}
      {showPaymentOptions && paymentResponse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-navy p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span> Chọn phương thức thanh toán
              </h3>
              <button onClick={() => setShowPaymentOptions(false)} className="hover:rotate-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 text-center space-y-5">
              <div className="space-y-1">
                <p className="text-xs text-content-tertiary uppercase font-bold tracking-widest">Số tiền thanh toán gói</p>
                <p className="text-3xl font-black text-[#ff6b35]">{formatPrice(paymentResponse.amount)}</p>
              </div>

              <div className="space-y-3">
                {/* Nút VNPay thật */}
                <button onClick={() => window.location.href = paymentResponse.paymentUrl} className="w-full py-3.5 bg-[#005BAA] hover:bg-[#004A8B] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                  <span className="material-symbols-outlined text-[1.2rem]">account_balance</span> Thanh toán VNPay (Thực tế)
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-light"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] text-content-tertiary font-bold uppercase tracking-wider">Khu vực Test (Tránh lỗi Sandbox)</span></div>
                </div>

                {/* Nút Mock thành công */}
                <button onClick={() => mockIPNRequest('00')} disabled={isProcessingMock} className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[1.2rem]">check_circle</span> Giả lập Thành công (00)
                </button>

                {/* Nút Mock thất bại */}
                <button onClick={() => mockIPNRequest('24')} disabled={isProcessingMock} className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[1.2rem]">cancel</span> Giả lập Thất bại (24)
                </button>
              </div>
              <button onClick={() => { setShowPaymentOptions(false); setPaymentResponse(null); }} className="text-sm font-semibold text-content-secondary hover:text-navy underline mt-4 inline-block">Hủy giao dịch</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}