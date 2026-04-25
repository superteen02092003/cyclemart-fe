import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { postService } from '@/services/post'
import { sellerRatingService } from '@/services/sellerRating'

const normalizeVietnameseText = (value) => {
  if (typeof value !== 'string' || !value) return value

  try {
    const hasMojibake = /[ÃÂáàảãạăắằẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/.test(value)
    if (!hasMojibake) return value
    return decodeURIComponent(escape(value))
  } catch {
    return value
  }
}

const renderStars = (score = 0) => {
  const rounded = Math.round(Number(score) || 0)
  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={index}
      className={`material-symbols-outlined text-[18px] ${index < rounded ? 'text-amber-500' : 'text-border-light'}`}
    >
      star
    </span>
  ))
}

const formatDate = (value) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const profileUserId = searchParams.get('sellerId') || searchParams.get('userId') || user?.id
  const isOwnProfile = String(profileUserId) === String(user?.id)
  const [loading, setLoading] = useState(false)
  const [sellerInfo, setSellerInfo] = useState({ sellerName: '', sellerEmail: '', sellerPhone: '', averageScore: 0, totalRatings: 0 })
  const [posts, setPosts] = useState([])
  const [ratings, setRatings] = useState([])
  const [showAllRecentPosts, setShowAllRecentPosts] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [profileUserId])

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileUserId) return

      setLoading(true)
      try {
        let postsData = []
        try {
          postsData = profileUserId === user?.id
            ? await postService.getMyPosts()
            : await postService.getPostsByUserId(profileUserId)
        } catch {
          postsData = await postService.getMyPosts()
        }

        const [infoRes, ratingsRes] = await Promise.allSettled([
          sellerRatingService.getSellerInfo(profileUserId),
          sellerRatingService.getSellerRatings(profileUserId, 0, 5),
        ])

        if (infoRes.status === 'fulfilled') {
          const payload = infoRes.value || {}
          const seller = payload.seller || payload || {}
          setSellerInfo({
            sellerName: normalizeVietnameseText(seller.sellerName || user?.fullName || user?.email || 'User'),
            sellerEmail: seller.sellerEmail || seller.email || user?.email || '',
            sellerPhone: seller.phone || seller.phoneNumber || user?.phone || '',
            averageScore: Number(seller.averageScore ?? seller.averageRating ?? 0),
            totalRatings: Number(seller.totalRatings ?? seller.totalReviews ?? 0),
          })
        } else {
          setSellerInfo({
            sellerName: normalizeVietnameseText(user?.fullName || user?.email || 'User'),
            sellerEmail: user?.email || '',
            sellerPhone: user?.phone || '',
            averageScore: 0,
            totalRatings: 0,
          })
        }

        const list = postsData?.content || postsData?.result || postsData || []
        setPosts(Array.isArray(list) ? list : [])

        if (ratingsRes.status === 'fulfilled') {
          const payload = ratingsRes.value || {}
          const ratingPage = payload.ratings || payload
          const list = ratingPage?.content || ratingPage?.ratings || ratingPage || []
          setRatings(Array.isArray(list) ? list : [])
        } else {
          setRatings([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profileUserId, user])

  const displayName = useMemo(
    () => normalizeVietnameseText(sellerInfo.sellerName || user?.fullName || user?.email || 'User'),
    [sellerInfo.sellerName, user]
  )

  const displayEmail = user?.email || sellerInfo.sellerEmail || 'Chưa cập nhật'
  const displayPhone = user?.phone || sellerInfo.sellerPhone || 'Chưa cập nhật'
  const showContactCards = isOwnProfile

  const totalPosts = posts.length
  const sellingPosts = posts.filter((post) => {
    const status = String(post?.status || post?.postStatus || '').toUpperCase()
    const displayStatus = String(post?.postStatusDisplay || '').toUpperCase()
    return (
      status === 'APPROVED' ||
      status === 'ACTIVE' ||
      status === 'SELLING' ||
      displayStatus === 'ĐÃ DUYỆT' ||
      post?.isActive === true
    )
  })
  const recentSellingPosts = sellingPosts.slice(0, 3)
  const visibleRecentPosts = showAllRecentPosts ? sellingPosts : recentSellingPosts
  const latestRatings = ratings.slice(0, 5)
  const ratingScore = Number(sellerInfo.averageScore || 0)
  const ratingCount = Number(sellerInfo.totalRatings || 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6">
        <section className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-card">
          <div className="bg-gradient-to-r from-navy via-navy-medium to-slate-800 px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[14px]">storefront</span>
                  Marketplace Profile
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-3xl font-bold leading-tight sm:text-4xl">{displayName}</h1>
                  <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-sm">
                    {renderStars(ratingScore)}
                    <span className="ml-1 text-sm font-semibold text-white">{ratingScore.toFixed(1)}</span>
                    <span className="text-xs text-white/80">({ratingCount} đánh giá)</span>
                  </div>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  Trang hồ sơ người dùng trên CycleMart.
                </p>
              </div>

              {isOwnProfile && (
                <Link
                  to={ROUTES.SETTINGS}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Cài đặt
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="text-sm text-content-secondary">Đang tải hồ sơ...</div>
            ) : (
              <div className={`grid gap-4 ${showContactCards ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                {showContactCards && (
                  <>
                    <div className="rounded-2xl border border-border-light bg-surface-secondary/40 p-4 shadow-sm text-center">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-content-primary shadow-sm mx-auto">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <p className="text-xs uppercase tracking-wider text-content-tertiary">Email</p>
                      <p className="mt-1 text-sm font-semibold text-content-primary break-words">{displayEmail}</p>
                    </div>
                    <div className="rounded-2xl border border-border-light bg-surface-secondary/40 p-4 shadow-sm text-center">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-content-primary shadow-sm mx-auto">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </div>
                      <p className="text-xs uppercase tracking-wider text-content-tertiary">Số điện thoại</p>
                      <p className="mt-1 text-sm font-semibold text-content-primary">{displayPhone}</p>
                    </div>
                  </>
                )}
                <div className="rounded-2xl border border-border-light bg-surface-secondary/40 p-4 shadow-sm text-center">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-content-primary shadow-sm mx-auto">
                    <span className="material-symbols-outlined text-[18px]">article</span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-content-tertiary">Tổng tin</p>
                  <p className="mt-1 text-sm font-semibold text-content-primary">{totalPosts}</p>
                </div>
                <div className="rounded-2xl border border-border-light bg-surface-secondary/40 p-4 shadow-sm text-center">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-content-primary shadow-sm mx-auto">
                    <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-content-tertiary">Đang bán</p>
                  <p className="mt-1 text-sm font-semibold text-content-primary">{sellingPosts.length}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-border-light bg-cyan-50 px-6 py-5 sm:px-8">
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Tin gần đây</h2>
              <p className="text-sm text-content-secondary">Các bài đăng mới nhất đang hoạt động trên cửa hàng của bạn</p>
            </div>
            {isOwnProfile && (
              <Link to={ROUTES.MY_LISTINGS} className="text-sm font-semibold text-orange hover:underline">
                Xem tất cả
              </Link>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {recentSellingPosts.length > 0 ? (
              <div className="space-y-4">
                {visibleRecentPosts.map((post) => {
                  const postViewCount = Number(post.views ?? post.viewCount ?? post.view_count ?? 0)
                  return (
                    <Link
                      key={post.id}
                      to={`/bike/${post.id}`}
                      className="group block rounded-none border border-cyan-400/15 bg-gradient-to-br from-white/8 to-cyan-400/10 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-content-primary line-clamp-1 group-hover:text-orange">{post.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-content-secondary">
                            {post.description || 'Không có mô tả'}
                          </p>
                        </div>
                        <span className="ml-4 whitespace-nowrap text-sm font-semibold text-navy">
                          {typeof post.price === 'number' ? post.price.toLocaleString('vi-VN') : post.price || 'Liên hệ'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-content-tertiary">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          {postViewCount} lượt xem
                        </span>
                        {post.createdAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            {formatDate(post.createdAt)}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-none border border-dashed border-orange-300/30 bg-gradient-to-br from-orange-50 to-cyan-50 px-6 py-12 text-center shadow-sm">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <span className="material-symbols-outlined text-[1.8rem]">inventory_2</span>
                </div>
                <p className="text-base font-bold text-content-primary">Chưa có tin nào</p>
                {isOwnProfile ? (
                  <>
                    <p className="mt-2 text-sm text-content-secondary leading-relaxed max-w-md mx-auto">
                      Khi bài đăng được duyệt, nó sẽ xuất hiện ở đây. Bạn có thể đăng tin mới bất cứ lúc nào.
                    </p>
                    <Link
                      to={ROUTES.SELL}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange to-orange/90 px-5 py-3 text-sm font-bold text-orange shadow-lg shadow-orange/25 ring-1 ring-orange/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/30 hover:from-orange/95 hover:to-orange"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Đăng bài ngay
                    </Link>
                  </>
                ) : null}
              </div>
            )}

            {sellingPosts.length > 3 && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllRecentPosts((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-orange/20 bg-orange/5 px-4 py-2.5 text-sm font-semibold text-orange transition-colors hover:bg-orange/10"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showAllRecentPosts ? 'expand_less' : 'expand_more'}
                  </span>
                  {showAllRecentPosts ? 'Thu gọn' : 'Xem thêm'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-border-light bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border-light bg-orange-50 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-lg font-semibold text-content-primary">Đánh giá từ người mua</h2>
            <p className="text-sm text-content-secondary">{ratingCount} lượt đánh giá gần đây</p>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {latestRatings.length > 0 ? (
            latestRatings.map((item, index) => {
              const reviewerProfileId = item.buyerId || item.userId || item.reviewerId
              const reviewerName = item.buyerName || item.buyer?.buyerName || item.buyer?.fullName || item.userName || 'Người dùng'
              const reviewerHref = reviewerProfileId ? `${ROUTES.PROFILE}?userId=${reviewerProfileId}` : ROUTES.PROFILE
              return (
                <div key={item.id || index} className="rounded-none border border-border-light bg-surface-secondary/40 p-4 shadow-sm transition-all hover:border-orange/20 hover:shadow-card">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Link
                      to={reviewerHref}
                      className="text-sm font-semibold text-content-primary transition-all duration-200 hover:text-orange hover:underline hover:decoration-orange hover:decoration-2 hover:underline-offset-4"
                    >
                      {reviewerName}
                    </Link>
                    <div className="flex items-center gap-1">{renderStars(item.score ?? item.averageScore ?? 0)}</div>
                  </div>
                  <div className="rounded-none border border-border-light bg-white px-4 py-3 shadow-sm">
                    {item.comment ? (
                      <p className="text-sm leading-6 text-content-secondary">{item.comment}</p>
                    ) : (
                      <p className="text-sm italic text-content-tertiary">Không có nhận xét</p>
                    )}
                  </div>
                  {item.createdAt && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-content-tertiary">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {formatDate(item.createdAt)}
                    </p>
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-sm text-content-secondary">Chưa có đánh giá nào.</p>
          )}
        </div>
      </section>
    </div>
  )
}
