import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import InspectionModal from '@/components/inspection/InspectionModal'
import { postService } from '@/services/post'
import { categoryService } from '@/services/category'
import api from '@/services/api' // 🔥 Đã thêm import api

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Thông số kỹ thuật' },
  { id: 3, label: 'Giá & Vị trí' },
  { id: 4, label: 'Hình ảnh' },
]

const YEARS = Array.from({ length: 12 }, (_, i) => 2026 - i)

const BRANDS = [
  'GIANT', 'TREK', 'SPECIALIZED', 'CANNONDALE', 'SCOTT', 'MERIDA', 'BIANCHI', 'PINARELLO', 
  'CERVELO', 'COLNAGO', 'BMC', 'ORBEA', 'CUBE', 'FOCUS', 'CANYON', 'SANTA_CRUZ', 
  'THONG_NHAT', 'ASAMA', 'FORNIX', 'OTHER'
]

const CONDITIONS = [
  { value: 'NEW', label: 'Mới 100%' },
  { value: 'LIKE_NEW', label: 'Như mới (>90%)' },
  { value: 'GOOD', label: 'Tốt (70-90%)' },
  { value: 'USED', label: 'Đã dùng (50-70%)' },
  { value: 'NEED_REPAIR', label: 'Cần sửa (<50%)' },
]

const FRAME_MATERIALS = ['CARBON', 'ALUMINUM', 'STEEL', 'TITANIUM', 'ALLOY', 'CHROMOLY']
const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'SIZE_47', 'SIZE_49', 'SIZE_51', 'SIZE_53', 'SIZE_55', 'SIZE_57', 'SIZE_59', 'SIZE_61']
const BRAKE_TYPES = ['DISC_HYDRAULIC', 'DISC_MECHANICAL', 'RIM_BRAKE', 'V_BRAKE', 'CANTILEVER']
const GROUPSETS = [
  'SHIMANO_DURA_ACE', 'SHIMANO_ULTEGRA', 'SHIMANO_105', 'SHIMANO_TIAGRA', 'SHIMANO_SORA', 
  'SHIMANO_CLARIS', 'SHIMANO_XTR', 'SHIMANO_XT', 'SHIMANO_SLX', 'SHIMANO_DEORE', 
  'SRAM_RED', 'SRAM_FORCE', 'SRAM_RIVAL', 'SRAM_APEX', 'CAMPAGNOLO_SUPER_RECORD', 
  'CAMPAGNOLO_RECORD', 'CAMPAGNOLO_CHORUS', 'OTHER'
]

const CITIES = ['HO_CHI_MINH']
const DISTRICTS = [
  'QUAN_1', 'QUAN_2', 'QUAN_3', 'QUAN_4', 'QUAN_5', 'QUAN_6', 'QUAN_7', 'QUAN_8', 
  'QUAN_9', 'QUAN_10', 'QUAN_11', 'QUAN_12', 'QUAN_BINH_THANH', 'QUAN_GO_VAP', 
  'QUAN_PHU_NHUAN', 'QUAN_TAN_BINH', 'QUAN_TAN_PHU', 'QUAN_THU_DUC', 'HUYEN_BINH_CHANH', 
  'HUYEN_CAN_GIO', 'HUYEN_CU_CHI', 'HUYEN_HOC_MON', 'HUYEN_NHA_BE'
]

const MOCK_UPLOADED = [
  { id: 'img1', label: 'Ảnh tổng thể xe' },
  { id: 'img2', label: 'Ảnh khung sườn' },
  { id: 'img3', label: 'Ảnh groupset / hệ truyền động' },
]

const inputClass =
  'w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors'
const inputErrorClass = 
  'w-full px-3 py-2.5 border border-error rounded-sm focus:outline-none focus:border-error text-sm transition-colors'
const labelClass = 'block text-sm font-medium text-content-primary mb-1.5'
const hintClass = 'text-xs text-content-secondary mt-1'

