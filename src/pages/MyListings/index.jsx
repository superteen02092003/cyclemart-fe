import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import InspectionModal from '@/components/inspection/InspectionModal'
import SubscribeModal from '@/components/seller/SubscribeModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { postService } from '@/services/post'
import api from '@/services/api'

const STATUS_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'INSPECTIONS', label: 'Dịch vụ Kiểm định' },
]

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', badge: 'subtle' },
  PENDING_REVIEW: { label: 'Chờ duyệt', badge: 'navy' },
  ACTIVE: { label: 'Đang bán', badge: 'verified' },
  APPROVED: { label: 'Đang bán', badge: 'verified' }, 
  PENDING: { label: 'Chờ duyệt', badge: 'navy' },     
  SOLD: { label: 'Đã bán', badge: 'subtle' },
  REJECTED: { label: 'Từ chối', badge: 'subtle' },
}

function ListingCard({ listing, onAction, onInspect, onDelete }) {
  const currentStatus = listing.postStatus || listing.status; 
  const cfg = STATUS_CONFIG[currentStatus] || { label: currentStatus, badge: 'subtle' }
  const viewCount = listing.views ?? listing.viewCount ?? listing.view_count ?? 0

  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <Link to={`/bike/${listing.id}`} className="w-20 h-20 flex-shrink-0 rounded-sm bg-surface-secondary flex items-center justify-center border border-border-light overflow-hidden hover:opacity-80 transition-opacity">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0].url} 
              alt={listing.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span
              className="material-symbols-outlined text-content-tertiary"
              style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 0" }}
            >
              directions_bike
            </span>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/bike/${listing.id}`} className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-content-primary leading-snug line-clamp-2 hover:text-navy transition-colors">
                {listing.title}
              </h3>
            </Link>
            
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {/* HIỂN THỊ TEM ƯU TIÊN VÀ HẠN SỬ DỤNG (HSD) */}
              {listing.activePriority && (
                <div className="flex flex-col items-end gap-0.5">
                  <Badge variant={listing.activePriority.priorityLevel?.toLowerCase()}>
                    <span className="material-symbols-outlined text-[0.8rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      diamond
                    </span>
                    {listing.activePriority.priorityLevel === 'PLATINUM' ? 'Kim Cương' :
                     listing.activePriority.priorityLevel === 'GOLD' ? 'Vàng' : 'Bạc'}
                  </Badge>
                  {listing.activePriority.endDate && (
                    <span className="text-[0.65rem] text-content-secondary font-medium mt-0.5">
                      HSD: {new Date(listing.activePriority.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              )}

              {/* Nhãn Đã kiểm định */}
              {listing.isVerified && (
                <Badge variant="verified">
                  <span className="material-symbols-outlined text-[0.8rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  Đã kiểm định
                </Badge>
              )}

              {/* Tem Không đạt kiểm định */}
              {!listing.isVerified && listing.inspectionStatus === 'FAILED' && (
                <Badge className="bg-error/10 text-error border border-error/20">
                  <span className="material-symbols-outlined text-[0.8rem]">
                    cancel
                  </span>
                  Chưa đạt kiểm định
                </Badge>
              )}

              {/* Nhãn Trạng thái tin */}
              <Badge variant={cfg.badge}>
                {cfg.label}
              </Badge>
            </div>
          </div>

          <p className="text-base font-bold text-content-primary mb-1">{formatPrice(listing.price)}</p>

          <div className="flex items-center gap-3 text-xs text-content-secondary mb-2">
            {viewCount != null && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[0.85rem]">visibility</span>
                {viewCount} lượt xem
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[0.85rem]">calendar_today</span>
              {listing.createdAt
                ? new Date(listing.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })
                : ''}
            </span>
          </div>

          {/* Rejected reason */}
          {currentStatus === 'REJECTED' && listing.rejectionReason && (
            <div className="flex items-start gap-1.5 bg-error/5 border border-error/20 rounded-sm px-3 py-2 mt-2">
              <span className="material-symbols-outlined text-error text-[0.9rem] mt-0.5">error</span>
              <p className="text-xs text-error">{listing.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-light">
        {currentStatus === 'DRAFT' && (
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

        {(currentStatus === 'PENDING_REVIEW' || currentStatus === 'PENDING') && (
          <>
            <Link to={`/bike/${listing.id}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
                Xem chi tiết
              </Button>
            </Link>
            <Button variant="secondary" size="sm" disabled>
              <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
              Đang xử lý...
            </Button>
            <Link to={`${ROUTES.SELL}?editId=${listing.id}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Sửa bài đăng
              </Button>
            </Link>
          </>
        )}

        {(currentStatus === 'ACTIVE' || currentStatus === 'APPROVED') && (
          <>
            <Link to={`${ROUTES.SELL}`}>
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[0.9rem]">edit</span>
                Chỉnh sửa
              </Button>
            </Link>

            {listing.activePriority ? (
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm cursor-not-allowed opacity-80"
                style={{ backgroundColor: '#64748b' }}
              >
                <span className="material-symbols-outlined text-[0.9rem]">check_circle</span>
                Đang dùng: {listing.activePriority.priorityLevel === 'PLATINUM' ? 'Kim Cương' : listing.activePriority.priorityLevel === 'GOLD' ? 'Vàng' : 'Bạc'}
              </button>
            ) : (
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
            )}

            {listing.isVerified ? (
  <button 
    disabled 
    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm cursor-not-allowed opacity-90" 
    style={{ backgroundColor: '#10b981' }}
  >
    <span className="material-symbols-outlined text-[0.9rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
    Xe đã kiểm định
  </button>
) : listing.isRequestedInspection ? (
  // KHÓA NÚT KHI ĐÃ ĐĂNG KÝ (Tương tự gói ưu tiên)
  <button 
    disabled 
    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm cursor-not-allowed opacity-80" 
    style={{ backgroundColor: '#64748b' }}
  >
    <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
    Đã đăng ký kiểm định
  </button>
) : (
  <button
    onClick={() => onInspect(listing)}
    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-sm transition-colors"
    style={{ backgroundColor: '#ff6b35' }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e05a2b')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b35')}
  >
    <span className="material-symbols-outlined text-[0.9rem]">verified</span>
    Đăng ký kiểm định
  </button>
            )}
          </>
        )}

        {currentStatus === 'SOLD' && (
          <Link to={`/bike/${listing.id}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
              Xem
            </Button>
          </Link>
        )}

        {currentStatus === 'REJECTED' && (
          <Link to={`${ROUTES.SELL}`}>
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[0.9rem]">edit</span>
              Chỉnh sửa lại
            </Button>
          </Link>
        )}

        <button
          onClick={() => onDelete(listing.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-error border border-error/30 rounded-sm hover:bg-error/5 transition-colors ml-auto"
        >
          <span className="material-symbols-outlined text-[0.9rem]">delete</span>
          Xóa
        </button>
      </div>
    </div>
  )
}

