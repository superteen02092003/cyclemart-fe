import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { MOCK_MY_LISTINGS } from '@/constants/mockData'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

const STATUS_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'REJECTED', label: 'Bị từ chối' },
]

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', badge: 'subtle' },
  PENDING_REVIEW: { label: 'Chờ duyệt', badge: 'navy' },
  ACTIVE: { label: 'Đang bán', badge: 'verified' },
  SOLD: { label: 'Đã bán', badge: 'subtle' },
  REJECTED: { label: 'Từ chối', badge: 'subtle' },
}

function ListingCard({ listing, onAction }) {
  const cfg = STATUS_CONFIG[listing.status]

  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
      <div className="flex gap-4">
        {/* Thumbnail placeholder */}
        <div className="w-20 h-20 flex-shrink-0 rounded-sm bg-surface-secondary flex items-center justify-center border border-border-light">
          <span
            className="material-symbols-outlined text-content-tertiary"
            style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 0" }}
          >
            directions_bike
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-content-primary leading-snug line-clamp-2">
              {listing.title}
            </h3>
            <Badge variant={cfg.badge} className="flex-shrink-0">
              {cfg.label}
            </Badge>
          </div>

          <p className="text-base font-bold text-content-primary mb-1">{formatPrice(listing.price)}</p>

          <div className="flex items-center gap-3 text-xs text-content-secondary mb-2">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[0.85rem]">visibility</span>
              {listing.views} lượt xem
            </span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[0.85rem]">calendar_today</span>
              {listing.createdAt}
            </span>
          </div>

          {/* Rejected reason */}
          {listing.status === 'REJECTED' && listing.rejectedReason && (
            <div className="flex items-start gap-1.5 bg-error/5 border border-error/20 rounded-sm px-3 py-2 mt-2">
              <span className="material-symbols-outlined text-error text-[0.9rem] mt-0.5">error</span>
              <p className="text-xs text-error">{listing.rejectedReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-light">
        {listing.status === 'DRAFT' && (
          <>
            <Link to={`${ROUTES.SELL}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Chỉnh sửa
              </Button>
            </Link>
            <button
              onClick={() => onAction('submit', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#ff6b35' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
            >
              <span className="material-symbols-outlined text-[0.9rem]">send</span>
              Submit
            </button>
          </>
        )}

        {listing.status === 'PENDING_REVIEW' && (
          <Button variant="secondary" size="sm" disabled>
            <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
            Đang xử lý...
          </Button>
        )}

        {listing.status === 'ACTIVE' && (
          <>
            <Link to={`${ROUTES.SELL}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Chỉnh sửa
              </Button>
            </Link>
            <button
              onClick={() => onAction('hide', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-content-secondary border border-border-light rounded-sm hover:bg-surface-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[0.9rem]">visibility_off</span>
              Ẩn tin
            </button>
            <button
              onClick={() => onAction('boost', listing.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#1e3a5f' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a4f7a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
            >
              <span className="material-symbols-outlined text-[0.9rem]">rocket_launch</span>
              Mua gói ưu tiên
            </button>
          </>
        )}

        {listing.status === 'SOLD' && (
          <Link to={`/bike/${listing.id}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
              Xem
            </Button>
          </Link>
        )}

        {listing.status === 'REJECTED' && (
          <Link to={`${ROUTES.SELL}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">edit</span>
              Chỉnh sửa lại
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState('ALL')
  const [listings, setListings] = useState(MOCK_MY_LISTINGS)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleAction = (action, id) => {
    if (action === 'submit') {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'PENDING_REVIEW' } : l))
      )
      showToast('Đã gửi tin để kiểm duyệt!')
    } else if (action === 'hide') {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'DRAFT' } : l))
      )
      showToast('Đã ẩn tin đăng.')
    } else if (action === 'boost') {
      showToast('Tính năng mua gói ưu tiên sẽ ra mắt sớm!')
    }
  }

  const filtered = useMemo(
    () => (activeTab === 'ALL' ? listings : listings.filter((l) => l.status === activeTab)),
    [activeTab, listings]
  )

  // Stats
  const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0)
  const activeCount = listings.filter((l) => l.status === 'ACTIVE').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Tin đăng của tôi</h1>
          <p className="text-sm text-content-secondary mt-0.5">Quản lý các tin đăng bán xe của bạn</p>
        </div>
        <Link to={ROUTES.SELL}>
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors"
            style={{ backgroundColor: '#ff6b35' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff7849')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
          >
            <span className="material-symbols-outlined text-[1rem]">add</span>
            Đăng tin mới
          </button>
        </Link>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green/10 border border-green/20 rounded-sm mb-4 text-sm font-medium" style={{ color: '#10b981' }}>
          <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tổng tin', value: listings.length, icon: 'article' },
          { label: 'Đang bán', value: activeCount, icon: 'sell' },
          { label: 'Tổng lượt xem', value: totalViews, icon: 'visibility' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-sm border border-border-light shadow-card px-4 py-3 text-center">
            <span className="material-symbols-outlined text-content-secondary text-[1.2rem]">{icon}</span>
            <p className="text-xl font-bold text-content-primary">{value}</p>
            <p className="text-xs text-content-secondary">{label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-surface-secondary rounded-sm p-1 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === 'ALL'
              ? listings.length
              : listings.filter((l) => l.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.value
                  ? 'bg-white text-content-primary shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.value ? 'bg-surface-secondary text-content-primary' : 'bg-border-light text-content-secondary'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Listing cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span
            className="material-symbols-outlined text-content-tertiary mb-3"
            style={{ fontSize: '3.5rem', fontVariationSettings: "'FILL' 0" }}
          >
            article
          </span>
          <p className="text-base font-semibold text-content-primary mb-1">Không có tin đăng</p>
          <p className="text-sm text-content-secondary mb-5">
            {activeTab === 'ALL'
              ? 'Bạn chưa có tin đăng nào. Bắt đầu đăng tin ngay!'
              : `Không có tin đăng nào ở trạng thái "${STATUS_TABS.find((t) => t.value === activeTab)?.label}".`}
          </p>
          <Link to={ROUTES.SELL}>
            <button
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors"
              style={{ backgroundColor: '#ff6b35' }}
            >
              <span className="material-symbols-outlined text-[1rem]">add</span>
              Đăng tin mới
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
