import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';

const STATUS_LABELS = {
  PENDING_PAYMENT:             { text: 'Chờ thanh toán',         color: 'bg-navy/10 text-navy border border-navy/20' },
  PENDING_SELLER_CONFIRMATION: { text: 'Chờ seller xác nhận',    color: 'bg-amber-100 text-amber-700 border border-amber-300' },
  PAID_WAITING_DELIVERY:       { text: 'Chờ giao hàng',          color: 'bg-orange/10 text-orange border border-orange/20' },
  IN_DELIVERY:                 { text: 'Đang vận chuyển',        color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  DELIVERED:                   { text: 'Đã nhận hàng',           color: 'bg-green/10 text-green border border-green/20' },
  RETURN_REQUESTED:            { text: 'Yêu cầu hoàn trả',      color: 'bg-error/10 text-error border border-error/20' },
  DISPUTE_SYSTEM:              { text: 'Đang tranh chấp',        color: 'bg-error/10 text-error border border-error/20' },
  COMPLETED:                   { text: 'Hoàn tất',               color: 'bg-gray-100 text-gray-600 border border-gray-200' },
  CANCELLED:                   { text: 'Đã hủy',                 color: 'bg-content-tertiary/20 text-content-secondary' },
};

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const isBuyer = order.role === 'BUYER';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-border-light px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-navy">receipt_long</span>
            Chi tiết đơn hàng
          </h2>
          <button onClick={onClose} className="text-content-secondary hover:text-content-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trạng thái đơn hàng */}
          <div className="bg-surface-secondary rounded-sm p-4 border border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-content-secondary">Trạng thái</span>
              <span className={cn('px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide', STATUS_LABELS[order.orderStatus]?.color || '')}>
                {STATUS_LABELS[order.orderStatus]?.text || order.orderStatus}
              </span>
            </div>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide border-b border-border-light pb-2">
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary mb-1">Mã đơn hàng</p>
                <p className="text-sm font-semibold text-content-primary">{order.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary mb-1">Ngày đặt</p>
                <p className="text-sm font-semibold text-content-primary">{order.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary mb-1">Loại đơn</p>
                <p className="text-sm font-semibold text-content-primary">
                  {isBuyer ? 'Đơn mua' : 'Đơn bán'}
                </p>
              </div>
              <div>
                <p className="text-xs text-content-secondary mb-1">Tổng tiền</p>
                <p className="text-lg font-black text-orange">{formatPrice(order.amount)}</p>
              </div>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide border-b border-border-light pb-2">
              Sản phẩm
            </h3>
            <div className="flex gap-4 p-4 bg-surface-secondary rounded-sm border border-border-light">
              <div className="w-20 h-20 bg-white rounded-sm border border-border-light flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-content-tertiary text-[2rem]">directions_bike</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-content-primary mb-1">{order.bikeTitle}</h4>
                <p className="text-sm text-content-secondary">Mã sản phẩm: {order.bikePostId}</p>
              </div>
            </div>
          </div>

          {/* Thông tin người mua/bán */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide border-b border-border-light pb-2">
              {isBuyer ? 'Thông tin người bán' : 'Thông tin người mua'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-content-secondary mb-1">Họ tên</p>
                <p className="text-sm font-semibold text-content-primary">
                  {isBuyer ? order.sellerName : order.buyerName}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          {(order.address || order.deliveryMethod) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide border-b border-border-light pb-2">
                Thông tin giao nhận
              </h3>
              <div className="space-y-3">
                {order.address && (
                  <div>
                    <p className="text-xs text-content-secondary mb-1">Địa chỉ giao hàng</p>
                    <p className="text-sm font-medium text-content-primary">{order.address}</p>
                  </div>
                )}
                {order.deliveryMethod && (
                  <div>
                    <p className="text-xs text-content-secondary mb-1">Phương thức giao hàng</p>
                    <p className="text-sm font-medium text-content-primary">
                      {order.deliveryMethod === 'HANDOFF' ? 'Trao tay trực tiếp' : 'Đơn vị vận chuyển'}
                    </p>
                  </div>
                )}
                {order.deliveryEvidenceUrls && (
                  <div>
                    <p className="text-xs text-content-secondary mb-1">Bằng chứng giao hàng</p>
                    <a
                      href={order.deliveryEvidenceUrls}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-navy underline hover:text-orange"
                    >
                      <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
                      Xem bằng chứng
                    </a>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-xs text-content-secondary mb-1">Thời gian giao hàng</p>
                    <p className="text-sm font-medium text-content-primary">
                      {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin escrow */}
          {order.escrowPoints > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide border-b border-border-light pb-2">
                Thông tin Escrow
              </h3>
              <div className="p-4 bg-orange/5 border border-orange/20 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-content-secondary">Điểm đang giữ</span>
                  <span className="text-lg font-bold text-orange">{order.escrowPoints.toLocaleString()} điểm</span>
                </div>
                {order.autoReleaseAt && (
                  <p className="text-xs text-content-secondary">
                    <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">schedule</span>
                    Tự động giải phóng vào {new Date(order.autoReleaseAt).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ghi chú từ Admin */}
          {order.adminNote && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">admin_panel_settings</span>
                Thông báo từ Admin
              </p>
              <p className="text-sm text-blue-800">{order.adminNote}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface-secondary border-t border-border-light px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-navy hover:bg-navy/90 text-white font-bold rounded-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
