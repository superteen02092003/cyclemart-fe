import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Thông số kỹ thuật' },
  { id: 3, label: 'Giá & Vị trí' },
  { id: 4, label: 'Hình ảnh' },
]

const YEARS = Array.from({ length: 12 }, (_, i) => 2026 - i)

const BRANDS = [
  'Giant', 'Trek', 'Specialized', 'Cannondale', 'Merida',
  'Cube', 'Scott', 'Brompton', 'Canyon', 'Pinarello',
  'Bianchi', 'Cervélo', 'BMC', 'Colnago', 'De Rosa',
]

const CATEGORIES = [
  { value: 'ROAD', label: 'Đường trường' },
  { value: 'MTB', label: 'Địa hình (MTB)' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'URBAN', label: 'Đô thị / Hybrid' },
  { value: 'FOLD', label: 'Xe gập' },
  { value: 'FIXED', label: 'Fixed Gear' },
  { value: 'EBIKE', label: 'E-Bike' },
]

const CONDITIONS = [
  { value: 'new', label: 'Mới 100%' },
  { value: 'like_new', label: 'Như mới (>90%)' },
  { value: 'good', label: 'Tốt (70-90%)' },
  { value: 'used', label: 'Đã dùng (50-70%)' },
  { value: 'needs_repair', label: 'Cần sửa (<50%)' },
]

const FRAME_MATERIALS = ['Carbon', 'Aluminum', 'Steel', 'Titanium', 'Chromoly']
const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Khác']

const MOCK_UPLOADED = [
  { id: 'img1', label: 'Ảnh tổng thể xe' },
  { id: 'img2', label: 'Ảnh khung sườn' },
  { id: 'img3', label: 'Ảnh groupset / hệ truyền động' },
]

const inputClass =
  'w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors'
const labelClass = 'block text-sm font-medium text-content-primary mb-1.5'
const hintClass = 'text-xs text-content-secondary mt-1'

