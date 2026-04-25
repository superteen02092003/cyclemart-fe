import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import InspectionModal from '@/components/inspection/InspectionModal'
import { postService } from '@/services/post'
import { categoryService } from '@/services/category'
import { inspectionService } from '@/services/inspection'
import api from '@/services/api'

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Thông số kỹ thuật' },
  { id: 3, label: 'Giá & Vị trí' },
  { id: 4, label: 'Hình ảnh' },
  { id: 5, label: 'Kiểm định' },
]

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

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

const DISTRICTS = [
  'QUAN_1', 'QUAN_2', 'QUAN_3', 'QUAN_4', 'QUAN_5', 'QUAN_6', 'QUAN_7', 'QUAN_8', 
  'QUAN_9', 'QUAN_10', 'QUAN_11', 'QUAN_12', 'QUAN_BINH_THANH', 'QUAN_GO_VAP', 
  'QUAN_PHU_NHUAN', 'QUAN_TAN_BINH', 'QUAN_TAN_PHU', 'QUAN_THU_DUC', 'HUYEN_BINH_CHANH', 
  'HUYEN_CAN_GIO', 'HUYEN_CU_CHI', 'HUYEN_HOC_MON', 'HUYEN_NHA_BE'
]

const inputClass = 'w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-error rounded-sm focus:outline-none focus:border-error text-sm transition-colors'
const labelClass = 'block text-sm font-medium text-content-primary mb-1.5'
const hintClass = 'text-xs text-content-secondary mt-1'

