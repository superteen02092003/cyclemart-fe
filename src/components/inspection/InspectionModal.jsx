import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // THÊM IMPORT NÀY
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'
import { inspectionService } from '@/services/inspection'
import { postService } from '@/services/post'
import api from '@/services/api'

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  PENDING:    { label: 'Chờ phân công',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ASSIGNED:   { label: 'Đã phân công',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INSPECTING: { label: 'Đang kiểm định', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  PASSED:     { label: 'Đã kiểm định',   color: 'bg-green-50 text-green-700 border-green-200' },
  FAILED:     { label: 'Cần sửa chữa',   color: 'bg-red-50 text-red-700 border-red-200' },
}

const STEPS = [
  { icon: 'assignment',        title: 'Đăng ký & Thanh toán', desc: 'Chọn xe, điền địa chỉ, thanh toán phí trước.' },
  { icon: 'person_pin_circle', title: 'Phân công Inspector',   desc: 'Admin gán nhân viên theo khu vực.' },
  { icon: 'search',            title: 'Kiểm định tại chỗ',     desc: 'Inspector kiểm tra theo checklist chuẩn.' },
  { icon: 'verified',          title: 'Nhận kết quả',          desc: 'Đạt → badge "Đã kiểm định". Không đạt → ghi lý do.' },
]

function RequestCard({ req }) {
  const cfg = STATUS_CONFIG[req.status] || { label: req.status, color: 'bg-gray-50 text-gray-700 border-gray-200' }
  
  return (
    <div className="bg-surface-secondary rounded-sm border border-border-light p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-content-primary leading-snug line-clamp-2">{req.postTitle}</h3>
        <span className={cn('flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.color)}>
          {cfg.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary mb-2">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[0.8rem]">location_on</span>
          {req.address}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[0.8rem]">schedule</span>
          {new Date(req.scheduledDateTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
        {req.inspectorName && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.8rem]">badge</span>
            {req.inspectorName}
          </span>
        )}
      </div>
      {req.status === 'PASSED' && req.resultNote && (
        <div className="flex items-start gap-1.5 bg-green-50 border border-green-200 rounded-sm px-3 py-2 mt-1">
          <span className="material-symbols-outlined text-green-600 text-[0.9rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <p className="text-xs text-green-800">{req.resultNote}</p>
        </div>
      )}
      {req.status === 'FAILED' && req.resultNote && (
        <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mt-1">
          <span className="material-symbols-outlined text-red-600 text-[0.9rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
          <p className="text-xs text-red-800">{req.resultNote}</p>
        </div>
      )}
    </div>
  )
}

export default function InspectionModal({ onClose, preselectedId }) {
  const navigate = useNavigate() // KHAI BÁO HOOK ĐIỀU HƯỚNG
  const [tab, setTab] = useState(preselectedId ? 'register' : 'register')
  const [requests, setRequests] = useState([])
  const [activeListings, setActiveListings] = useState([])
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [inspectionFee, setInspectionFee] = useState(0)

  const [form, setForm] = useState({ listingId: preselectedId || '', address: '', scheduledDateTime: '', note: '' })
  const [formStep, setFormStep] = useState(1)
  const [errors, setErrors] = useState({}) 

  // 🔥 MỚI: State cho modal thanh toán (Mock)
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [isProcessingMock, setIsProcessingMock] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await postService.getMyPosts()
        const posts = postRes?.content || postRes || []

        const reqRes = await inspectionService.getMyRequests({ page: 0, size: 100 })
        const requestsList = reqRes?.content || []

        const inspectedPostIds = requestsList
          .filter(r => r.status === 'PASSED') 
          .map(r => String(r.postId))

        const filtered = posts.filter(post => 
          post.postStatus === 'APPROVED' &&           
          !inspectedPostIds.includes(String(post.id)) 
        )

        setActiveListings(filtered)

        if (!form.listingId && filtered.length > 0) {
          setForm(prev => ({ ...prev, listingId: filtered[0].id }))
        }
      } catch (error) {
        console.error("Lỗi load dữ liệu:", error)
      }
    }

    const fetchGlobalFee = async () => {
      try {
        const fee = await inspectionService.getGlobalFee()
        setInspectionFee(fee)
      } catch (error) {
        console.error("Lỗi lấy giá tiền:", error)
        setInspectionFee(250000) 
      }
    }

    fetchData()
    fetchGlobalFee()
  }, [])

  useEffect(() => {
    if (tab === 'requests') {
      loadMyRequests()
    }
  }, [tab])

  const loadMyRequests = async () => {
    setLoading(true)
    try {
      const data = await inspectionService.getMyRequests({ page: 0, size: 50 })
      setRequests(data?.content || [])
    } catch (error) {
      console.error("Lỗi tải lịch sử yêu cầu:", error)
    } finally {
      setLoading(false)
    }
  }

  const selected = activeListings.find((l) => String(l.id) === String(form.listingId))

  const validateForm = () => {
    const newErrors = {}
    if (!form.listingId) newErrors.listingId = 'Vui lòng chọn xe cần kiểm định'
    if (!form.address || form.address.trim() === '') newErrors.address = 'Vui lòng nhập địa chỉ xem xe'
    
    if (!form.scheduledDateTime) {
      newErrors.scheduledDateTime = 'Vui lòng chọn ngày và giờ hẹn'
    } else {
      const selectedDate = new Date(form.scheduledDateTime)
      const now = new Date()
      if (selectedDate <= now) {
        newErrors.scheduledDateTime = 'Ngày giờ hẹn không được ở trong quá khứ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateForm()) {
      setFormStep(2)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      if (!selected) {
        alert('Vui lòng chọn một bài đăng để đăng ký kiểm định.')
        setLoading(false)
        return
      }

      let createdInspectionId = null;

      // 1. TẠO YÊU CẦU VÀ LẤY ID CỦA ĐƠN KIỂM ĐỊNH
      try {
        const reqRes = await inspectionService.createRequest({
          postId: selected.id,
          address: form.address,
          scheduledDateTime: form.scheduledDateTime,
          note: form.note
        })
        createdInspectionId = reqRes.id; // Lấy đúng ID đơn kiểm định
      } catch (error) {
        const msg = error.response?.data?.message || error.message
        if (!msg.includes('đang trong quá trình xử lý')) {
          alert(msg)
          setLoading(false)
          return
        }
        // Nếu đã có đơn rồi, chúng ta cần fetch lại để lấy ID của đơn đó (nếu muốn làm kỹ hơn)
        // Tạm thời báo lỗi để user biết
        alert("Xe này đang chờ xử lý kiểm định. Vui lòng kiểm tra tab 'Yêu cầu của tôi'.");
        setLoading(false);
        return;
      }

      // 2. TẠO LINK THANH TOÁN VỚI REFERENCE ID CHUẨN
      const actualFee = inspectionFee > 0 ? inspectionFee : 250000;
      const paymentData = {
        bikePostId: selected.id,   
        amount: actualFee, 
        description: `Thanh toán phí kiểm định xe`,
        type: "INSPECTION_FEE",
        referenceId: createdInspectionId, // 🔥 FIX QUAN TRỌNG: Gửi ID Kiểm định thay vì ID Bài đăng
        name: "Khách hàng CycleMart",
        phone: "0999999999",
        address: form.address
      }

      const paymentRes = await api.post('/v1/payments/create', paymentData)

      if (paymentRes.data) {
        localStorage.setItem('payment_intent', 'INSPECTION_FEE')
        setPaymentResponse({
          ...paymentRes.data,
          amount: actualFee,
          orderId: paymentRes.data.orderId,
          paymentUrl: paymentRes.data.paymentUrl,
          description: paymentData.description
        })
        setShowPaymentOptions(true)
      } else {
        alert('Không thể tạo mã thanh toán lúc này. Vui lòng thử lại sau.')
      }

    } catch (error) {
      console.error("Lỗi khi đăng ký kiểm định:", error)
      alert(error.response?.data?.message || error.message || 'Lỗi khi tạo yêu cầu thanh toán kiểm định')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 MỚI: Hàm xử lý Mock Data IPN
  const mockIPNRequest = async (responseCode) => {
    try {
      setIsProcessingMock(true);
      
      const mockData = {
        vnp_Amount: paymentResponse.amount * 100,
        vnp_BankCode: 'NCB',
        vnp_OrderInfo: paymentResponse.description || 'Thanh toan phi kiem dinh',
        vnp_ResponseCode: responseCode,
        vnp_TransactionNo: '99999999',
        vnp_TxnRef: paymentResponse.orderId,
        vnp_SecureHash: 'mock_hash_test'
      };

      await api.get('/v1/payments/vnpay/return', { params: mockData });
      
      if (responseCode === '00') {
        navigate(`/payment-success?orderId=${paymentResponse.orderId}&type=INSPECTION_FEE`);
        onClose(); // Đóng modal hiện tại
      } else {
        navigate(`/payment-failure?reason=Giao dịch thanh toán phí kiểm định thất bại (Demo)`);
        onClose();
      }
    } catch (error) {
      alert('Lỗi giả lập thanh toán: ' + error.message);
    } finally {
      setIsProcessingMock(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0 bg-surface">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-navy text-[1.3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <h2 className="text-base font-bold text-content-primary uppercase tracking-wide">Dịch vụ Kiểm định xe</h2>
            </div>
            <button onClick={onClose} className="text-content-tertiary hover:text-content-primary transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border-light flex-shrink-0 bg-white">
            {[
              { key: 'register', label: 'Đăng ký mới', icon: 'add_circle' },
              { key: 'requests', label: `Yêu cầu của tôi`, icon: 'list_alt' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors',
                  tab === t.key
                    ? 'border-navy text-navy'
                    : 'border-transparent text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
                )}
              >
                <span className="material-symbols-outlined text-[1rem]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-sm font-medium text-green-800 flex-shrink-0 shadow-sm animate-fade-in">
              <span className="material-symbols-outlined text-green-600 text-[1.2rem]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {toast}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1 bg-white">
            {/* ── Tab: Đăng ký mới ── */}
            {tab === 'register' && (
              <div className="px-6 py-5 space-y-6">
                {/* How it works */}
                <div className="grid grid-cols-4 gap-4">
                  {STEPS.map((s, i) => (
                    <div key={i} className="text-center relative pt-4 group">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-navy text-white text-[0.7rem] font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </div>
                      <span className="material-symbols-outlined text-navy/80 text-[1.8rem] group-hover:text-[#ff6b35] transition-colors mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                      <p className="text-xs font-bold text-content-primary mt-2 mb-1 leading-tight">{s.title}</p>
                      <p className="text-[0.7rem] text-content-secondary leading-relaxed px-1">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <hr className="border-border-light" />

                {/* Form step 1 */}
                {formStep === 1 && (
                  <div className="space-y-5">
                    {/* Bike */}
                    <div>
                      <label className="block text-sm font-bold text-content-primary mb-1.5 uppercase tracking-wide">
                        1. Chọn xe cần kiểm định <span className="text-error">*</span>
                      </label>
                      {activeListings.length === 0 ? (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-4 py-3">
                          Bạn chưa có bài đăng nào. Hãy đăng bán xe trước khi yêu cầu kiểm định nhé!
                        </p>
                      ) : (
                        <>
                          <select
                            value={form.listingId}
                            onChange={(e) => {
                              setForm({ ...form, listingId: e.target.value })
                              if(errors.listingId) setErrors({...errors, listingId: null})
                            }}
                            className={cn(
                              "w-full border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors bg-white",
                              errors.listingId ? "border-error focus:border-error focus:ring-error bg-red-50" : "border-border-light focus:border-navy focus:ring-navy"
                            )}
                          >
                            <option value="">-- Chọn bài đăng của bạn --</option>
                            {activeListings.map((l) => (
                              <option key={l.id} value={l.id}>{l.title} — {formatPrice(l.price)}</option>
                            ))}
                          </select>
                          {errors.listingId && <p className="text-xs text-error mt-1">{errors.listingId}</p>}
                        </>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-bold text-content-primary mb-1.5 uppercase tracking-wide">
                        2. Địa chỉ xem xe <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP. HCM"
                        value={form.address}
                        onChange={(e) => {
                          setForm({ ...form, address: e.target.value })
                          if(errors.address) setErrors({...errors, address: null})
                        }}
                        className={cn(
                          "w-full border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors",
                          errors.address ? "border-error focus:border-error focus:ring-error bg-red-50" : "border-border-light focus:border-navy focus:ring-navy"
                        )}
                      />
                      {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
                    </div>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-sm font-bold text-content-primary mb-1.5 uppercase tracking-wide">
                        3. Ngày & Giờ mong muốn <span className="text-error">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={form.scheduledDateTime}
                        onChange={(e) => {
                          setForm({ ...form, scheduledDateTime: e.target.value })
                          if(errors.scheduledDateTime) setErrors({...errors, scheduledDateTime: null})
                        }}
                        className={cn(
                          "w-full border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors",
                          errors.scheduledDateTime ? "border-error focus:border-error focus:ring-error bg-red-50" : "border-border-light focus:border-navy focus:ring-navy"
                        )}
                      />
                      {errors.scheduledDateTime && <p className="text-xs text-error mt-1">{errors.scheduledDateTime}</p>}
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-sm font-bold text-content-primary mb-1.5 uppercase tracking-wide">
                        4. Ghi chú <span className="text-content-tertiary font-normal normal-case">(tuỳ chọn)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="VD: Gọi điện cho tôi trước khi đến 30 phút..."
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        className="w-full border border-border-light rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-none transition-colors"
                      />
                    </div>

                    {/* Fee */}
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3">
                      <span className="material-symbols-outlined text-blue-600 text-[1.2rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Phí dịch vụ kiểm định: <strong className="text-lg">{formatPrice(inspectionFee)}</strong>.
                        Nhân viên của chúng tôi sẽ gọi điện xác nhận lại thời gian cụ thể với bạn.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form step 2: confirm */}
                {formStep === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <p className="text-sm font-semibold text-content-primary">Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu:</p>
                    <div className="bg-surface rounded-sm border border-border-light divide-y divide-border-light shadow-sm">
                      {[
                        { label: 'Xe cần kiểm định', value: selected?.title },
                        { label: 'Địa chỉ xem xe', value: form.address },
                        { label: 'Thời gian', value: form.scheduledDateTime ? new Date(form.scheduledDateTime).toLocaleString('vi-VN') : '' },
                        { label: 'Phí dịch vụ', value: formatPrice(inspectionFee) } 
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between px-4 py-3 text-sm">
                          <span className="text-content-secondary font-medium">{label}</span>
                          <span className="font-bold text-content-primary text-right max-w-[60%]">{value}</span>
                        </div>
                      ))}
                    </div>
                    {form.note && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm">
                        <p className="text-sm text-amber-800 italic"><strong>Ghi chú:</strong> {form.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Yêu cầu của tôi ── */}
            {tab === 'requests' && (
              <div className="px-6 py-5 bg-surface min-h-[300px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full py-20 text-content-secondary">
                    Đang tải dữ liệu...
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="material-symbols-outlined text-content-tertiary mb-4 text-[4rem]" style={{ fontVariationSettings: "'FILL' 0" }}>search_off</span>
                    <p className="text-lg font-bold text-content-primary mb-2">Chưa có yêu cầu nào</p>
                    <p className="text-sm text-content-secondary mb-6 max-w-sm">Hãy đăng ký dịch vụ kiểm định để tăng gấp 3 lần tỷ lệ bán được xe của bạn.</p>
                    <button
                      onClick={() => setTab('register')}
                      className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white rounded-sm hover:shadow-md transition-all"
                      style={{ backgroundColor: '#ff6b35' }}
                    >
                      <span className="material-symbols-outlined text-[1.1rem]">add</span>
                      Đăng ký ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => <RequestCard key={req.id} req={req} />)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {tab === 'register' && (
            <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3 flex-shrink-0 bg-surface">
              {formStep === 2 && (
                <button
                  onClick={() => setFormStep(1)}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-bold border border-border-light rounded-sm text-content-primary hover:bg-surface-secondary transition-colors"
                >
                  Quay lại sửa
                </button>
              )}
              <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-bold border border-border-light rounded-sm text-content-secondary hover:bg-surface-secondary transition-colors">
                Đóng
              </button>
              {formStep === 1 ? (
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-sm transition-all"
                  style={{ backgroundColor: '#1e3a5f' }}
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-sm hover:shadow-md transition-all flex items-center gap-2"
                  style={{ backgroundColor: '#ff6b35' }}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận Gửi yêu cầu'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 MODAL LỰA CHỌN PHƯƠNG THỨC THANH TOÁN (CÓ MOCK DATA) */}
      {showPaymentOptions && paymentResponse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                <p className="text-xs text-content-tertiary uppercase font-bold tracking-widest">Phí kiểm định</p>
                <p className="text-3xl font-black text-[#ff6b35]">{formatPrice(paymentResponse.amount)}</p>
                <p className="text-xs text-content-secondary mt-1">Mã tham chiếu: {paymentResponse.orderId}</p>
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