function InspectionHistory() {
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 MỚI: State để lưu thông tin đơn kiểm định đang xem chi tiết
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchMyInspections = async () => {
      try {
        const res = await api.get('/v1/inspections/me?page=0&size=50');
        if (res.data?.content) {
          setInspections(res.data.content);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách kiểm định:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyInspections();
  }, []);

  if (isLoading) {
    return <div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div></div>;
  }

  if (inspections.length === 0) {
    return (
      <div className="bg-white p-10 text-center rounded-sm border border-border-light shadow-sm mt-4">
        <span className="material-symbols-outlined text-4xl text-content-tertiary mb-2">health_and_safety</span>
        <p className="text-content-secondary font-medium">Bạn chưa đăng ký dịch vụ kiểm định nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[#ff6b35]">fact_check</span>
        Lịch sử đăng ký kiểm định
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspections.map(ins => (
          <div key={ins.id} className="bg-white p-5 rounded-sm border border-border-light shadow-sm relative overflow-hidden flex flex-col">
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              ins.status === 'PASSED' ? "bg-green-500" : 
              ins.status === 'FAILED' ? "bg-error" : "bg-warning"
            )} />
            
            <div className="pl-3 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-navy line-clamp-1">{ins.postTitle}</h3>
                <span className={cn(
  "text-[0.7rem] font-bold px-2 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap ml-3",
  ins.status === 'PASSED' ? "bg-green-100 text-green-700" : 
  ins.status === 'FAILED' ? "bg-error/10 text-error" : 
  ins.status === 'PENDING_PAYMENT' ? "bg-gray-100 text-gray-600" : "bg-warning/10 text-warning-content"
)}>
  {ins.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' :
   ins.status === 'PENDING' ? 'Chờ xếp lịch' :
   ins.status === 'ASSIGNED' ? 'Đã xếp lịch' :
   ins.status === 'INSPECTING' ? 'Đang kiểm tra' :
   ins.status === 'PASSED' ? 'Đã kiểm định' : 
   ins.status === 'FAILED' ? 'Cần sửa chữa' : 'Đang xử lý'}
</span>
              </div>
              
              <div className="text-sm text-content-secondary space-y-1.5 mt-3">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1rem]">calendar_clock</span>
                  {ins.scheduledDateTime ? new Date(ins.scheduledDateTime).toLocaleString('vi-VN') : 'Chưa xếp lịch'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1rem]">engineering</span>
                  Inspector: <span className="font-medium text-navy">{ins.inspectorName || 'Đang chờ phân công...'}</span>
                </p>
              </div>
            </div>

            {/* 🔥 MỚI: Nút Xem lại thông tin đăng ký */}
            <div className="pl-3 mt-4 pt-3 border-t border-border-light">
               <button
                  onClick={() => setSelectedDetail(ins)}
                  className="text-[#1e3a5f] hover:text-[#ff6b35] flex items-center gap-1 text-sm font-semibold transition-colors"
               >
                  <span className="material-symbols-outlined text-[1.1rem]">visibility</span>
                  Xem lại thông tin đã điền
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 MỚI: Modal hiển thị chi tiết cho Seller */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-[#1e3a5f]">Thông tin đăng ký của bạn</h3>
              <button onClick={() => setSelectedDetail(null)} className="material-symbols-outlined text-gray-500 hover:text-red-500 transition-colors">close</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[0.7rem] text-gray-500 uppercase font-bold tracking-wider">Bài đăng</label>
                <p className="text-sm font-medium text-[#1e3a5f]">{selectedDetail.postTitle}</p>
              </div>

              <div>
                <label className="text-[0.7rem] text-gray-500 uppercase font-bold tracking-wider">Địa điểm kiểm định</label>
                <p className="text-sm font-medium italic mt-0.5">
                  <span className="material-symbols-outlined text-sm inline-block align-middle mr-1 text-[#ff6b35]">location_on</span>
                  {selectedDetail.address || 'Không có địa chỉ cụ thể'}
                </p>
              </div>

              <div>
                <label className="text-[0.7rem] text-gray-500 uppercase font-bold tracking-wider">Thời gian mong muốn</label>
                <p className="text-sm font-medium">
                  {selectedDetail.scheduledDateTime 
                    ? new Date(selectedDetail.scheduledDateTime).toLocaleString('vi-VN') 
                    : 'Chưa chọn thời gian'}
                </p>
              </div>

              <div>
                <label className="text-[0.7rem] text-gray-500 uppercase font-bold tracking-wider">Ghi chú của bạn</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-sm border border-gray-200 text-sm italic text-gray-600">
                  {/* Hỗ trợ cả sellerNote hoặc note đề phòng sai lệch biến */}
                  {selectedDetail.sellerNote || selectedDetail.note || 'Không có ghi chú.'}
                </div>
              </div>

              {/* Nếu Inspector có ghi chú kết quả thì hiển thị luôn ở đây */}
              {selectedDetail.resultNote && (
                <div>
                  <label className="text-[0.7rem] text-[#ff6b35] uppercase font-bold tracking-wider">Phản hồi từ Inspector</label>
                  <div className="mt-1 p-3 bg-orange-50 rounded-sm border border-orange-100 text-sm text-gray-800">
                    {selectedDetail.resultNote}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedDetail(null)}
              className="w-full mt-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-sm hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState('ALL')
  const [listings, setListings] = useState([])
  const [toastMsg, setToastMsg] = useState('')
  const [inspectionTarget, setInspectionTarget] = useState(null)
  const [boostTarget, setBoostTarget] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMyListings()
  }, [])

  const loadMyListings = async () => {
    try {
      setLoading(true)
      const data = await postService.getMyPosts()
      setListings(data?.content || data || [])
    } catch (error) {
      console.error('Error loading my listings:', error)
    } finally {
      setLoading(false)
    }
  }

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
    } else if (action === 'boost') {
      setBoostTarget(id)
    } else if (action === 'cancel') {
      handleCancelPost(id)
    }
  }

  const handleCancelPost = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy yêu cầu đăng tin này? Bạn có thể chỉnh sửa và gửi lại sau.')) return
    try {
      setLoading(true)
      await postService.cancelPost(id)
      await loadMyListings()
      showToast('Đã hủy yêu cầu đăng tin.')
    } catch (error) {
      console.error('Error canceling post:', error)
      alert(error.message || 'Lỗi khi hủy yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tin đăng này?')) return
    try {
      setLoading(true)
      await postService.delete(id)
      await loadMyListings()
      showToast('Đã xóa tin đăng.')
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert(error.message || 'Lỗi khi xóa tin đăng')
    } finally {
      setLoading(false)
    }
  }

  const handleInspect = (listing) => {
    setInspectionTarget(listing.id)
  }

  const filtered = useMemo
    (() => (activeTab === 'ALL' ? listings : listings.filter((l) => (l.postStatus || l.status) === activeTab || 
         (activeTab === 'ACTIVE' && l.postStatus === 'APPROVED') || 
         (activeTab === 'PENDING_REVIEW' && l.postStatus === 'PENDING'))),
    [activeTab, listings]
  )

  const totalViews = listings.reduce((sum, l) => {
    const viewCount = Number(l.views ?? l.viewCount ?? l.view_count ?? 0)
    return sum + (Number.isFinite(viewCount) ? viewCount : 0)
  }, 0)
  const activeCount = listings.filter((l) => (l.postStatus || l.status) === 'ACTIVE' || l.postStatus === 'APPROVED').length

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="text-content-secondary">Đang tải danh sách tin đăng...</span>
        </div>
      </div>
    )
  }

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
          let count = 0;
          if (tab.value === 'ALL') {
            count = listings.length;
          } else if (tab.value !== 'INSPECTIONS') {
            count = listings.filter((l) => (l.postStatus || l.status) === tab.value || 
                   (tab.value === 'ACTIVE' && l.postStatus === 'APPROVED') || 
                   (tab.value === 'PENDING_REVIEW' && l.postStatus === 'PENDING')).length;
          }

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
              {tab.value !== 'INSPECTIONS' && count > 0 && (
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

      {/* Nội dung bên dưới Tabs */}
      {activeTab === 'INSPECTIONS' ? (
        <InspectionHistory />
      ) : filtered.length === 0 ? (
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
            <ListingCard
              key={listing.id}
              listing={listing}
              onAction={handleAction}
              onInspect={handleInspect}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}

      {/* Inspection Modal */}
      {inspectionTarget && (
        <InspectionModal
          preselectedId={inspectionTarget}
          onClose={() => setInspectionTarget(null)}
        />
      )}

      {/* Modal Mua gói Ưu Tiên */}
      {boostTarget && (
        <SubscribeModal
          postId={boostTarget}
          onClose={() => setBoostTarget(null)}
          onSuccess={() => {
            setBoostTarget(null)
            loadMyListings()
            showToast('Đăng ký gói ưu tiên thành công!')
          }}
        />
      )}
    </div>
  )
}