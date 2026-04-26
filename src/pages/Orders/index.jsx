import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';
import { ordersService } from '@/services/orders';
import { authService } from '@/services/auth';
import DeliveryModal from '@/components/orders/DeliveryModal';
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import DisputeModal from '@/components/orders/DisputeModal';
import ReviewModal from '@/components/orders/ReviewModal';

const STATUS_LABELS = {
  PENDING_PAYMENT:       { text: 'Chờ thanh toán',      color: 'bg-navy/10 text-navy' },
  PAID_WAITING_DELIVERY: { text: 'Chờ giao hàng',        color: 'bg-orange/10 text-orange' },
  IN_DELIVERY:           { text: 'Đang giao hàng',       color: 'bg-blue-500/10 text-blue-600' },
  DELIVERED:             { text: 'Đã nhận hàng',         color: 'bg-green/10 text-green' },
  RETURN_REQUESTED:      { text: 'Yêu cầu hoàn hàng',   color: 'bg-error/10 text-error' },
  DISPUTE_SYSTEM:        { text: 'Đang tranh chấp',      color: 'bg-error/10 text-error' },
  COMPLETED:             { text: 'Hoàn tất',             color: 'bg-green/10 text-green' },
  CANCELLED:             { text: 'Đã hủy',               color: 'bg-content-tertiary/20 text-content-secondary' },
};