export default function SellPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('editId')

  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingPost, setIsLoadingPost] = useState(!!editId)
  const [createdPostId, setCreatedPostId] = useState(null)
  const [inspectionFee, setInspectionFee] = useState(0)
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInspectionModal, setShowInspectionModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'GOOD',
    frameMaterial: 'ALUMINUM',
    frameSize: 'M',
    brakeType: 'DISC_HYDRAULIC',
    groupset: 'SHIMANO_105',
    mileage: 0,
    price: '',
    city: 'TP_HO_CHI_MINH',
    district: 'QUAN_1',
    allowNegotiation: false,
    requestInspection: false,
    inspectionAddress: '',
    inspectionScheduledDate: '',
    inspectionNote: '',
    images: [],
  })

  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState([])

  // Load categories
  useEffect(() => {
    loadCategories()
    loadGlobalFee()
  }, [])

  // Load post data if editing
  useEffect(() => {
    if (editId) {
      loadPostData()
    }
  }, [editId])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllChildren()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadGlobalFee = async () => {
    try {
      const data = await inspectionService.getGlobalFee()
      setInspectionFee(data.fee || 0)
    } catch (error) {
      console.error('Failed to load inspection fee:', error)
    }
  }

  const loadPostData = async () => {
    try {
      setIsLoadingPost(true)
      const data = await postService.getById(editId)
      setFormData({
        title: data.title || '',
        description: data.description || '',
        categoryId: data.categoryId || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || new Date().getFullYear(),
        condition: data.condition || 'GOOD',
        frameMaterial: data.frameMaterial || 'ALUMINUM',
        frameSize: data.frameSize || 'M',
        brakeType: data.brakeType || 'DISC_HYDRAULIC',
        groupset: data.groupset || 'SHIMANO_105',
        mileage: data.mileage || 0,
        price: data.price || '',
        city: data.city || 'TP_HO_CHI_MINH',
        district: data.district || 'QUAN_1',
        allowNegotiation: data.allowNegotiation || false,
        requestInspection: data.requestInspection || false,
        inspectionAddress: data.inspectionAddress || '',
        inspectionScheduledDate: data.inspectionScheduledDate || '',
        inspectionNote: data.inspectionNote || '',
        images: data.images || [],
      })
      if (data.images && data.images.length > 0) {
        setImagePreview(data.images.map(img => img.url || img))
      }
    } catch (error) {
      console.error('Failed to load post:', error)
      alert('Không thể tải bài đăng')
      navigate(ROUTES.MY_LISTINGS)
    } finally {
      setIsLoadingPost(false)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống'
      if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống'
      if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục'
    }

    if (step === 2) {
      if (!formData.brand) newErrors.brand = 'Vui lòng chọn hãng'
      if (!formData.model.trim()) newErrors.model = 'Tên model không được để trống'
    }

    if (step === 3) {
      if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0'
      if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện'
    }

    if (step === 4) {
      if (formData.images.length === 0) newErrors.images = 'Vui lòng thêm ít nhất 1 hình ảnh'
    }

    if (step === 5 && formData.requestInspection) {
      if (!formData.inspectionAddress.trim()) newErrors.inspectionAddress = 'Địa chỉ kiểm định không được để trống'
      if (!formData.inspectionScheduledDate) newErrors.inspectionScheduledDate = 'Vui lòng chọn ngày kiểm định'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...formData.images, ...files]
    
    if (newImages.length > 10) {
      alert('Tối đa 10 hình ảnh')
      return
    }

    setFormData(prev => ({
      ...prev,
      images: newImages
    }))

    // Create preview
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(prev => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true)
      // Save draft logic - could save to localStorage or backend
      localStorage.setItem('sellFormDraft', JSON.stringify(formData))
      alert('Bản nháp đã được lưu')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('Lỗi khi lưu bản nháp')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    try {
      setIsSubmitting(true)
      const submitData = { ...formData }

      let response
      if (editId) {
        response = await postService.update(editId, submitData)
      } else {
        response = await postService.create(submitData)
        setCreatedPostId(response.id)
      }

      // If inspection is requested, create payment
      if (formData.requestInspection && inspectionFee > 0) {
        try {
          await api.post('/v1/payments', {
            postId: response.id || editId,
            amount: inspectionFee,
            type: 'INSPECTION',
            description: 'Phí kiểm định xe đạp'
          })
        } catch (error) {
          console.error('Failed to create inspection payment:', error)
        }
      }

      setCurrentStep(6) // Success step
    } catch (error) {
      console.error('Failed to submit post:', error)
      alert(error.message || 'Lỗi khi đăng bài')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-content-secondary">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (currentStep === 6) {
    return <SuccessPage isEdit={!!editId} postId={createdPostId || editId} />
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-content-primary mb-2">
            {editId ? 'Chỉnh sửa bài đăng' : 'Đăng bán xe đạp'}
          </h1>
          <p className="text-content-secondary">
            {editId ? 'Cập nhật thông tin bài đăng của bạn' : 'Chia sẻ chiếc xe đạp của bạn với cộng đồng'}
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'flex-1 text-center pb-2 border-b-2 transition-colors',
                  currentStep >= step.id ? 'border-navy' : 'border-border-light'
                )}
              >
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 font-medium text-sm',
                    currentStep >= step.id
                      ? 'bg-navy text-white'
                      : 'bg-border-light text-content-secondary'
                  )}
                >
                  {step.id}
                </div>
                <p
                  className={cn(
                    'text-xs font-medium',
                    currentStep >= step.id ? 'text-navy' : 'text-content-secondary'
                  )}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} errors={errors} categories={categories} />}
          {currentStep === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} errors={errors} />}
          {currentStep === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} errors={errors} />}
          {currentStep === 4 && <Step4 formData={formData} handleImageChange={handleImageChange} removeImage={removeImage} imagePreview={imagePreview} errors={errors} />}
          {currentStep === 5 && <Step5 formData={formData} handleInputChange={handleInputChange} errors={errors} inspectionFee={inspectionFee} />}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-between">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Quay lại
              </Button>
            )}
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
              Lưu bản nháp
            </Button>
          </div>
          <div className="flex gap-3">
            {currentStep < 5 && (
              <Button onClick={handleNext}>
                Tiếp tục
              </Button>
            )}
            {currentStep === 5 && (
              <Button onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                {editId ? 'Cập nhật' : 'Đăng bài'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// Step 1: Basic Information
function Step1({ formData, handleInputChange, errors, categories }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Tiêu đề bài đăng *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="VD: Giant Escape 3 2023 - Tình trạng tốt"
          className={errors.title ? inputErrorClass : inputClass}
        />
        {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
        <p className={hintClass}>Tiêu đề rõ ràng giúp bán nhanh hơn</p>
      </div>

      <div>
        <label className={labelClass}>Mô tả chi tiết *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Mô tả tình trạng, lịch sử sử dụng, bất kỳ vấn đề nào..."
          rows="5"
          className={cn(errors.description ? inputErrorClass : inputClass, 'resize-none')}
        />
        {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className={labelClass}>Danh mục *</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          className={errors.categoryId ? inputErrorClass : inputClass}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-error text-xs mt-1">{errors.categoryId}</p>}
      </div>

      <div>
        <label className={labelClass}>Tình trạng</label>
        <select
          name="condition"
          value={formData.condition}
          onChange={handleInputChange}
          className={inputClass}
        >
          {CONDITIONS.map(cond => (
            <option key={cond.value} value={cond.value}>{cond.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Step 2: Technical Specifications
function Step2({ formData, handleInputChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hãng sản xuất *</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className={errors.brand ? inputErrorClass : inputClass}
          >
            <option value="">-- Chọn hãng --</option>
            {BRANDS.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          {errors.brand && <p className="text-error text-xs mt-1">{errors.brand}</p>}
        </div>

        <div>
          <label className={labelClass}>Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="VD: Escape 3"
            className={errors.model ? inputErrorClass : inputClass}
          />
          {errors.model && <p className="text-error text-xs mt-1">{errors.model}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Năm sản xuất</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className={inputClass}
          >
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Số km đã đi</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleInputChange}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Chất liệu khung</label>
          <select
            name="frameMaterial"
            value={formData.frameMaterial}
            onChange={handleInputChange}
            className={inputClass}
          >
            {FRAME_MATERIALS.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Kích thước khung</label>
          <select
            name="frameSize"
            value={formData.frameSize}
            onChange={handleInputChange}
            className={inputClass}
          >
            {FRAME_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Loại phanh</label>
          <select
            name="brakeType"
            value={formData.brakeType}
            onChange={handleInputChange}
            className={inputClass}
          >
            {BRAKE_TYPES.map(brake => (
              <option key={brake} value={brake}>{brake}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Groupset</label>
          <select
            name="groupset"
            value={formData.groupset}
            onChange={handleInputChange}
            className={inputClass}
          >
            {GROUPSETS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// Step 3: Price & Location
function Step3({ formData, handleInputChange, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Giá bán (VND) *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="0"
          className={errors.price ? inputErrorClass : inputClass}
        />
        {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
        {formData.price && <p className={hintClass}>Giá: {formatPrice(formData.price)}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="allowNegotiation"
            checked={formData.allowNegotiation}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-content-primary">Cho phép thương lượng giá</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Thành phố</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="TP_HO_CHI_MINH">TP. Hồ Chí Minh</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Quận/Huyện *</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className={errors.district ? inputErrorClass : inputClass}
          >
            <option value="">-- Chọn quận/huyện --</option>
            {DISTRICTS.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
          {errors.district && <p className="text-error text-xs mt-1">{errors.district}</p>}
        </div>
      </div>
    </div>
  )
}

// Step 4: Images
function Step4({ formData, handleImageChange, removeImage, imagePreview, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Hình ảnh *</label>
        <p className={hintClass}>Tối đa 10 hình ảnh. Hình ảnh rõ ràng giúp bán nhanh hơn.</p>
        
        <div className="mt-3 border-2 border-dashed border-border-light rounded-lg p-6 text-center cursor-pointer hover:border-navy transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-input"
          />
          <label htmlFor="image-input" className="cursor-pointer">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm font-medium text-content-primary">Nhấp để chọn hình ảnh</p>
            <p className="text-xs text-content-secondary">hoặc kéo thả hình ảnh vào đây</p>
          </label>
        </div>
        {errors.images && <p className="text-error text-xs mt-1">{errors.images}</p>}
      </div>

      {imagePreview.length > 0 && (
        <div>
          <p className="text-sm font-medium text-content-primary mb-3">
            Hình ảnh đã chọn ({imagePreview.length}/10)
          </p>
          <div className="grid grid-cols-4 gap-3">
            {imagePreview.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Step 5: Inspection
function Step5({ formData, handleInputChange, errors, inspectionFee }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Mẹo:</strong> Yêu cầu kiểm định giúp tăng độ tin cậy và bán nhanh hơn.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="requestInspection"
            checked={formData.requestInspection}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-content-primary">
            Yêu cầu kiểm định xe (Phí: {formatPrice(inspectionFee)})
          </span>
        </label>
      </div>

      {formData.requestInspection && (
        <>
          <div>
            <label className={labelClass}>Địa chỉ kiểm định *</label>
            <input
              type="text"
              name="inspectionAddress"
              value={formData.inspectionAddress}
              onChange={handleInputChange}
              placeholder="VD: 123 Nguyễn Huệ, Quận 1"
              className={errors.inspectionAddress ? inputErrorClass : inputClass}
            />
            {errors.inspectionAddress && <p className="text-error text-xs mt-1">{errors.inspectionAddress}</p>}
          </div>

          <div>
            <label className={labelClass}>Ngày kiểm định dự kiến *</label>
            <input
              type="datetime-local"
              name="inspectionScheduledDate"
              value={formData.inspectionScheduledDate}
              onChange={handleInputChange}
              className={errors.inspectionScheduledDate ? inputErrorClass : inputClass}
            />
            {errors.inspectionScheduledDate && <p className="text-error text-xs mt-1">{errors.inspectionScheduledDate}</p>}
          </div>

          <div>
            <label className={labelClass}>Ghi chú thêm</label>
            <textarea
              name="inspectionNote"
              value={formData.inspectionNote}
              onChange={handleInputChange}
              placeholder="Ghi chú cho người kiểm định..."
              rows="3"
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Lưu ý:</strong> Phí kiểm định {formatPrice(inspectionFee)} sẽ được tính khi bạn đăng bài.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// Success Page
function SuccessPage({ isEdit, postId }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          {isEdit ? 'Cập nhật thành công!' : 'Đăng bài thành công!'}
        </h1>
        <p className="text-content-secondary mb-6">
          {isEdit
            ? 'Bài đăng của bạn đã được cập nhật. Bạn có thể xem lại hoặc tiếp tục đăng bài khác.'
            : 'Bài đăng của bạn đã được công khai. Bạn có thể xem lại hoặc tiếp tục đăng bài khác.'}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate(`${ROUTES.BIKE_DETAIL.replace(':id', postId)}`)}
            className="w-full"
          >
            Xem bài đăng
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.MY_LISTINGS)}
            className="w-full"
          >
            Quay lại danh sách bài đăng
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SELL)}
            className="w-full"
          >
            Đăng bài mới
          </Button>
        </div>
      </div>
    </div>
  )
}