function ProgressBar({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-0 relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border-light z-0" />
        {STEPS.map((step, idx) => {
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
        Bước {currentStep}: {STEPS[currentStep - 1].label}
      </p>
    </div>
  )
}

export default function SellPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [draftSaved, setDraftSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1
    category: '',
    brand: '',
    model: '',
    year: '',
    condition: '',
    color: '',
    // Step 2
    frameMaterial: '',
    frameSize: '',
    groupset: '',
    description: '',
    // Step 3
    price: '',
    isNegotiable: false,
    city: '',
    address: '',
    // Step 4 — mock only
  })

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSaveDraft = () => {
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
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
      <ProgressBar currentStep={currentStep} />

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
              <label className={labelClass}>Loại xe <span className="text-error">*</span></label>
              <select value={formData.category} onChange={set('category')} className={inputClass} required>
                <option value="">-- Chọn loại xe --</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Thương hiệu <span className="text-error">*</span></label>
              <input
                list="brand-list"
                value={formData.brand}
                onChange={set('brand')}
                placeholder="Giant, Trek, Specialized..."
                className={inputClass}
              />
              <datalist id="brand-list">
                {BRANDS.map((b) => <option key={b} value={b} />)}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>Model / Tên xe <span className="text-error">*</span></label>
              <input
                type="text"
                value={formData.model}
                onChange={set('model')}
                placeholder="Defy Advanced 2, Domane AL 4..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Năm sản xuất <span className="text-error">*</span></label>
                <select value={formData.year} onChange={set('year')} className={inputClass}>
                  <option value="">-- Chọn năm --</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tình trạng <span className="text-error">*</span></label>
                <select value={formData.condition} onChange={set('condition')} className={inputClass}>
                  <option value="">-- Chọn --</option>
                  {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Màu sắc</label>
              <input
                type="text"
                value={formData.color}
                onChange={set('color')}
                placeholder="Đen, Trắng, Xanh navy..."
                className={inputClass}
              />
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
                  {FRAME_MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Size khung (cm)</label>
                <input
                  type="number"
                  min="30"
                  max="70"
                  value={formData.frameSize}
                  onChange={set('frameSize')}
                  placeholder="VD: 54"
                  className={inputClass}
                />
                <p className={hintClass}>Để trống nếu xe gập</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Groupset / Hệ truyền động</label>
              <input
                type="text"
                value={formData.groupset}
                onChange={set('groupset')}
                placeholder="Shimano 105, SRAM Rival AXS, Ultegra Di2..."
                className={inputClass}
              />
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
                className={cn(inputClass, 'resize-none')}
                minLength={50}
              />
              <p className={hintClass}>{formData.description.length}/50 ký tự tối thiểu</p>
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
                className={inputClass}
              />
              {formData.price && (
                <p className="text-sm font-semibold text-content-primary mt-1.5">
                  ≈ {formatPrice(Number(formData.price))}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNegotiable}
                onChange={set('isNegotiable')}
                className="w-4 h-4 rounded border-border-light accent-orange-500"
              />
              <span className="text-sm text-content-primary">Cho phép thương lượng giá</span>
            </label>

            <div>
              <label className={labelClass}>Thành phố <span className="text-error">*</span></label>
              <select value={formData.city} onChange={set('city')} className={inputClass}>
                <option value="">-- Chọn thành phố --</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Địa chỉ cụ thể</label>
              <input
                type="text"
                value={formData.address}
                onChange={set('address')}
                placeholder="Số nhà, tên đường, quận/huyện (cho nhân viên kiểm định)"
                className={inputClass}
              />
              <p className={hintClass}>Chỉ dùng cho mục đích kiểm định, không hiển thị công khai.</p>
            </div>
          </div>
        )}

        {/* ── Step 4 ─────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-content-primary border-b border-border-light pb-3 mb-5">
              Hình ảnh & Video
            </h2>

            {/* Upload zone */}
            <div>
              <label className={labelClass}>Ảnh xe <span className="text-error">*</span></label>
              <div className="border-2 border-dashed border-border-light rounded-sm p-8 text-center hover:border-navy transition-colors cursor-pointer bg-surface-secondary">
                <span
                  className="material-symbols-outlined text-content-secondary mb-2"
                  style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 0" }}
                >
                  add_photo_alternate
                </span>
                <p className="text-sm font-medium text-content-primary">Kéo thả ảnh vào đây</p>
                <p className="text-xs text-content-secondary mt-1">hoặc click để chọn từ thiết bị</p>
                <p className={cn(hintClass, 'mt-3')}>Tối thiểu 3 ảnh, tối đa 10 ảnh · JPG/PNG · Tối đa 5MB/ảnh</p>
              </div>
            </div>

            {/* Mock uploaded images */}
            <div>
              <p className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-2">
                Ảnh đã tải lên (3/10)
              </p>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_UPLOADED.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square bg-surface-secondary rounded-sm border border-border-light flex flex-col items-center justify-center relative group"
                  >
                    <span
                      className="material-symbols-outlined text-content-secondary"
                      style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 0" }}
                    >
                      directions_bike
                    </span>
                    <p className="text-xs text-content-secondary mt-1 text-center px-1">{img.label}</p>
                    <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white border border-border-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <span className="material-symbols-outlined text-error text-[0.75rem]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video upload */}
            <div>
              <label className={labelClass}>Video giới thiệu (không bắt buộc)</label>
              <div className="border-2 border-dashed border-border-light rounded-sm p-6 text-center hover:border-navy transition-colors cursor-pointer bg-surface-secondary">
                <span
                  className="material-symbols-outlined text-content-secondary mb-1.5"
                  style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 0" }}
                >
                  videocam
                </span>
                <p className="text-xs text-content-secondary">Tải lên 1 video giới thiệu xe</p>
                <p className={hintClass}>MP4 · Tối đa 60 giây · Tối đa 100MB</p>
              </div>
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

        {currentStep < 4 ? (
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
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors"
            style={{ backgroundColor: '#ff6b35' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
          >
            <span className="material-symbols-outlined text-[1rem]">send</span>
            Submit để kiểm duyệt
          </button>
        )}
      </div>
    </div>
  )
}