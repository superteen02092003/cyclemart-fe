import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { bikePostService } from '@/services/bikePost'
import { sellerRatingService } from '@/services/sellerRating'

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

function OfferModal({ bike, onClose }) {
  const [offerPrice, setOfferPrice] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const minPrice = bike.price * 0.5

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
        {/* Header */}
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
          {/* Reference price */}
          <div className="bg-surface-secondary rounded-sm px-4 py-3">
            <p className="text-xs text-content-secondary mb-0.5">Giá niêm yết</p>
            <p className="text-base font-bold text-content-primary">{formatPrice(bike.price)}</p>
          </div>

          {/* Offer price input */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1.5">
              Giá đề xuất của bạn (₫) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              required
              min={minPrice}
              max={bike.price}
              placeholder="Nhập giá đề xuất"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors"
            />
            <p className="text-xs text-content-secondary mt-1">
              Giá đề xuất tối thiểu 50% giá niêm yết ({formatPrice(minPrice)})
            </p>
          </div>

          {/* Note */}
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

export default function BikeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)

  const [sellerInfo, setSellerInfo] = useState(null)
  const [sellerRatings, setSellerRatings] = useState([])
  const [loadingSellerInfo, setLoadingSellerInfo] = useState(false)
  const hasFetchedBikeRef = useRef(false)

  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [ratingError, setRatingError] = useState('')

  const sellerId = bike?.userId ?? bike?.sellerId ?? bike?.ownerId ?? bike?.user?.id

  useEffect(() => {
    const fetchBikeData = async () => {
      if (!id || hasFetchedBikeRef.current === id) return

      hasFetchedBikeRef.current = id
      try {
        setLoading(true)
        const data = await bikePostService.getById(id)
        setBike(data?.result || data?.data || data)
        setError(null)
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

  const handleBuyNow = () => {
    navigate(`/checkout/${bike.id}`)
  }

  const handleSubmitRating = async () => {
    if (!sellerId) {
      setRatingError('Không tìm thấy người bán để gửi đánh giá.')
      return
    }
    if (!myRating) {
      setRatingError('Vui lòng chọn số sao đánh giá.')
      return
    }

    try {
      setSubmittingRating(true)
      setRatingError('')

      const payload = {
        sellerId,
        score: myRating,
        comment: myComment,
      }

      await sellerRatingService.createOrUpdateRating(payload.sellerId, payload.score, payload.comment)

      setMyRating(0)
      setMyComment('')

      const ratingsResponse = await sellerRatingService.getSellerRatings(sellerId, 0, 5)
      const ratingsData = ratingsResponse?.data || ratingsResponse || {}
      const ratings = ratingsData?.ratings?.content || ratingsData?.content || ratingsData?.ratings || []
      setSellerRatings(Array.isArray(ratings) ? ratings : [])

      const infoResponse = await sellerRatingService.getSellerInfo(sellerId)
      setSellerInfo(infoResponse?.data || infoResponse || null)

      alert('Đánh giá thành công!')
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err)
      const message = err?.response?.data?.errors?.sellerId || err?.response?.data?.message || 'Gửi đánh giá thất bại!'
      setRatingError(message)
      alert(message)
    } finally {
      setSubmittingRating(false)
    }
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
          {/* Image area */}
          <div className="bg-white rounded-sm border border-border-light shadow-card overflow-hidden">
            <div className="relative aspect-[16/9] bg-surface-secondary flex items-center justify-center">
              {bike.images && bike.images.length > 0 ? (
                <img
                  src={bike.images[0]}
                  alt={bike.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="material-symbols-outlined text-content-tertiary"
                  style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 0" }}
                >
                  directions_bike
                </span>
              )}
              <div className="absolute bottom-3 right-3">
                <Badge variant="subtle">
                  <span className="material-symbols-outlined text-[0.75rem]">photo_library</span>
                  {bike.images?.length || 0} ảnh
                </Badge>
              </div>
              {bike.postStatus === 'APPROVED' && (
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
          </div>

          {/* Title (mobile) */}
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-content-primary mb-2">{bike.title}</h1>
            <p className="text-2xl font-black text-content-primary">{formatPrice(bike.price)}</p>
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

            {/* Chọn sao */}
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

            {/* Comment */}
            <textarea
              rows={3}
              placeholder="Nhận xét của bạn..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-sm text-sm mb-3"
            />

            {/* Submit */}
            <Button
              disabled={!myRating || submittingRating}
              onClick={handleSubmitRating}
              fullWidth
            >
              {submittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>

            {/* Error message */}
            {ratingError && (
              <p className="text-error text-xs mt-2">{ratingError}</p>
            )}
          </div>
          {/* Reviews */}
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
                {sellerRatings.map((rev) => (
                  <div key={rev.id} className="pb-4 border-b border-border-light last:border-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: '#ff6b35' }}
                      >
                        {rev.buyerName ? rev.buyerName.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-primary">{rev.buyerName || 'Khách hàng'}</p>
                        <StarRating rating={rev.score} />
                      </div>
                      <span className="ml-auto text-xs text-content-secondary">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>
                    <p className="text-sm text-content-secondary pl-10">{rev.comment || 'Không có nhận xét'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* ── Right column (sticky) ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-sm border border-border-light shadow-card p-6">
              <h1 className="hidden lg:block text-lg font-bold text-content-primary mb-3 leading-snug">
                {bike.title}
              </h1>

              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-black text-content-primary">{formatPrice(bike.price)}</p>
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

              {/* Buy now */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3 text-sm font-bold text-white rounded-sm mb-3 transition-colors"
                style={{ backgroundColor: '#ff6b35' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
              >
                Mua ngay
              </button>

              {/* showBuyNotice block removed because we navigate to checkout immediately */}

              {/* Make offer */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowOfferModal(true)}
                className="mb-4"
              >
                <span className="material-symbols-outlined text-[1rem]">gavel</span>
                Đặt giá
              </Button>

              {/* Wishlist toggle */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border text-sm font-semibold transition-colors ${
                  isWishlisted
                    ? 'border-red-300 text-red-500 bg-red-50'
                    : 'border-border-light text-content-secondary hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[1rem]"
                  style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                {isWishlisted ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
              </button>
            </div>

            {/* Seller card */}
            <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
              <h3 className="text-sm font-bold text-content-primary mb-3">Người bán</h3>
              {loadingSellerInfo ? (
                <p className="text-xs text-content-secondary">Đang tải thông tin...</p>
              ) : sellerInfo ? (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                      style={{ backgroundColor: '#ff6b35' }}
                    >
                      {sellerInfo.sellerName ? sellerInfo.sellerName.charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content-primary">{sellerInfo.sellerName || 'Người bán'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={sellerInfo.averageScore || 0} />
                        <span className="text-xs text-content-secondary ml-1">
                          {sellerInfo.averageScore?.toFixed(1) || '0.0'} ({sellerInfo.totalRatings || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-content-secondary">
                        <span className="material-symbols-outlined text-[0.85rem]">location_on</span>
                        {bike.district && bike.city ? `${bike.district}, ${bike.city}` : bike.city || 'Không xác định'}
                      </div>
                    </div>
                  </div>

                  <Link to={ROUTES.MESSAGES}>
                    <Button variant="secondary" fullWidth className="mt-4" size="sm">
                      <span className="material-symbols-outlined text-[1rem]">chat_bubble</span>
                      Nhắn tin
                    </Button>
                  </Link>
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

                  <Link to={ROUTES.MESSAGES}>
                    <Button variant="secondary" fullWidth className="mt-4" size="sm">
                      <span className="material-symbols-outlined text-[1rem]">chat_bubble</span>
                      Nhắn tin
                    </Button>
                  </Link>
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

      {/* Offer modal */}
      {showOfferModal && (
        <OfferModal bike={bike} onClose={() => setShowOfferModal(false)} />
      )}
    </div>
  )
}