function OrderCard({ order, onAction, openDeliveryModal, openDisputeModal, openReviewModal }) {
  const isBuyer = order.role === 'BUYER';
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (actionFn, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(true);
    try {
      await actionFn();
      onAction();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
      <div className="flex justify-between items-start border-b border-border-light pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wide">Mã Đơn: {order.orderId}</span>
            <span className="text-xs text-content-tertiary">·</span>
            <span className="text-xs text-content-secondary">{order.createdAt}</span>
          </div>
          <p className="text-sm font-semibold text-content-primary">
            {isBuyer ? 'Người bán:' : 'Người mua:'}{' '}
            <span className="text-navy">{isBuyer ? order.sellerName : order.buyerName}</span>
          </p>
        </div>
        <div className={cn('px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide', STATUS_LABELS[order.orderStatus]?.color || '')}>
          {STATUS_LABELS[order.orderStatus]?.text || order.orderStatus}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-20 h-20 bg-surface-secondary rounded-sm border border-border-light flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-content-tertiary text-[2rem]">directions_bike</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-content-primary mb-1 line-clamp-1">{order.bikeTitle}</h3>
          <p className="text-lg font-black text-orange mb-1">{formatPrice(order.amount)}</p>
          {order.escrowPoints > 0 && (
            <p className="text-xs text-content-secondary">
              <span className="font-semibold">Escrow:</span> {order.escrowPoints.toLocaleString()} điểm đang giữ
            </p>
          )}
        </div>
      </div>

      {/* Delivery info for IN_DELIVERY+ */}
      {order.deliveryMethod && (
        <div className="mt-3 p-3 bg-surface-secondary rounded-sm text-xs text-content-secondary border border-border-light">
          <span className="font-semibold text-content-primary">Giao hàng:</span>{' '}
          {order.deliveryMethod === 'HANDOFF' ? 'Trao tay trực tiếp' : 'Đơn vị vận chuyển'}
          {order.deliveryEvidenceUrls && (
            <a href={order.deliveryEvidenceUrls} target="_blank" rel="noopener noreferrer"
              className="ml-2 text-navy underline">Xem bằng chứng</a>
          )}
        </div>
      )}

      {/* Auto-release countdown for DELIVERED */}
      {order.orderStatus === 'DELIVERED' && order.autoReleaseAt && (
        <div className="mt-3 p-3 bg-orange/10 border border-orange/20 rounded-sm text-xs text-orange">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">schedule</span>
          Điểm escrow sẽ tự động giải phóng cho người bán vào{' '}
          <strong>{new Date(order.autoReleaseAt).toLocaleDateString('vi-VN')}</strong> nếu không có tranh chấp
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-5 flex justify-end flex-wrap gap-3 pt-4 border-t border-border-light">
        {/* PENDING_PAYMENT — buyer */}
        {order.orderStatus === 'PENDING_PAYMENT' && isBuyer && order.paymentUrl && (
          <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer"
            className="py-2.5 px-6 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors">
            Thanh toán ngay
          </a>
        )}

        {/* PAID_WAITING_DELIVERY — seller submits delivery */}
        {order.orderStatus === 'PAID_WAITING_DELIVERY' && !isBuyer && (
          <button
            disabled={actionLoading}
            onClick={() => openDeliveryModal(order)}
            className="py-2.5 px-6 bg-navy text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
          >
            Xác nhận đã giao hàng
          </button>
        )}

        {/* PAID_WAITING_DELIVERY — buyer can cancel */}
        {order.orderStatus === 'PAID_WAITING_DELIVERY' && isBuyer && (
          <button
            disabled={actionLoading}
            onClick={() => handleAction(
              () => ordersService.cancelRequest(order.paymentId, 'Người mua yêu cầu hủy'),
              'Yêu cầu hủy đơn hàng'
            )}
            className="py-2.5 px-4 text-xs font-bold border border-error text-error hover:bg-error/5 rounded-sm transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'Đang xử lý...' : 'Yêu cầu hủy'}
          </button>
        )}

        {/* IN_DELIVERY — buyer confirms received */}
        {order.orderStatus === 'IN_DELIVERY' && isBuyer && (
          <button
            disabled={actionLoading}
            onClick={() => handleAction(
              () => ordersService.confirmReceived(order.paymentId),
              'Xác nhận đã nhận được hàng'
            )}
            className="py-2.5 px-6 bg-green text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[1rem]">check_circle</span>
            {actionLoading ? 'Đang xử lý...' : 'Đã nhận được hàng'}
          </button>
        )}

        {/* DELIVERED — buyer can open dispute or complete */}
        {order.orderStatus === 'DELIVERED' && isBuyer && (
          <>
            {order.verifiedAtPurchase && (
              <button
                onClick={() => openDisputeModal(order)}
                className="py-2.5 px-4 text-xs font-bold border border-error text-error hover:bg-error/5 rounded-sm transition-colors"
              >
                Yêu cầu tranh chấp
              </button>
            )}
            <button
              disabled={actionLoading}
              onClick={() => openReviewModal(order)}
              className="py-2.5 px-6 bg-navy text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
            >
              Hoàn thành & Đánh giá
            </button>
          </>
        )}

        {/* RETURN_REQUESTED — seller responds */}
        {order.orderStatus === 'RETURN_REQUESTED' && !isBuyer && (
          <>
            <button
              disabled={actionLoading}
              onClick={() => alert('Liên hệ Admin để xử lý tranh chấp')}
              className="py-2.5 px-4 text-xs font-bold text-content-secondary hover:bg-surface-secondary rounded-sm transition-colors"
            >
              Từ chối (liên hệ Admin)
            </button>
          </>
        )}
        {order.orderStatus === 'RETURN_REQUESTED' && isBuyer && (
          <span className="py-2.5 text-xs text-content-secondary">Đang chờ Admin xử lý...</span>
        )}

        {/* DISPUTE_SYSTEM */}
        {order.orderStatus === 'DISPUTE_SYSTEM' && (
          <span className="py-2.5 text-xs text-content-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
            Đang chờ Admin giải quyết tranh chấp
          </span>
        )}

        <Link to={`/bike/${order.bikePostId}`}>
          <button className="py-2.5 px-4 border border-border-light text-content-secondary hover:bg-surface-secondary text-xs font-bold rounded-sm transition-colors">
            Xem Chi Tiết Xe
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('BUYER');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);

  const currentUser = authService.getCurrentUser();

  const mapPayment = useCallback((payment) => {
    const isBuyer = payment.userId === currentUser?.id;
    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      bikePostId: payment.bikePostId,
      bikeTitle: payment.bikeTitle || 'Xe đạp',
      amount: payment.amount,
      orderStatus: payment.orderStatus || (payment.status === 'SUCCESS' ? 'PAID_WAITING_DELIVERY' : 'PENDING_PAYMENT'),
      role: isBuyer ? 'BUYER' : 'SELLER',
      buyerName: payment.buyerName || 'Người mua',
      sellerName: payment.sellerName || 'Người bán',
      createdAt: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('vi-VN') : '',
      paymentUrl: payment.paymentUrl || null,
      escrowPoints: payment.escrowPoints || 0,
      verifiedAtPurchase: payment.verifiedAtPurchase || false,
      deliveryMethod: payment.deliveryMethod || null,
      deliveryEvidenceUrls: payment.deliveryEvidenceUrls || null,
      deliveredAt: payment.deliveredAt || null,
      autoReleaseAt: payment.autoReleaseAt || null,
    };
  }, [currentUser?.id]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersService.getPaymentHistory(0, 50);
      const mapped = (response.content || [])
        .filter(p => p.type === 'ORDER_PAYMENT')
        .map(mapPayment);
      setOrders(mapped);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [mapPayment]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = useMemo(
    () => orders.filter(o => o.role === activeTab),
    [orders, activeTab]
  );

  const handleReviewSuccess = () => {
    setReviewOrder(null);
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-content-secondary">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary mb-1">Đơn hàng của tôi</h1>
        <p className="text-sm text-content-secondary">Quản lý giao dịch mua và bán an toàn qua hệ thống escrow điểm</p>
      </div>

      <div className="flex gap-4 border-b border-border-light mb-6">
        <button
          onClick={() => setActiveTab('BUYER')}
          className={cn('pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors',
            activeTab === 'BUYER' ? 'border-orange text-orange' : 'border-transparent text-content-secondary hover:text-content-primary')}
        >
          Đơn mua của tôi
        </button>
        <button
          onClick={() => setActiveTab('SELLER')}
          className={cn('pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors',
            activeTab === 'SELLER' ? 'border-orange text-orange' : 'border-transparent text-content-secondary hover:text-content-primary')}
        >
          Đơn bán của tôi
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 text-error text-sm">{error}</div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[4rem] text-content-tertiary mb-3">inbox</span>
          <h3 className="text-base font-semibold text-content-primary mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-sm text-content-secondary">Bạn chưa thực hiện giao dịch nào ở mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.paymentId}
              order={order}
              onAction={fetchOrders}
              openDeliveryModal={setDeliveryOrder}
              openReturnModal={setReturnOrder}
              openDisputeModal={setDisputeOrder}
              openReviewModal={setReviewOrder}
            />
          ))}
        </div>
      )}

      {deliveryOrder && (
        <DeliveryModal
          order={deliveryOrder}
          onClose={() => setDeliveryOrder(null)}
          onSuccess={() => { setDeliveryOrder(null); fetchOrders(); }}
        />
      )}
      {returnOrder && (
        <ReturnRequestModal
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={() => { setReturnOrder(null); fetchOrders(); }}
        />
      )}
      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSuccess={() => { setDisputeOrder(null); fetchOrders(); }}
        />
      )}
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
