import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { postService } from '../../services/post'
import { categoryService } from '../../services/category'
import { inspectionService } from '../../services/inspection'
import api from '../../services/api'
import './Sell.css'

export default function Sell() {
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'like-new',
    frameMaterial: '',
    frameSize: '',
    brakeType: '',
    groupset: '',
    mileage: 0,
    price: 0,
    city: '',
    district: '',
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
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAllChildren()
        setCategories(data.data || [])
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load global inspection fee
  useEffect(() => {
    const loadGlobalFee = async () => {
      try {
        const data = await inspectionService.getGlobalFee()
        setInspectionFee(data.data || 0)
      } catch (error) {
        console.error('Failed to load inspection fee:', error)
      }
    }
    loadGlobalFee()
  }, [])

  // Load post data if editing
  useEffect(() => {
    if (editId) {
      loadPostData(editId)
    }
  }, [editId])

  const loadPostData = async (id) => {
    try {
      setIsLoadingPost(true)
      const data = await postService.getById(id)
      const post = data.data

      setFormData({
        title: post.title || '',
        description: post.description || '',
        categoryId: post.categoryId || '',
        brand: post.brand || '',
        model: post.model || '',
        year: post.year || new Date().getFullYear(),
        condition: post.condition || 'like-new',
        frameMaterial: post.frameMaterial || '',
        frameSize: post.frameSize || '',
        brakeType: post.brakeType || '',
        groupset: post.groupset || '',
        mileage: post.mileage || 0,
        price: post.price || 0,
        city: post.city || '',
        district: post.district || '',
        allowNegotiation: post.allowNegotiation || false,
        requestInspection: post.requestInspection || false,
        inspectionAddress: post.inspectionAddress || '',
        inspectionScheduledDate: post.inspectionScheduledDate || '',
        inspectionNote: post.inspectionNote || '',
        images: post.images || [],
      })

      // Set image previews from existing images
      if (post.images && post.images.length > 0) {
        setImagePreview(post.images.map(img => ({
          url: img,
          isExisting: true,
        })))
      }

      setIsLoadingPost(false)
    } catch (error) {
      console.error('Failed to load post:', error)
      setIsLoadingPost(false)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống'
      if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống'
      if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục'
      if (!formData.condition) newErrors.condition = 'Vui lòng chọn tình trạng'
    }

    if (step === 2) {
      if (!formData.brand.trim()) newErrors.brand = 'Thương hiệu không được để trống'
      if (!formData.model.trim()) newErrors.model = 'Model không được để trống'
      if (!formData.year) newErrors.year = 'Năm sản xuất không được để trống'
      if (!formData.frameMaterial.trim()) newErrors.frameMaterial = 'Chất liệu khung không được để trống'
      if (!formData.frameSize.trim()) newErrors.frameSize = 'Kích thước khung không được để trống'
      if (!formData.brakeType.trim()) newErrors.brakeType = 'Loại phanh không được để trống'
      if (!formData.groupset.trim()) newErrors.groupset = 'Groupset không được để trống'
    }

    if (step === 3) {
      if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0'
      if (!formData.city.trim()) newErrors.city = 'Thành phố không được để trống'
      if (!formData.district.trim()) newErrors.district = 'Quận/Huyện không được để trống'
    }

    if (step === 4) {
      if (imagePreview.length === 0) newErrors.images = 'Vui lòng tải lên ít nhất 1 ảnh'
    }

    if (step === 5) {
      if (formData.requestInspection) {
        if (!formData.inspectionAddress.trim()) newErrors.inspectionAddress = 'Địa chỉ kiểm định không được để trống'
        if (!formData.inspectionScheduledDate) newErrors.inspectionScheduledDate = 'Ngày kiểm định không được để trống'
      }
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
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const totalImages = imagePreview.length + files.length

    if (totalImages > 10) {
      setErrors(prev => ({
        ...prev,
        images: 'Tối đa 10 ảnh',
      }))
      return
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }))

    setImagePreview(prev => [...prev, ...newPreviews])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
    setErrors(prev => ({
      ...prev,
      images: '',
    }))
  }

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true)
      // Save draft logic - could be implemented based on backend support
      alert('Bài đăng đã được lưu')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('Lỗi khi lưu bài đăng')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare form data
      const submitData = {
        ...formData,
        images: formData.images.filter(img => img instanceof File),
      }

      let postId
      if (editId) {
        await postService.update(editId, submitData)
        postId = editId
      } else {
        const response = await postService.create(submitData)
        postId = response.data?.id
      }

      // Create inspection payment if requested
      if (formData.requestInspection && postId) {
        try {
          await api.post('/v1/payments', {
            bikePostId: postId,
            amount: inspectionFee,
            paymentMethod: 'INSPECTION_FEE',
            description: 'Phí kiểm định xe đạp',
          })
        } catch (error) {
          console.error('Failed to create inspection payment:', error)
        }
      }

      setCreatedPostId(postId)
      setCurrentStep(6) // Success page
    } catch (error) {
      console.error('Failed to submit post:', error)
      alert(error.message || 'Lỗi khi đăng bài')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPost) {
    return <div className="sell-container"><p>Đang tải dữ liệu...</p></div>
  }

  // Success page
  if (currentStep === 6) {
    return (
      <div className="sell-container">
        <div className="success-page">
          <div className="success-icon">✓</div>
          <h1>{editId ? 'Cập nhật thành công!' : 'Đăng bài thành công!'}</h1>
          <p>{editId ? 'Bài đăng của bạn đã được cập nhật' : 'Bài đăng của bạn đã được đăng lên'}</p>
          <div className="success-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/bike/${createdPostId}`)}
            >
              Xem bài đăng
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/my-listings')}
            >
              Quay lại danh sách
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCurrentStep(1)
                setFormData({
                  title: '',
                  description: '',
                  categoryId: '',
                  brand: '',
                  model: '',
                  year: new Date().getFullYear(),
                  condition: 'like-new',
                  frameMaterial: '',
                  frameSize: '',
                  brakeType: '',
                  groupset: '',
                  mileage: 0,
                  price: 0,
                  city: '',
                  district: '',
                  allowNegotiation: false,
                  requestInspection: false,
                  inspectionAddress: '',
                  inspectionScheduledDate: '',
                  inspectionNote: '',
                  images: [],
                })
                setImagePreview([])
              }}
            >
              Đăng bài mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sell-container">
      <div className="sell-header">
        <h1>{editId ? 'Chỉnh sửa bài đăng' : 'Đăng bài bán xe đạp'}</h1>
        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="sell-form">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Thông tin cơ bản</h2>
            <div className="form-group">
              <label>Tiêu đề bài đăng *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Xe đạp Mountain Bike Trek 2023"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Mô tả chi tiết *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về xe đạp của bạn..."
                rows="5"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={errors.categoryId ? 'error' : ''}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
              </div>

              <div className="form-group">
                <label>Tình trạng *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={errors.condition ? 'error' : ''}
                >
                  <option value="like-new">Như mới</option>
                  <option value="excellent">Xuất sắc</option>
                  <option value="good">Tốt</option>
                  <option value="fair">Bình thường</option>
                </select>
                {errors.condition && <span className="error-text">{errors.condition}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Technical Info */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Thông tin kỹ thuật</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Thương hiệu *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="VD: Trek, Giant, Specialized"
                  className={errors.brand ? 'error' : ''}
                />
                {errors.brand && <span className="error-text">{errors.brand}</span>}
              </div>

              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="VD: FX 3"
                  className={errors.model ? 'error' : ''}
                />
                {errors.model && <span className="error-text">{errors.model}</span>}
              </div>

              <div className="form-group">
                <label>Năm sản xuất *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1990"
                  max={new Date().getFullYear()}
                  className={errors.year ? 'error' : ''}
                />
                {errors.year && <span className="error-text">{errors.year}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chất liệu khung *</label>
                <input
                  type="text"
                  name="frameMaterial"
                  value={formData.frameMaterial}
                  onChange={handleInputChange}
                  placeholder="VD: Aluminum, Carbon, Steel"
                  className={errors.frameMaterial ? 'error' : ''}
                />
                {errors.frameMaterial && <span className="error-text">{errors.frameMaterial}</span>}
              </div>

              <div className="form-group">
                <label>Kích thước khung *</label>
                <input
                  type="text"
                  name="frameSize"
                  value={formData.frameSize}
                  onChange={handleInputChange}
                  placeholder="VD: 17 inch, M, L"
                  className={errors.frameSize ? 'error' : ''}
                />
                {errors.frameSize && <span className="error-text">{errors.frameSize}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại phanh *</label>
                <input
                  type="text"
                  name="brakeType"
                  value={formData.brakeType}
                  onChange={handleInputChange}
                  placeholder="VD: Disc, Rim, Hydraulic"
                  className={errors.brakeType ? 'error' : ''}
                />
                {errors.brakeType && <span className="error-text">{errors.brakeType}</span>}
              </div>

              <div className="form-group">
                <label>Groupset *</label>
                <input
                  type="text"
                  name="groupset"
                  value={formData.groupset}
                  onChange={handleInputChange}
                  placeholder="VD: Shimano, SRAM, Campagnolo"
                  className={errors.groupset ? 'error' : ''}
                />
                {errors.groupset && <span className="error-text">{errors.groupset}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Quãng đường đã đi (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        )}

        {/* Step 3: Price & Location */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Giá & Vị trí</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Giá (VND) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="allowNegotiation"
                    checked={formData.allowNegotiation}
                    onChange={handleInputChange}
                  />
                  Cho phép thương lượng giá
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thành phố *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>Quận/Huyện *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="VD: Hoàn Kiếm, Bình Thạnh"
                  className={errors.district ? 'error' : ''}
                />
                {errors.district && <span className="error-text">{errors.district}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Ảnh xe đạp</h2>
            <p className="step-description">Tải lên tối đa 10 ảnh ({imagePreview.length}/10)</p>

            <div className="image-upload">
              <label className="upload-box">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={imagePreview.length >= 10}
                />
                <div className="upload-content">
                  <span className="upload-icon">📷</span>
                  <p>Nhấp để chọn ảnh hoặc kéo thả</p>
                </div>
              </label>
              {errors.images && <span className="error-text">{errors.images}</span>}
            </div>

            <div className="image-preview-grid">
              {imagePreview.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview.url} alt={`Preview ${index}`} />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Inspection */}
        {currentStep === 5 && (
          <div className="form-step">
            <h2>Kiểm định xe</h2>
            <div className="inspection-info">
              <p>Phí kiểm định: <strong>{inspectionFee.toLocaleString('vi-VN')} VND</strong></p>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="requestInspection"
                  checked={formData.requestInspection}
                  onChange={handleInputChange}
                />
                Yêu cầu kiểm định xe
              </label>
            </div>

            {formData.requestInspection && (
              <>
                <div className="form-group">
                  <label>Địa chỉ kiểm định *</label>
                  <input
                    type="text"
                    name="inspectionAddress"
                    value={formData.inspectionAddress}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ kiểm định"
                    className={errors.inspectionAddress ? 'error' : ''}
                  />
                  {errors.inspectionAddress && <span className="error-text">{errors.inspectionAddress}</span>}
                </div>

                <div className="form-group">
                  <label>Ngày kiểm định *</label>
                  <input
                    type="datetime-local"
                    name="inspectionScheduledDate"
                    value={formData.inspectionScheduledDate}
                    onChange={handleInputChange}
                    className={errors.inspectionScheduledDate ? 'error' : ''}
                  />
                  {errors.inspectionScheduledDate && <span className="error-text">{errors.inspectionScheduledDate}</span>}
                </div>

                <div className="form-group">
                  <label>Ghi chú kiểm định</label>
                  <textarea
                    name="inspectionNote"
                    value={formData.inspectionNote}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho người kiểm định..."
                    rows="3"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Quay lại
            </button>
          )}

          {currentStep < 5 && (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Tiếp theo
            </button>
          )}

          {currentStep === 5 && (
            <>
              <button
                className="btn btn-outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                Lưu nháp
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : editId ? 'Cập nhật' : 'Đăng bài'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