function ProgressBar({ currentStep, steps }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-0 relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border-light z-0" />
        {steps.map((step, idx) => {
          const done = step.id < currentStep
          const active = step.id === currentStep
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                  done
                    ? 'bg-navy border-navy text-white'
                    : active
                      ? 'border-orange-500 bg-white text-orange-500'
                      : 'bg-white border-border-light text-content-secondary'
                )}
                style={active ? { borderColor: '#ff6b35', color: '#ff6b35' } : {}}
              >
                {done ? (
                  <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 text-center hidden sm:block',
                  active ? 'font-semibold text-content-primary' : 'text-content-secondary'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="sm:hidden text-center text-sm font-semibold text-content-primary mt-3">
        Bước {currentStep}: {steps[currentStep - 1]?.label}
      </p>
    </div>
  )
}

export default function SellPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [draftSaved, setDraftSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showInspection, setShowInspection] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [createdPostId, setCreatedPostId] = useState(null) // 🔥 Đã thêm state này

  // Load categories từ API
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllChildren()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const [formData, setFormData] = useState({
    // Step 1
    title: '',
    categoryId: '',
    brand: '',
    model: '',
    year: '',
    status: '', // condition -> status
    // Step 2
    frameMaterial: '',
    frameSize: '',
    brakeType: '',
    groupset: '',
    mileage: '',
    description: '',
    // Step 3
    price: '',
    allowNegotiation: false, // isNegotiable -> allowNegotiation
    city: 'HO_CHI_MINH', // Default to HCM
    district: '',
    // Step 4 & 5 (Kiểm định)
    requestInspection: false,
    inspectionAddress: '',
    inspectionScheduledDate: '',
    inspectionNote: ''
  })

  // Động lực hoá số bước: Nếu tick kiểm định thì có thêm bước 5
  const dynamicSteps = formData.requestInspection 
    ? [...STEPS, { id: 5, label: 'ĐK Kiểm định' }] 
    : STEPS;
  const totalSteps = dynamicSteps.length;

  // Helper function to get input class based on validation
  const getInputClass = (fieldName, isRequired = false) => {
    if (!isRequired) return inputClass
    
    const isEmpty = !formData[fieldName] || (fieldName === 'description' && formData[fieldName].length < 50)
    return isEmpty ? inputErrorClass : inputClass
  }

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handleNext = () => {
    // Validate current step before moving to next
    const errors = []
    
    if (currentStep === 1) {
      if (!formData.title) errors.push('Tiêu đề tin đăng')
      if (!formData.categoryId) errors.push('Loại xe')
      if (!formData.brand) errors.push('Thương hiệu')
      if (!formData.model) errors.push('Model/Tên xe')
      if (!formData.year) errors.push('Năm sản xuất')
      if (!formData.status) errors.push('Tình trạng xe')
    } else if (currentStep === 2) {
      if (!formData.description || formData.description.length < 50) {
        errors.push('Mô tả chi tiết (tối thiểu 50 ký tự)')
      }
    } else if (currentStep === 3) {
      if (!formData.price) errors.push('Giá niêm yết')
      if (!formData.district) errors.push('Quận/Huyện')
    }

    if (errors.length > 0) {
      const errorMessage = `Vui lòng điền đầy đủ thông tin bước ${currentStep}:\n\n${errors.map(error => `• ${error}`).join('\n')}`
      alert(errorMessage)
      return
    }

    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }
  
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSaveDraft = () => {
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields với thông báo cụ thể
      const errors = []
      
      if (!formData.title) errors.push('Tiêu đề tin đăng')
      if (!formData.categoryId) errors.push('Loại xe')
      if (!formData.brand) errors.push('Thương hiệu')
      if (!formData.model) errors.push('Model/Tên xe')
      if (!formData.year) errors.push('Năm sản xuất')
      if (!formData.status) errors.push('Tình trạng xe')
      if (!formData.description || formData.description.length < 50) {
        errors.push('Mô tả chi tiết (tối thiểu 50 ký tự)')
      }
      if (!formData.price) errors.push('Giá niêm yết')
      if (!formData.district) errors.push('Quận/Huyện')
      
      // Validate bước 5 (Kiểm định)
      if (formData.requestInspection) {
        if (!formData.inspectionAddress) errors.push('Địa chỉ xem xe (Kiểm định)')
        if (!formData.inspectionScheduledDate) {
          errors.push('Ngày & Giờ hẹn (Kiểm định)')
        } else if (new Date(formData.inspectionScheduledDate) <= new Date()) {
          errors.push('Ngày hẹn kiểm định không được ở trong quá khứ')
        }
      }

      if (errors.length > 0) {
        const errorMessage = `Vui lòng điền đầy đủ/hợp lệ thông tin:\n\n${errors.map(error => `• ${error}`).join('\n')}`
        alert(errorMessage)
        return
      }

      // Prepare data for API
      const postData = {
        ...formData,
        images: selectedImages,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        categoryId: parseInt(formData.categoryId)
      }

      // 🔥 FIX LỖI 400 BAD REQUEST: Xử lý dữ liệu Ngày tháng & Chuỗi rỗng cho Backend Java
      if (!formData.requestInspection) {
        // Nếu không kiểm định, bắt buộc gán null để Java không bị lỗi parse chuỗi rỗng ""
        postData.inspectionAddress = null;
        postData.inspectionScheduledDate = null;
        postData.inspectionNote = null;
      } else if (postData.inspectionScheduledDate && postData.inspectionScheduledDate.length === 16) {
        // Nếu có kiểm định, phải nối thêm số giây (":00") để khớp định dạng LocalDateTime của Java
        postData.inspectionScheduledDate = postData.inspectionScheduledDate + ':00';
      }

      // Dọn dẹp các trường rỗng khác (vd: groupset, frameSize...) thành null để tránh lỗi Enum Backend
      Object.keys(postData).forEach(key => {
        if (postData[key] === '') {
          postData[key] = null;
        }
      });

      console.log('📝 Creating post:', postData)
      const response = await postService.create(postData)
      const newPostId = response.id || response.data?.id; // Lấy ID bài vừa tạo
      setCreatedPostId(newPostId)

      // 🔥 KỊCH BẢN 1: Nếu người dùng có tick chọn kiểm định, gọi thanh toán VNPay
      if (formData.requestInspection && newPostId) {
        try {
          const paymentData = {
            bikePostId: newPostId,
            amount: 250000, // Giá phí kiểm định (Bạn có thể đổi số này)
            description: `Thanh toán phí kiểm định xe`,
            type: "INSPECTION_FEE",         // Báo cho BE biết đây là kiểm định
            referenceId: newPostId,         // Truyền ID bài đăng lên làm Reference
            name: "Khách hàng CycleMart",
            phone: "0999999999",
            address: "Thanh toán kiểm định"
          }

          const paymentRes = await api.post('/v1/payments/create', paymentData)

          if (paymentRes.data?.paymentUrl) {
            localStorage.setItem('payment_intent', 'INSPECTION_FEE')
            window.location.href = paymentRes.data.paymentUrl 
            return; // Dừng tại đây để web chuyển trang sang VNPay
          }
        } catch (payError) {
          console.error("Lỗi tạo thanh toán", payError)
          alert("Lỗi tạo thanh toán kiểm định. Tin của bạn đã được đăng, bạn có thể thanh toán sau trong mục Quản lý tin đăng.")
        }
      }

      // 🔥 KỊCH BẢN 2: Nếu không kiểm định, hiện trang Success như bình thường
      setSubmitted(true)
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error.response?.data?.message || error.message || 'Lỗi khi tạo bài đăng')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validFiles = []
    const errors = []

    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 5MB/ảnh.`)
      } else if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} không phải là file ảnh.`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(`Một số file không hợp lệ:\n\n${errors.join('\n')}`)
    }

    if (validFiles.length > 0) {
      setSelectedImages(prev => {
        const newImages = [...prev, ...validFiles]
        if (newImages.length > 10) {
          alert('Tối đa 10 ảnh. Chỉ thêm được ' + (10 - prev.length) + ' ảnh nữa.')
          return [...prev, ...validFiles].slice(0, 10)
        }
        return newImages
      })
    }

    // Reset input để có thể chọn lại cùng file
    e.target.value = ''
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        {/* Success */}
        <div className="text-center mb-8">
          <span
            className="material-symbols-outlined mb-4"
            style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 1", color: '#10b981' }}
          >
            check_circle
          </span>
          <h2 className="text-2xl font-bold text-content-primary mb-3">Tin đăng đã gửi duyệt!</h2>
          <p className="text-sm text-content-secondary mb-2">
            Tin đăng của bạn đang chờ đội ngũ kiểm duyệt. Thường mất từ 24–48 giờ.
          </p>
          <p className="text-sm text-content-secondary mb-8">
            Bạn sẽ nhận thông báo khi tin được duyệt hoặc cần chỉnh sửa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={ROUTES.MY_LISTINGS}>
              <Button variant="primary">Xem tin đăng của tôi</Button>
            </Link>
            <Link to={ROUTES.BROWSE}>
              <Button variant="outline">Về trang mua xe</Button>
            </Link>
          </div>
        </div>

        {/* Nếu chưa chọn đăng ký kiểm định lúc tạo bài thì hiện upsell */}
        {!formData.requestInspection && (
          <div className="bg-white border border-border-light rounded-sm shadow-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-navy text-[1.2rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-content-primary mb-0.5">Tăng uy tín với kiểm định xe</p>
                <p className="text-xs text-content-secondary mb-3">
                  Xe được gắn badge <strong>"Đã kiểm định"</strong> giúp bán nhanh hơn và được giá hơn. Inspector đến tận nơi kiểm tra — chỉ <strong>{formatPrice(250000)}</strong>.
                </p>
                <button
                  onClick={() => setShowInspection(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-sm"
                  style={{ backgroundColor: '#ff6b35' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e05a2b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
                >
                  <span className="material-symbols-outlined text-[1rem]">add_circle</span>
                  Đăng ký kiểm định ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 Truyền postId vào Modal nếu người dùng click Upsell */}
        {showInspection && <InspectionModal postId={createdPostId} onClose={() => setShowInspection(false)} />}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary">Đăng tin bán xe</h1>
        <p className="text-sm text-content-secondary mt-1">Điền thông tin đầy đủ để thu hút người mua</p>
      </div>

      {/* Progress bar */}
      <ProgressBar currentStep={currentStep} steps={dynamicSteps} />

      {/* Draft saved notice */}
      {draftSaved && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green/10 border border-green/20 rounded-sm mb-4 text-sm text-green font-medium">
          <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span>
          Đã lưu nháp thành công!
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-sm border border-border-light shadow-card p-6 mb-6">

        {/* ── Step 1 ─────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Thông tin cơ bản
            </h2>

            <div>
              <label className={labelClass}>Tiêu đề tin đăng <span className="text-error">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={set('title')}
                placeholder="VD: Bán xe đạp Giant Defy Advanced 2 năm 2023"
                className={getInputClass('title', true)}
                required
              />
              {!formData.title && <p className="text-xs text-error mt-1">Vui lòng nhập tiêu đề tin đăng</p>}
            </div>

            <div>
              <label className={labelClass}>Loại xe <span className="text-error">*</span></label>
              <select value={formData.categoryId} onChange={set('categoryId')} className={getInputClass('categoryId', true)} required>
                <option value="">-- Chọn loại xe --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {!formData.categoryId && <p className="text-xs text-error mt-1">Vui lòng chọn loại xe</p>}
            </div>

            <div>
              <label className={labelClass}>Thương hiệu <span className="text-error">*</span></label>
              <select value={formData.brand} onChange={set('brand')} className={getInputClass('brand', true)} required>
                <option value="">-- Chọn thương hiệu --</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b.replace('_', ' ')}</option>
                ))}
              </select>
              {!formData.brand && <p className="text-xs text-error mt-1">Vui lòng chọn thương hiệu</p>}
            </div>

            <div>
              <label className={labelClass}>Model / Tên xe <span className="text-error">*</span></label>
              <input
                type="text"
                value={formData.model}
                onChange={set('model')}
                placeholder="Defy Advanced 2, Domane AL 4..."
                className={getInputClass('model', true)}
                required
              />
              {!formData.model && <p className="text-xs text-error mt-1">Vui lòng nhập tên model xe</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Năm sản xuất <span className="text-error">*</span></label>
                <select value={formData.year} onChange={set('year')} className={getInputClass('year', true)} required>
                  <option value="">-- Chọn năm --</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {!formData.year && <p className="text-xs text-error mt-1">Vui lòng chọn năm</p>}
              </div>
              <div>
                <label className={labelClass}>Tình trạng <span className="text-error">*</span></label>
                <select value={formData.status} onChange={set('status')} className={getInputClass('status', true)} required>
                  <option value="">-- Chọn --</option>
                  {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {!formData.status && <p className="text-xs text-error mt-1">Vui lòng chọn tình trạng</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 ─────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Thông số kỹ thuật
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Chất liệu khung</label>
                <select value={formData.frameMaterial} onChange={set('frameMaterial')} className={inputClass}>
                  <option value="">-- Chọn --</option>
                  {FRAME_MATERIALS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Size khung</label>
                <select value={formData.frameSize} onChange={set('frameSize')} className={inputClass}>
                  <option value="">-- Chọn --</option>
                  {FRAME_SIZES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Loại phanh</label>
                <select value={formData.brakeType} onChange={set('brakeType')} className={inputClass}>
                  <option value="">-- Chọn --</option>
                  {BRAKE_TYPES.map((b) => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Số km đã đi</label>
                <input
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={set('mileage')}
                  placeholder="VD: 1500"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Groupset / Hệ truyền động</label>
              <select value={formData.groupset} onChange={set('groupset')} className={inputClass}>
                <option value="">-- Chọn --</option>
                {GROUPSETS.map((g) => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Mô tả chi tiết <span className="text-error">*</span>
                <span className="ml-2 font-normal text-xs text-content-secondary">(tối thiểu 50 ký tự)</span>
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={set('description')}
                placeholder="Mô tả tình trạng xe, lịch sử sử dụng, lý do bán, phụ kiện kèm theo..."
                className={cn(getInputClass('description', true), 'resize-none')}
                minLength={50}
                required
              />
              <p className={cn(hintClass, formData.description.length < 50 ? 'text-error' : 'text-content-secondary')}>
                {formData.description.length}/50 ký tự tối thiểu
              </p>
              {formData.description.length < 50 && formData.description.length > 0 && (
                <p className="text-xs text-error mt-1">Mô tả cần ít nhất 50 ký tự</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3 ─────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Giá & Vị trí
            </h2>

            <div>
              <label className={labelClass}>Giá niêm yết (₫) <span className="text-error">*</span></label>
              <input
                type="number"
                min="100000"
                value={formData.price}
                onChange={set('price')}
                placeholder="VD: 28500000"
                className={getInputClass('price', true)}
                required
              />
              {formData.price && (
                <p className="text-sm font-semibold text-content-primary mt-1.5">
                  ≈ {formatPrice(Number(formData.price))}
                </p>
              )}
              {!formData.price && <p className="text-xs text-error mt-1">Vui lòng nhập giá bán</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowNegotiation}
                onChange={set('allowNegotiation')}
                className="w-4 h-4 rounded border-border-light accent-orange-500"
              />
              <span className="text-sm text-content-primary">Cho phép thương lượng giá</span>
            </label>

            <div>
              <label className={labelClass}>Thành phố <span className="text-error">*</span></label>
              <select value={formData.city} onChange={set('city')} className={inputClass} required>
                <option value="HO_CHI_MINH">TP. Hồ Chí Minh</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Quận/Huyện <span className="text-error">*</span></label>
              <select value={formData.district} onChange={set('district')} className={getInputClass('district', true)} required>
                <option value="">-- Chọn quận/huyện --</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d.replace('_', ' ').replace('QUAN', 'Quận').replace('HUYEN', 'Huyện')}</option>
                ))}
              </select>
              {!formData.district && <p className="text-xs text-error mt-1">Vui lòng chọn quận/huyện</p>}
            </div>
          </div>
        )}

        {/* ── Step 4 ─────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Hình ảnh
            </h2>

            {/* Upload zone */}
            <div>
              <label className={labelClass}>Ảnh xe (tùy chọn)</label>
              <div className="border-2 border-dashed border-border-light rounded-sm p-8 text-center hover:border-navy transition-colors cursor-pointer bg-surface-secondary">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span
                    className="material-symbols-outlined text-content-secondary mb-2"
                    style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 0" }}
                  >
                    add_photo_alternate
                  </span>
                  <p className="text-sm font-medium text-content-primary">Kéo thả ảnh vào đây</p>
                  <p className="text-xs text-content-secondary mt-1">hoặc click để chọn từ thiết bị</p>
                  <p className={cn(hintClass, 'mt-3')}>Tối đa 10 ảnh · JPG/PNG · Tối đa 5MB/ảnh</p>
                </label>
              </div>
            </div>

            {/* Selected images */}
            {selectedImages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-2">
                  Ảnh đã chọn ({selectedImages.length}/10)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {selectedImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-surface-secondary rounded-sm border border-border-light flex flex-col items-center justify-center relative group"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-sm"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        {(image.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                      <button 
                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white border border-border-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <span className="material-symbols-outlined text-error text-[0.75rem]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Checkbox Đăng ký Kiểm định Ngay ── */}
            <div className="mt-8 pt-6 border-t border-border-light">
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-surface rounded-sm border border-border-light hover:border-navy transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requestInspection}
                  onChange={set('requestInspection')}
                  className="mt-1 w-5 h-5 text-navy focus:ring-navy rounded-sm"
                />
                <div>
                  <span className="block text-sm font-bold text-content-primary">Tôi muốn đăng ký kiểm định xe này ngay</span>
                  <span className="block text-xs text-content-secondary mt-1 leading-relaxed">
                    Chuyên viên của chúng tôi sẽ đến tận nơi kiểm tra. Xe vượt qua kiểm định sẽ nhận được huy hiệu <strong className="text-success">"Đã kiểm định"</strong>, giúp bán nhanh hơn gấp 5 lần!
                  </span>
                </div>
              </label>
            </div>
            {/* ──────────────────────────────────────────────── */}
          </div>
        )}

        {/* ── Step 5: KIỂM ĐỊNH (Chỉ hiện khi tick Checkbox) ── */}
        {currentStep === 5 && formData.requestInspection && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Thông tin Kiểm định
            </h2>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm mb-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 mt-0.5 text-[1.2rem]">security</span>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Bảo mật thông tin:</strong> Địa chỉ kiểm định và ghi chú này chỉ hiển thị nội bộ cho Quản trị viên và Nhân viên phân công. Sẽ <strong>không</strong> hiển thị công khai trên bài đăng của bạn.
              </p>
            </div>

            <div>
              <label className={labelClass}>Địa chỉ xem xe <span className="text-error">*</span></label>
              <input
                type="text"
                value={formData.inspectionAddress}
                onChange={set('inspectionAddress')}
                className={getInputClass('inspectionAddress', true)}
                placeholder="Nhập địa chỉ chính xác để nhân viên đến kiểm tra"
                required
              />
              {!formData.inspectionAddress && <p className="text-xs text-error mt-1">Vui lòng nhập địa chỉ xem xe</p>}
            </div>

            <div>
              <label className={labelClass}>Ngày & Giờ hẹn <span className="text-error">*</span></label>
              <input
                type="datetime-local"
                value={formData.inspectionScheduledDate}
                onChange={set('inspectionScheduledDate')}
                className={getInputClass('inspectionScheduledDate', true)}
                required
              />
              {!formData.inspectionScheduledDate && <p className="text-xs text-error mt-1">Vui lòng chọn ngày giờ hẹn</p>}
            </div>

            <div>
              <label className={labelClass}>Ghi chú <span className="text-content-tertiary font-normal">(Tuỳ chọn)</span></label>
              <textarea
                value={formData.inspectionNote}
                onChange={set('inspectionNote')}
                className={inputClass}
                rows={3}
                placeholder="VD: Xe nằm ở tầng hầm chung cư, đến nơi vui lòng gọi điện thoại..."
              />
            </div>
          </div>
        )}

      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {/* Always: Save draft */}
        <Button variant="secondary" onClick={handleSaveDraft} size="sm">
          <span className="material-symbols-outlined text-[1rem]">save</span>
          Lưu nháp
        </Button>

        <div className="flex-1" />

        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack} size="sm">
            <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
            Quay lại
          </Button>
        )}

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors"
            style={{ backgroundColor: '#ff6b35' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
          >
            Tiếp theo
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#ff6b35' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#ff7849')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#ff6b35')}
          >
            <span className="material-symbols-outlined text-[1rem]">send</span>
            {loading ? 'Đang xử lý...' : (formData.requestInspection ? 'Thanh toán & Gửi duyệt' : 'Submit để kiểm duyệt')}
          </button>
        )}
      </div>
    </div>
  )
}