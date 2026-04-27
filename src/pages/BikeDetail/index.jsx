import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { bikePostService } from '@/services/bikePost'
import { sellerRatingService } from '@/services/sellerRating'
import { authService } from '@/services/auth'
import { chatService } from '@/services/chat'
import { LoginRequiredModal } from '@/components/modals'
import { wishlistService } from '@/services/wishlist'
import { inspectionService } from '@/services/inspection'
import { cn } from '@/utils/cn'

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[0.9rem]"
          style={{
            fontVariationSettings: i < Math.round(rating) ? "'FILL' 1" : "'FILL' 0",
            color: i < Math.round(rating) ? '#f59e0b' : '#d1d5db',
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

StarRating.propTypes = {
  rating: PropTypes.number,
  max: PropTypes.number,
}

// Image Viewer Modal Component
function ImageViewerModal({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!images || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-24">
        <img
          src={images[currentIndex]}
          alt={`Ảnh ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

ImageViewerModal.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
}

// Facebook-style Image Gallery Component
function ImageGallery({ images, title, postStatus }) {
  const [showViewer, setShowViewer] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const openViewer = (index) => {
    setViewerIndex(index)
    setShowViewer(true)
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden relative">
        <div className="relative aspect-[16/9] bg-surface-secondary flex items-center justify-center">
          <span
            className="material-symbols-outlined text-content-tertiary"
            style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 0" }}
          >
            directions_bike
          </span>
        </div>
        {postStatus === 'APPROVED' && (
          <div className="absolute top-3 left-3">
            <Badge variant="verified">
              <span
                className="material-symbols-outlined text-[0.7rem]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >verified</span>
              Đã duyệt
            </Badge>
          </div>
        )}
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <>
        <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden relative">
          <div className="relative aspect-[16/9] bg-surface-secondary cursor-pointer group" onClick={() => openViewer(0)}>
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                zoom_in
              </span>
            </div>
          </div>
          {postStatus === 'APPROVED' && (
            <div className="absolute top-3 left-3">
              <Badge variant="verified">
                <span
                  className="material-symbols-outlined text-[0.7rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >verified</span>
                Đã duyệt
              </Badge>
            </div>
          )}
        </div>
        {showViewer && (
          <ImageViewerModal
            images={images}
            initialIndex={viewerIndex}
            onClose={() => setShowViewer(false)}
          />
        )}
      </>
    )
  }

  if (images.length === 2) {
    return (
      <>
        <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden relative">
          <div className="grid grid-cols-2 gap-1">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] bg-surface-secondary cursor-pointer group"
                onClick={() => openViewer(index)}
              >
                <img
                  src={image}
                  alt={`${title} - Ảnh ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                    zoom_in
                  </span>
                </div>
              </div>
            ))}
          </div>
          {postStatus === 'APPROVED' && (
            <div className="absolute top-3 left-3">
              <Badge variant="verified">
                <span
                  className="material-symbols-outlined text-[0.7rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >verified</span>
                Đã duyệt
              </Badge>
            </div>
          )}
        </div>
        {showViewer && (
          <ImageViewerModal
            images={images}
            initialIndex={viewerIndex}
            onClose={() => setShowViewer(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden relative">
        <div className="grid grid-cols-2 gap-1 h-96">
          {/* Main large image */}
          <div
            className="relative bg-surface-secondary cursor-pointer group"
            onClick={() => openViewer(0)}
          >
            <img
              src={images[0]}
              alt={`${title} - Ảnh chính`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                zoom_in
              </span>
            </div>
          </div>

          {/* Right side thumbnails */}
          <div className="grid grid-rows-2 gap-1">
            {images.slice(1, 3).map((image, index) => (
              <div
                key={index + 1}
                className="relative bg-surface-secondary cursor-pointer group"
                onClick={() => openViewer(index + 1)}
              >
                <img
                  src={image}
                  alt={`${title} - Ảnh ${index + 2}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    zoom_in
                  </span>
                </div>

                {/* Show "+X more" overlay on last visible image if there are more */}
                {index === 1 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <span className="material-symbols-outlined text-3xl mb-1 block">photo_library</span>
                      <span className="text-lg font-bold">+{images.length - 3}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Image count badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="subtle">
            <span className="material-symbols-outlined text-[0.75rem]">photo_library</span>
            {images.length} ảnh
          </Badge>
        </div>

        {/* Approved badge */}
        {postStatus === 'APPROVED' && (
          <div className="absolute top-3 left-3">
            <Badge variant="verified">
              <span
                className="material-symbols-outlined text-[0.7rem]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >verified</span>
              Đã duyệt
            </Badge>
          </div>
        )}
      </div>

      {showViewer && (
        <ImageViewerModal
          images={images}
          initialIndex={viewerIndex}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  )
}

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  postStatus: PropTypes.string,
}

function OfferModal({ bike, onClose }) {
  const [offerPrice, setOfferPrice] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-sm shadow-card-hover w-full max-w-md p-8 text-center">
          <span
            className="material-symbols-outlined text-green mb-3"
            style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1", color: '#10b981' }}
          >
            check_circle
          </span>
          <h3 className="text-lg font-bold text-content-primary mb-2">Đã gửi đề xuất!</h3>
          <p className="text-sm text-content-secondary mb-6">
            Người bán sẽ xem xét và phản hồi đề xuất của bạn sớm nhất.
          </p>
          <Button variant="primary" onClick={onClose} fullWidth>
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-sm shadow-card-hover w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-base font-bold text-content-primary">Đặt giá đề xuất</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-surface-secondary rounded-sm px-4 py-3">
            <p className="text-xs text-content-secondary mb-0.5">Giá niêm yết</p>
            <p className="text-base font-bold text-content-primary">{formatPrice(bike.price)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1.5">
              Giá đề xuất của bạn (₫) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              required
              max={bike.price}
              placeholder="Nhập giá đề xuất"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1.5">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              rows={3}
              placeholder="Lý do đặt giá, điều kiện kèm theo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Hủy
            </Button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#ff6b35' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
            >
              Gửi đề xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

OfferModal.propTypes = {
  bike: PropTypes.shape({
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
}

export default function BikeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState('')

  // 🔥 MỚI: State cho Cảnh báo trước khi Checkout
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false)

  const [sellerInfo, setSellerInfo] = useState(null)
  const [sellerRatings, setSellerRatings] = useState([])
  const [loadingSellerInfo, setLoadingSellerInfo] = useState(false)
  const hasFetchedBikeRef = useRef(false)

  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [ratingError, setRatingError] = useState('')

  // State cho biên bản kiểm định
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [criteria, setCriteria] = useState([])
  const [isLoadingReport, setIsLoadingReport] = useState(false)

  const currentUser = authService.getCurrentUser()
  const currentUserId = currentUser?.id ?? currentUser?.userId ?? currentUser?.sub
  const sellerId = bike?.userId ?? bike?.sellerId ?? bike?.ownerId ?? bike?.user?.id
  const isOwnPost = Boolean(
    currentUserId && sellerId && String(currentUserId) === String(sellerId)
  )
  const sellerProfilePath = sellerId ? `${ROUTES.PROFILE}?sellerId=${sellerId}` : ROUTES.PROFILE

  useEffect(() => {
    const fetchBikeData = async () => {
      if (!id || hasFetchedBikeRef.current === id) return

      hasFetchedBikeRef.current = id
      try {
        setLoading(true)
        const data = await bikePostService.getById(id)
        const bikeData = data?.result || data?.data || data
        setBike(bikeData)
        setError(null)

        // NẾU XE ĐÃ KIỂM ĐỊNH -> LẤY BIÊN BẢN VÀ TIÊU CHÍ
        if (bikeData?.isVerified) {
          setIsLoadingReport(true)
          try {
            const [report, allCriteria] = await Promise.all([
              inspectionService.getLatestPassed(bikeData.id),
              inspectionService.getActiveCriteria()
            ])
            setReportData(report)
            setCriteria(allCriteria)
          } catch (err) {
            console.error("Không thể tải biên bản kiểm định:", err)
          } finally {
            setIsLoadingReport(false)
          }
        }

      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu xe')
        setBike(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBikeData()
  }, [id])

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!sellerId) return

      try {
        setLoadingSellerInfo(true)

        const infoResponse = await sellerRatingService.getSellerInfo(sellerId)
        const sellerInfoData = infoResponse?.data || infoResponse || null
        setSellerInfo(sellerInfoData)

        const ratingsResponse = await sellerRatingService.getSellerRatings(sellerId, 0, 5)
        const ratingsData = ratingsResponse?.data || ratingsResponse || {}
        const ratings = ratingsData?.ratings?.content || ratingsData?.content || ratingsData?.ratings || []
        setSellerRatings(Array.isArray(ratings) ? ratings : [])
      } catch (err) {
        console.error('Lỗi khi tải thông tin seller:', err)
        setSellerInfo(null)
        setSellerRatings([])
      } finally {
        setLoadingSellerInfo(false)
      }
    }

    fetchSellerInfo()
  }, [sellerId])

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!bike?.id || isOwnPost || !authService.isAuthenticated()) {
        setIsWishlisted(false)
        return
      }

      try {
        const response = await wishlistService.checkInWishlist(bike.id)
        setIsWishlisted(Boolean(response?.isInWishlist))
      } catch (err) {
        console.error('Lỗi khi kiểm tra wishlist:', err)
      }
    }

    checkWishlistStatus()
  }, [bike?.id, isOwnPost])

  // 🔥 ĐÃ SỬA: Hiển thị bảng cảnh báo thay vì vào checkout liền
  const handleBuyNow = () => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      setLoginAction('mua hàng')
      setShowLoginModal(true)
      return
    }
    // Mở bảng cảnh báo
    setShowCheckoutWarning(true)
  }

  // Hàm chạy sau khi user xác nhận đồng ý quy định
  const proceedToCheckout = () => {
    setShowCheckoutWarning(false)
    navigate(`/checkout/${bike.id}`)
  }

  const handleOfferClick = () => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      setLoginAction('đặt giá')
      setShowLoginModal(true)
      return
    }
    setShowOfferModal(true)
  }

  const handleMessageSeller = async () => {
    if (!bike?.id) return
    try {
      const room = await chatService.createOrGetRoom(bike.id)
      const roomId = room?.id || room?.roomId || room?.data?.id
      navigate(`/chat?bikePostId=${bike.id}${roomId ? `&roomId=${roomId}` : ''}`)
    } catch (err) {
      console.error('Không tạo được room chat:', err)
      navigate(`/chat?bikePostId=${bike.id}`)
    }
  }

  const handleWishlistToggle = async () => {
    if (!bike?.id || wishlistLoading) return

    if (!authService.isAuthenticated()) {
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích.')
      navigate(ROUTES.LOGIN)
      return
    }

    try {
      setWishlistLoading(true)
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(bike.id)
        setIsWishlisted(false)
      } else {
        await wishlistService.addToWishlist(bike.id)
        setIsWishlisted(true)
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể cập nhật danh sách yêu thích'
      alert(message)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    setRatingError('Bạn chỉ có thể đánh giá người bán từ trang đơn hàng đã hoàn tất.')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-content-tertiary mb-4 block" style={{ fontVariationSettings: "'FILL' 0" }}>
              directions_bike
            </span>
            <p className="text-content-secondary">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !bike) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
            <p className="text-content-secondary mb-4">{error || 'Không tìm thấy xe'}</p>
            <Link to={ROUTES.BROWSE}>
              <Button variant="primary">Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const passedCriteriaIds = reportData?.checklistData ? JSON.parse(reportData.checklistData) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-content-secondary mb-6">
        <Link to={ROUTES.HOME} className="hover:text-content-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[0.9rem]">chevron_right</span>
        <Link to={ROUTES.BROWSE} className="hover:text-content-primary transition-colors">Mua xe</Link>
        <span className="material-symbols-outlined text-[0.9rem]">chevron_right</span>
        <span className="text-content-primary font-medium line-clamp-1">{bike.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery
            images={bike.images}
            title={bike.title}
            postStatus={bike.postStatus}
          />

          {/* Title & Price (Mobile View) */}
          <div className="lg:hidden mb-4">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <h1 className="text-xl font-bold text-content-primary">{bike.title}</h1>
              {bike.isVerified && (
                <Badge variant="verified" className="py-1 px-2 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[0.8rem] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Đã kiểm định
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col items-start gap-1">
              <p className="text-2xl font-black text-[#ff6b35]">{formatPrice(bike.price)}</p>
              {bike.isVerified && (
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1.5 text-navy hover:text-[#ff6b35] text-sm font-bold transition-colors group mt-1"
                >
                  <span className="material-symbols-outlined text-[1.1rem] group-hover:scale-110 transition-transform">fact_check</span>
                  <span className="underline decoration-dotted underline-offset-4">Xem biên bản kiểm định</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
            <h2 className="text-base font-bold text-content-primary mb-3">Mô tả</h2>
            <p className="text-sm text-content-secondary leading-relaxed whitespace-pre-line">
              {bike.description || 'Chưa có mô tả chi tiết.'}
            </p>
          </div>

          {/* Specs */}
          <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
            <h2 className="text-base font-bold text-content-primary mb-4">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Loại xe', value: bike.categoryName || 'Không rõ' },
                { label: 'Thương hiệu', value: bike.brand || 'Không rõ' },
                { label: 'Model', value: bike.model || 'Không rõ' },
                { label: 'Năm sản xuất', value: bike.year || 'Không rõ' },
                { label: 'Chất liệu khung', value: bike.frameMaterial || 'Không rõ' },
                { label: 'Size khung', value: bike.frameSize ? `${bike.frameSize} cm` : 'Không rõ' },
                { label: 'Groupset', value: bike.groupset || 'Không rõ' },
                { label: 'Hãm', value: bike.brakeType || 'Không rõ' },
              ].map(({ label, value }) => (
                <div key={label} className="py-2 border-b border-border-light last:border-0">
                  <p className="text-xs text-content-secondary mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-content-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review */}
          <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
            <h3 className="text-sm font-semibold text-content-primary mb-3">
              Đánh giá của bạn
            </h3>

            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  onClick={() => setMyRating(i + 1)}
                  className="material-symbols-outlined cursor-pointer"
                  style={{
                    fontVariationSettings: i < myRating ? "'FILL' 1" : "'FILL' 0",
                    color: i < myRating ? '#f59e0b' : '#d1d5db',
                  }}
                >
                  star
                </span>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Nhận xét của bạn..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-sm text-sm mb-3"
            />

            <Button
              disabled
              onClick={handleSubmitRating}
              fullWidth
            >
              Đánh giá từ đơn hàng
            </Button>

            {ratingError && (
              <p className="text-error text-xs mt-2">{ratingError}</p>
            )}
            {!ratingError && (
              <p className="text-content-secondary text-xs mt-2">
                Để đảm bảo đúng giao dịch, hệ thống chỉ cho đánh giá ở mục đơn hàng đã hoàn tất.
              </p>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
            <h2 className="text-base font-bold text-content-primary mb-4">
              Đánh giá người bán
              {sellerRatings.length > 0 && (
                <span className="ml-2 text-sm font-normal text-content-secondary">({sellerRatings.length} đánh giá)</span>
              )}
            </h2>

            {sellerRatings.length === 0 ? (
              <p className="text-sm text-content-secondary">Chưa có đánh giá nào.</p>
            ) : (
              <div className="space-y-4">
                {sellerRatings.map((rev) => {
                  const reviewerProfilePath = rev.buyerId ? `${ROUTES.PROFILE}?userId=${rev.buyerId}` : ROUTES.PROFILE
                  const reviewerName = rev.buyerName || rev.buyer?.buyerName || rev.buyer?.fullName || rev.userName || 'Khách hàng'
                  const orderTitle =
                    rev.bikePostTitle ||
                    rev.bikeTitle ||
                    rev.postTitle ||
                    rev.bikePost?.title ||
                    rev.paymentDescription ||
                    rev.payment?.description ||
                    ''
                  const reviewScore = Number(rev.score || 0)
                  return (
                    <div key={rev.id} className="pb-4 border-b border-border-light last:border-0 group">
                      <div className="flex items-start gap-2 mb-1.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: '#ff6b35' }}
                        >
                          {reviewerName ? reviewerName.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={reviewerProfilePath}
                            className="text-sm font-semibold text-content-primary transition-all duration-200 hover:text-orange hover:underline hover:decoration-orange hover:decoration-2 hover:underline-offset-4"
                          >
                            {reviewerName}
                            {orderTitle ? (
                              <span className="ml-1 text-xs font-medium text-content-secondary">- Đơn hàng: {orderTitle}</span>
                            ) : null}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2">
                            <StarRating rating={reviewScore} />
                            <span className="text-xs text-content-secondary">{reviewScore.toFixed(1)} / 5</span>
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-content-secondary whitespace-nowrap">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                        </span>
                      </div>
                      <p className="text-sm text-content-secondary pl-10">{rev.comment || 'Không có nhận xét'}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>


        {/* ── Right column (sticky) ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="sticky top-24 space-y-4">
            
            {/* Price card */}
            <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
              
              {/* Desktop Title & Badge */}
              <div className="hidden lg:flex items-start justify-between gap-2 mb-3 flex-wrap">
                <h1 className="text-lg font-bold text-content-primary leading-snug flex-1">
                  {bike.title}
                </h1>
                {bike.isVerified && (
                  <Badge variant="verified" className="shrink-0 mt-0.5 py-1 px-2">
                    <span className="material-symbols-outlined text-[0.8rem] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Đã kiểm định
                  </Badge>
                )}
              </div>

              {/* Price & View Report Button */}
              <div className="flex flex-col items-start gap-1 mb-4">
                <p className="text-3xl font-black text-[#ff6b35]">{formatPrice(bike.price)}</p>
                {bike.isVerified && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center gap-1.5 text-navy hover:text-[#ff6b35] text-sm font-bold transition-colors group mt-1"
                  >
                    <span className="material-symbols-outlined text-[1.1rem] group-hover:scale-110 transition-transform">fact_check</span>
                    <span className="underline decoration-dotted underline-offset-4">Xem biên bản kiểm định</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {bike.allowNegotiation && (
                  <Badge variant="navy">Thương lượng</Badge>
                )}
                {bike.postStatus === 'APPROVED' && (
                  <Badge variant="verified">
                    <span
                      className="material-symbols-outlined text-[0.7rem]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >verified</span>
                    Đã duyệt
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-content-secondary mb-5">
                <span className="material-symbols-outlined text-[0.9rem]">location_on</span>
                {bike.district && bike.city ? `${bike.district}, ${bike.city}` : bike.city || 'Không xác định'}
                <span className="ml-auto flex items-center gap-1">
                  <span className="material-symbols-outlined text-[0.9rem]">visibility</span>
                  {bike.viewCount || 0} lượt xem
                </span>
              </div>

              {isOwnPost ? (
                <div className="mb-3 rounded-sm border border-navy/15 bg-navy/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-navy text-white flex-shrink-0">
                      <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-navy">Bài của tôi</p>
                      <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                        Bạn đang xem bài đăng của chính mình. Hãy chỉnh sửa nội dung, ảnh hoặc theo dõi phản hồi trong mục tin của tôi.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 text-sm font-bold text-white rounded-sm mb-3 transition-colors"
                    style={{ backgroundColor: '#ff6b35' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
                  >
                    Mua ngay
                  </button>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleOfferClick}
                    className="mb-4"
                  >
                    <span className="material-symbols-outlined text-[1rem]">gavel</span>
                    Đặt giá
                  </Button>
                </>
              )}

              {isOwnPost ? null : (
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border text-sm font-semibold transition-colors ${
                    isWishlisted
                      ? 'border-red-300 text-red-500 bg-red-50'
                      : 'border-border-light text-content-secondary hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                  } ${wishlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span
                    className="material-symbols-outlined text-[1rem]"
                    style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  {isWishlisted ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
                </button>
              )}
            </div>

            {/* Seller card */}
            <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
              <h3 className="text-sm font-bold text-content-primary mb-3">Người bán</h3>
              {loadingSellerInfo ? (
                <p className="text-xs text-content-secondary">Đang tải thông biến...</p>
              ) : sellerInfo ? (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: '#ff6b35' }}
                    >
                      {sellerInfo.sellerName ? sellerInfo.sellerName.charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={sellerProfilePath}
                        className="text-sm font-semibold text-content-primary transition-all duration-200 hover:text-orange hover:underline hover:decoration-orange hover:decoration-2 hover:underline-offset-4"
                      >
                        {sellerInfo.sellerName || 'Người bán'}
                      </Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={sellerInfo.averageScore || 0} />
                        <span className="text-xs text-content-secondary ml-1">
                          {sellerInfo.averageScore?.toFixed(1) || '0.0'} ({sellerInfo.totalRatings || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-content-secondary">
                        <span className="material-symbols-outlined text-[0.85rem] transition-colors duration-200 group-hover:text-orange">location_on</span>
                        {bike.district && bike.city ? `${bike.district}, ${bike.city}` : bike.city || 'Không xác định'}
                      </div>
                    </div>
                  </div>

                  {!isOwnPost ? (
                    <Button variant="secondary" fullWidth className="mt-4" size="sm" onClick={handleMessageSeller}>
                      <span className="material-symbols-outlined text-[1rem]">chat_bubble</span>
                      Nhắn tin
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                      style={{ backgroundColor: '#ff6b35' }}
                    >
                      ?
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content-primary">Người bán</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={0} />
                        <span className="text-xs text-content-secondary ml-1">
                          0.0 (0)
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isOwnPost ? (
                    <Button variant="secondary" fullWidth className="mt-4" size="sm" onClick={handleMessageSeller}>
                      <span className="material-symbols-outlined text-[1rem]">chat_bubble</span>
                      Nhắn tin
                    </Button>
                  ) : null}
                </>
              )}
            </div>

            {/* Safety tip */}
            <div className="bg-surface-secondary rounded-sm border border-border-light p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[1rem] mt-0.5" style={{ color: '#ff6b35' }}>shield</span>
                <div>
                  <p className="text-xs font-semibold text-content-primary mb-0.5">Giao dịch an toàn</p>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    Chỉ giao dịch qua nền tảng CycleMart để được bảo vệ. Không chuyển tiền trực tiếp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL CẢNH BÁO TRƯỚC KHI CHECKOUT */}
      {showCheckoutWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center text-[#ff6b35] mx-auto mb-4">
                <span className="material-symbols-outlined text-[2rem]">warning</span>
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Lưu ý trước khi giao dịch</h3>
              <p className="text-sm text-content-secondary leading-relaxed mb-4">
                Nền tảng <strong>CycleMart</strong> chỉ hỗ trợ giải quyết tranh chấp (hoàn tiền, trả hàng) đối với những xe <strong>đã được kiểm định</strong> (có tem Đã kiểm định).
              </p>

              {/* Thông báo mạnh nếu xe chưa kiểm định */}
              {!bike?.isVerified && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-sm text-sm text-red-600 font-medium mb-4 text-left shadow-sm">
                  <span className="material-symbols-outlined text-[1rem] inline-block align-middle mr-1">info</span>
                  Chiếc xe này chưa được kiểm định. Bạn vui lòng tự chịu rủi ro và kiểm tra kỹ thông tin trước khi xác nhận nhận xe nhé.
                </div>
              )}

              <p className="text-sm font-semibold text-content-primary">Bạn có đồng ý tiếp tục mua xe không?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-border-light border-t border-border-light">
              <button
                onClick={() => setShowCheckoutWarning(false)}
                className="p-3.5 bg-white text-content-secondary font-semibold hover:bg-surface-secondary transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={proceedToCheckout}
                className="p-3.5 bg-white text-[#ff6b35] font-bold hover:bg-orange/5 transition-colors"
              >
                Đồng ý tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BÁO CÁO KIỂM ĐỊNH */}
      {showReport && reportData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border-light bg-surface-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-[1.4rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">Biên bản kiểm định xe</h2>
                  <p className="text-xs text-content-secondary mt-0.5">Xác nhận bởi CycleMart vào {new Date(reportData.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <button onClick={() => setShowReport(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-content-tertiary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1.1rem] text-[#ff6b35]">checklist</span>
                  Tình trạng các bộ phận
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {criteria.map((item) => {
                    const isPassed = passedCriteriaIds.includes(item.id);
                    return (
                      <div key={item.id} className={cn(
                        "flex items-center justify-between p-3 rounded-sm border",
                        isPassed ? "bg-green-50/50 border-green-100" : "bg-gray-50 border-gray-100"
                      )}>
                        <span className="text-sm font-medium text-content-primary">{item.name}</span>
                        {isPassed ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <span className="material-symbols-outlined text-[1.1rem]">check_circle</span> Đạt
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <span className="material-symbols-outlined text-[1.1rem]">info</span> Cần lưu ý
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-5 rounded-sm relative">
                 <span className="material-symbols-outlined absolute -top-3 -left-1 text-[#1e3a5f]/20 text-4xl">format_quote</span>
                 <h3 className="text-sm font-bold text-navy flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[1.1rem] text-[#1e3a5f]">comment</span>
                  Đánh giá chi tiết từ Inspector
                </h3>
                <p className="text-sm text-content-primary leading-relaxed italic relative z-10">
                  "{reportData.resultNote || 'Chuyên gia không có ghi chú bổ sung cho bài đăng này.'}"
                </p>
              </div>

              <div className="p-4 bg-surface-secondary rounded-sm text-[0.7rem] text-content-secondary leading-relaxed">
                <strong>Lưu ý:</strong> Biên bản kiểm định này dựa trên tình trạng quan sát được tại thời điểm kiểm tra. CycleMart khuyến khích người mua nên trao đổi kỹ và có thể xem xe trực tiếp để có trải nghiệm chính xác nhất trước khi thanh toán.
              </div>
            </div>

            <div className="p-4 border-t border-border-light bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowReport(false)}
                className="px-8 py-2.5 bg-navy text-white text-sm font-bold rounded-sm hover:bg-navy-light transition-colors shadow-sm"
              >
                Đóng biên bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer modal */}
      {!isOwnPost && showOfferModal && (
        <OfferModal bike={bike} onClose={() => setShowOfferModal(false)} />
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action={loginAction}
      />
    </div>
  )
}