import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { bikePostService } from '@/services/bikePost'
import { categoryService } from '@/services/category'
import { brandService } from '@/services/brand'
import { useToast, Toast } from '@/components/ui/Toast'
import SubscribeModal from '@/components/seller/SubscribeModal'
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories'
import { DEFAULT_BRANDS } from '@/constants/defaultBrands'

export default function SellPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast, showToast, hideToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  
  // State quản lý việc hiển thị modal Gói Ưu Tiên
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [newlyCreatedPostId, setNewlyCreatedPostId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 100000, // MIN: 100,000 VND
    categoryId: null, // Sẽ được set khi categories tải xong
    brand: '', // Sẽ được set thành brand name từ API
    model: '',
    year: new Date().getFullYear(),
    status: 'LIKE_NEW',
    city: 'HO_CHI_MINH',
    district: 'QUAN_1',
    frameMaterial: 'CARBON',
    frameSize: 'M',
    brakeType: 'DISC_HYDRAULIC',
    groupset: 'SHIMANO_105',
    mileage: 0,
    allowNegotiation: false
  })

  // Load categories và brands từ backend khi component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        console.log('📂 Loading categories...')
        const categoriesData = await categoryService.getAll()
        console.log('✅ Categories loaded:', categoriesData)
        
        if (!categoriesData || categoriesData.length === 0) {
          console.warn('⚠️ No categories from backend, using default categories')
          setCategories(DEFAULT_CATEGORIES)
          setFormData(prev => ({
            ...prev,
            categoryId: DEFAULT_CATEGORIES[0].id
          }))
        } else {
          setCategories(categoriesData)
          if (categoriesData && categoriesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              categoryId: categoriesData[0].id
            }))
          }
        }

        // Load brands
        console.log('🏷️ Loading brands...')
        const brandsData = await brandService.getAll()
        console.log('✅ Brands loaded:', brandsData)
        
        if (!brandsData || brandsData.length === 0) {
          console.warn('⚠️ No brands from backend, using default brands')
          setBrands(DEFAULT_BRANDS)
          setFormData(prev => ({
            ...prev,
            brand: DEFAULT_BRANDS[0].name
          }))
        } else {
          setBrands(brandsData)
          if (brandsData && brandsData.length > 0) {
            setFormData(prev => ({
              ...prev,
              brand: brandsData[0].name
            }))
          }
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
        setCategories(DEFAULT_CATEGORIES)
        setBrands(DEFAULT_BRANDS)
        setFormData(prev => ({
          ...prev,
          categoryId: DEFAULT_CATEGORIES[0].id,
          brand: DEFAULT_BRANDS[0].name
        }))
      }
    }

    loadData()
  }, [])

  // Bắt buộc đăng nhập mới được đăng bài
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
        <p className="mb-6 text-gray-500">Vui lòng đăng nhập để có thể đăng bán xe.</p>
        <button onClick={() => navigate('/login')} className="bg-[#ff6b35] text-white px-6 py-2 rounded">Đăng nhập ngay</button>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : ['price', 'year', 'mileage', 'categoryId'].includes(name)
          ? Number(value) || 0
          : value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      return showToast('Chỉ được tải lên tối đa 5 ảnh', 'error')
    }
    
    setImages(prev => [...prev, ...files])
    
    // Tạo preview URL cho ảnh
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('📝 Form submitted with data:', formData)
    console.log('📸 Images count:', images.length)
    console.log('🏷️ Brand field value:', { brand: formData.brand, type: typeof formData.brand })
    
    // ============ VALIDATION BACKEND CONSTRAINTS ============
    
    // Title: 10-200 ký tự
    if (!formData.title || formData.title.trim().length < 10) {
      console.warn('❌ Title validation failed:', { title: formData.title, length: formData.title?.length })
      showToast('Tiêu đề phải từ 10 ký tự trở lên', 'error')
      return
    }
    if (formData.title.length > 200) {
      console.warn('❌ Title too long:', { title: formData.title, length: formData.title.length })
      showToast('Tiêu đề không được quá 200 ký tự', 'error')
      return
    }

    // Description: 20-2000 ký tự
    if (!formData.description || formData.description.trim().length < 20) {
      console.warn('❌ Description validation failed:', { description: formData.description, length: formData.description?.length })
      showToast('Mô tả phải từ 20 ký tự trở lên', 'error')
      return
    }
    if (formData.description.length > 2000) {
      console.warn('❌ Description too long:', { description: formData.description, length: formData.description.length })
      showToast('Mô tả không được quá 2000 ký tự', 'error')
      return
    }

    // Price: >= 100,000
    if (!formData.price || formData.price < 100000) {
      console.warn('❌ Price validation failed:', { price: formData.price })
      showToast('Giá bán phải từ 100,000 VND trở lên', 'error')
      return
    }
    if (formData.price > 999999999) {
      console.warn('❌ Price too high:', { price: formData.price })
      showToast('Giá bán không được quá 999,999,999 VND', 'error')
      return
    }

    // Year: 1990-2030
    if (formData.year < 1990 || formData.year > 2030) {
      console.warn('❌ Year validation failed:', { year: formData.year })
      showToast('Năm sản xuất phải từ 1990 đến 2030', 'error')
      return
    }

    // Mileage: 0-999999
    if (formData.mileage < 0 || formData.mileage > 999999) {
      console.warn('❌ Mileage validation failed:', { mileage: formData.mileage })
      showToast('Số km phải từ 0 đến 999,999', 'error')
      return
    }

    // Images: ít nhất 1 tấm
    if (images.length === 0) {
      console.warn('❌ No images selected')
      showToast('Vui lòng tải lên ít nhất 1 hình ảnh', 'error')
      return
    }

    // Brand: phải chọn
    if (!formData.brand || formData.brand.trim() === '') {
      console.warn('❌ Brand not selected:', { brand: formData.brand })
      showToast('Vui lòng chọn thương hiệu', 'error')
      return
    }

    // Category: phải chọn
    if (!formData.categoryId) {
      console.warn('❌ Category not selected:', { categoryId: formData.categoryId })
      showToast('Vui lòng chọn danh mục', 'error')
      return
    }
    
    console.log('✅ All validations passed!')
    setLoading(true)
    
    try {
      // 1. Gọi API tạo bài viết
      console.log('🚀 Calling API to create post...')
      const response = await bikePostService.createPost(formData, images)
      console.log('✅ Post created successfully:', response)
      
      // 2. Thành công -> Lưu ID bài viết và Bật Modal Mua Gói
      setNewlyCreatedPostId(response.id)
      setShowSubscribeModal(true)
      
    } catch (error) {
      console.error('❌ Error creating post:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data
      })
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi đăng tin. Vui lòng kiểm tra lại!'
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Khi User đóng Modal (mua xong hoặc bỏ qua)
  const handleCloseModal = () => {
    setShowSubscribeModal(false)
    showToast('Đăng tin thành công!', 'success')
    navigate('/') // Hoặc chuyển đến trang Quản lý bài đăng của Seller
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng bán xe của bạn</h1>
        <p className="text-gray-500">Điền đầy đủ thông tin để người mua dễ dàng tìm thấy xe của bạn hơn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: THÔNG TIN CƠ BẢN */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Tiêu đề bài đăng *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} 
                className="w-full border p-2 rounded" placeholder="VD: Giant Defy Advanced 2 - Carbon 2024" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Thương hiệu *</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Model (Dòng xe)</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} 
                className="w-full border p-2 rounded" placeholder="VD: Defy Advanced 2" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Danh mục *</label>
              <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Năm sản xuất</label>
              <input type="number" name="year" min="1990" max="2030" value={formData.year} onChange={handleChange} 
                className="w-full border p-2 rounded" />
            </div>
          </div>
        </div>

        {/* SECTION 2: CHI TIẾT & TÌNH TRẠNG */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Tình trạng & Cấu hình</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tình trạng *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="NEW">Mới 100%</option>
                <option value="LIKE_NEW">Như mới (99%)</option>
                <option value="GOOD">Đã dùng ít (90%+)</option>
                <option value="USED">Đã dùng nhiều</option>
                <option value="NEED_REPAIR">Cần sửa chữa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Chất liệu khung</label>
              <select name="frameMaterial" value={formData.frameMaterial} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="CARBON">Carbon</option>
                <option value="ALUMINUM">Nhôm (Aluminum)</option>
                <option value="STEEL">Thép (Steel)</option>
                <option value="TITANIUM">Titanium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Kích cỡ khung (Size)</label>
              <select name="frameSize" value={formData.frameSize} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="SIZE_47">47cm</option>
                <option value="SIZE_49">49cm</option>
                <option value="SIZE_51">51cm</option>
                <option value="SIZE_53">53cm</option>
                <option value="SIZE_55">55cm</option>
                <option value="SIZE_57">57cm</option>
                <option value="SIZE_59">59cm</option>
                <option value="SIZE_61">61cm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Loại phanh</label>
              <select name="brakeType" value={formData.brakeType} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="DISC_HYDRAULIC">Disc Hydraulic</option>
                <option value="DISC_MECHANICAL">Disc Mechanical</option>
                <option value="RIM_BRAKE">Rim Brake</option>
                <option value="V_BRAKE">V-Brake</option>
                <option value="CANTILEVER">Cantilever</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Groupset</label>
              <select name="groupset" value={formData.groupset} onChange={handleChange} className="w-full border p-2 rounded">
                <optgroup label="Shimano Road">
                  <option value="SHIMANO_DURA_ACE">Shimano Dura-Ace</option>
                  <option value="SHIMANO_ULTEGRA">Shimano Ultegra</option>
                  <option value="SHIMANO_105">Shimano 105</option>
                  <option value="SHIMANO_TIAGRA">Shimano Tiagra</option>
                  <option value="SHIMANO_SORA">Shimano Sora</option>
                  <option value="SHIMANO_CLARIS">Shimano Claris</option>
                </optgroup>
                <optgroup label="Shimano MTB">
                  <option value="SHIMANO_XTR">Shimano XTR</option>
                  <option value="SHIMANO_XT">Shimano XT</option>
                  <option value="SHIMANO_SLX">Shimano SLX</option>
                  <option value="SHIMANO_DEORE">Shimano Deore</option>
                </optgroup>
                <optgroup label="SRAM">
                  <option value="SRAM_RED">SRAM Red</option>
                  <option value="SRAM_FORCE">SRAM Force</option>
                  <option value="SRAM_RIVAL">SRAM Rival</option>
                  <option value="SRAM_APEX">SRAM Apex</option>
                </optgroup>
                <optgroup label="Campagnolo">
                  <option value="CAMPAGNOLO_SUPER_RECORD">Campagnolo Super Record</option>
                  <option value="CAMPAGNOLO_RECORD">Campagnolo Record</option>
                  <option value="CAMPAGNOLO_CHORUS">Campagnolo Chorus</option>
                </optgroup>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Số km đã đi</label>
              <input type="number" name="mileage" min="0" max="999999" value={formData.mileage} onChange={handleChange} 
                className="w-full border p-2 rounded" placeholder="0" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-1">Mô tả chi tiết * <span className="text-xs text-gray-500">(20-2000 ký tự)</span></label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" minLength="20" maxLength="2000"
                className="w-full border p-2 rounded" placeholder="Mô tả chi tiết về xe, lịch sử sử dụng, vết xước nếu có..." />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 ký tự</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: GIÁ BÁN & ĐỊA ĐIỂM */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Giá bán & Khu vực</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-semibold mb-1">Giá bán (VNĐ) * <span className="text-xs text-gray-500">(≥ 100,000)</span></label>
              <input required type="number" min="100000" max="999999999" name="price" value={formData.price} onChange={handleChange} 
                className="w-full border p-2 rounded text-lg font-bold text-[#ff6b35]" placeholder="15000000" />
              
              <div className="mt-2 flex items-center">
                <input type="checkbox" id="allowNegotiation" name="allowNegotiation" checked={formData.allowNegotiation} onChange={handleChange} className="mr-2" />
                <label htmlFor="allowNegotiation" className="text-sm text-gray-600">Cho phép người mua thương lượng giá</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Thành phố *</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="HO_CHI_MINH">TP. Hồ Chí Minh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Quận/Huyện *</label>
                <select name="district" value={formData.district} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="QUAN_1">Quận 1</option>
                  <option value="QUAN_2">Quận 2</option>
                  <option value="QUAN_3">Quận 3</option>
                  <option value="QUAN_4">Quận 4</option>
                  <option value="QUAN_5">Quận 5</option>
                  <option value="QUAN_6">Quận 6</option>
                  <option value="QUAN_7">Quận 7</option>
                  <option value="QUAN_8">Quận 8</option>
                  <option value="QUAN_9">Quận 9</option>
                  <option value="QUAN_10">Quận 10</option>
                  <option value="QUAN_11">Quận 11</option>
                  <option value="QUAN_12">Quận 12</option>
                  <option value="QUAN_BINH_THANH">Quận Bình Thạnh</option>
                  <option value="QUAN_GO_VAP">Quận Gò Vấp</option>
                  <option value="QUAN_PHU_NHUAN">Quận Phú Nhuận</option>
                  <option value="QUAN_TAN_BINH">Quận Tân Bình</option>
                  <option value="QUAN_TAN_PHU">Quận Tân Phú</option>
                  <option value="QUAN_THU_DUC">Quận Thủ Đức</option>
                  <option value="HUYEN_BINH_CHANH">Huyện Bình Chánh</option>
                  <option value="HUYEN_CAN_GIO">Huyện Cần Giờ</option>
                  <option value="HUYEN_CU_CHI">Huyện Củ Chi</option>
                  <option value="HUYEN_HOC_MON">Huyện Hóc Môn</option>
                  <option value="HUYEN_NHA_BE">Huyện Nhà Bè</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HÌNH ẢNH */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Hình ảnh thực tế (Tối đa 5 ảnh)</h2>
          
          <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mb-4" />
          
          <div className="flex gap-4 overflow-x-auto py-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24 flex-shrink-0">
                <img src={url} alt="Preview" className="w-full h-full object-cover rounded border" />
                <button type="button" onClick={() => removeImage(index)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  X
                </button>
              </div>
            ))}
            {previewUrls.length === 0 && (
              <p className="text-sm text-gray-400 italic">Chưa có hình ảnh nào được chọn.</p>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors">
            {loading ? 'Đang xử lý...' : 'Đăng bán ngay'}
          </button>
        </div>
      </form>

      {/* HIỂN THỊ MODAL MUA GÓI KHI ĐĂNG THÀNH CÔNG */}
      {showSubscribeModal && newlyCreatedPostId && (
        <SubscribeModal 
          postId={newlyCreatedPostId} 
          onClose={handleCloseModal} 
        />
      )}

      {/* TOAST NOTIFICATIONS */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}