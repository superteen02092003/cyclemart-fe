import { useState, useMemo, useEffect, useCallback } from 'react';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';
import { ordersService, disputeService } from '@/services/orders';
import { toast } from '@/utils/toast';
import DeliveryModal from '@/components/orders/DeliveryModal';
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import DisputeModal from '@/components/orders/DisputeModal';
import ReviewModal from '@/components/orders/ReviewModal';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import { useOrderUpdates, useDisputeUpdates } from '@/hooks/useWebSocket';

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

const DISPUTE_STATUS_LABELS = {
  OPENED:                  { text: 'Chờ phản hồi',         color: 'text-orange bg-orange/10 border-orange/20' },
  SELLER_APPROVED:         { text: 'Bạn đã đồng ý hoàn',   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  SELLER_REJECTED:         { text: 'Đã chuyển Admin',       color: 'text-gray-600 bg-gray-100 border-gray-200' },
  ADMIN_REVIEW:            { text: 'Admin đang xem xét',    color: 'text-purple-700 bg-purple-50 border-purple-200' },
  INSPECTOR_REVIEW:        { text: 'Inspector đang xem xét', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  RESOLVED_REFUND_BUYER:   { text: 'Đã hoàn tiền người mua', color: 'text-red-700 bg-red-50 border-red-200' },
  RESOLVED_RELEASE_SELLER: { text: 'Đã giải phóng escrow',  color: 'text-green-700 bg-green-50 border-green-200' },
  RESOLVED_PARTIAL:        { text: 'Giải quyết một phần',   color: 'text-gray-700 bg-gray-100 border-gray-200' },
}

function SellerDisputePanel({ dispute, onAction }) {
  const [loading, setLoading] = useState(false)
  const cfg = DISPUTE_STATUS_LABELS[dispute.status] || { text: dispute.status, color: 'text-gray-600 bg-gray-100 border-gray-200' }

  const handleRespond = async (action) => {
    const label = action === 'approve' ? 'đồng ý hoàn tiền' : 'phản đối và chuyển Admin'
    if (!window.confirm(`Xác nhận: ${label}?`)) return
    setLoading(true)
    try {
      if (action === 'approve') {
        await disputeService.sellerApprove(dispute.id)
        toast.success('Đã đồng ý hoàn tiền. Admin sẽ xử lý giải phóng escrow.')
      } else {
        await disputeService.sellerReject(dispute.id)
        toast.info('Đã phản đối. Tranh chấp được chuyển lên Admin xem xét.')
      }
      onAction()
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border border-error/30 rounded-sm bg-error/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-sm font-bold text-error">
          <span className="material-symbols-outlined text-[1rem]">gavel</span>
          Yêu cầu tranh chấp từ người mua
        </span>
        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', cfg.color)}>
          {cfg.text}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-content-secondary font-medium uppercase tracking-wide mb-0.5">Lý do</p>
          <p className="text-sm text-content-primary bg-white border border-border-light rounded-sm px-3 py-2">{dispute.reason}</p>
        </div>
        {dispute.evidenceUrls && (
          <div>
            <p className="text-xs text-content-secondary font-medium uppercase tracking-wide mb-0.5">Bằng chứng</p>
            <a href={dispute.evidenceUrls} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-navy underline hover:text-orange">
              <span className="material-symbols-outlined text-[0.9rem]">open_in_new</span>
              Xem bằng chứng
            </a>
          </div>
        )}
      </div>

      {dispute.status === 'OPENED' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond('approve')}
            disabled={loading}
            className="flex-1 py-2 text-xs font-bold text-white bg-error hover:bg-error/90 rounded-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : '✓ Đồng ý hoàn tiền'}
          </button>
          <button
            onClick={() => handleRespond('reject')}
            disabled={loading}
            className="flex-1 py-2 text-xs font-bold border border-navy text-navy hover:bg-navy/5 rounded-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : '✕ Phản đối, chuyển Admin'}
          </button>
        </div>
      )}

      {dispute.status !== 'OPENED' && dispute.resolutionNote && (
        <div className="mt-2 text-xs text-content-secondary bg-white border border-border-light rounded-sm px-3 py-2">
          <span className="font-semibold">Ghi chú xử lý:</span> {dispute.resolutionNote}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, dispute, onAction, openDeliveryModal, openDisputeModal, openReviewModal, openOrderDetailModal }) {
  const isBuyer = order.role === 'BUYER';
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleAction = async (actionFn, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(true);
    try {
      await actionFn();
      onAction();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start border-b border-border-light pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-content-secondary bg-surface-secondary px-2 py-0.5 rounded-sm uppercase tracking-tighter border border-border-light">
              {isBuyer ? 'ĐƠN MUA' : 'ĐƠN BÁN'}
            </span>
            <span className="text-xs text-content-tertiary">|</span>
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wide">Mã Đơn: {order.orderId}</span>
            <span className="text-xs text-content-tertiary">·</span>
            <span className="text-xs text-content-secondary">{order.createdAt}</span>
          </div>
          <p className="text-sm font-semibold text-content-primary">
            {isBuyer ? 'Người bán:' : 'Người mua:'}{' '}
            <span className="text-navy">{isBuyer ? order.sellerName : order.buyerName}</span>
          </p>
        </div>
        <div className={cn('px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide', STATUS_LABELS[order.orderStatus]?.color || '')}>
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

      {order.orderStatus === 'DELIVERED' && order.autoReleaseAt && (
        <div className="mt-3 p-3 bg-orange/10 border border-orange/20 rounded-sm text-xs text-orange">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">schedule</span>
          Điểm escrow sẽ tự động giải phóng cho người bán vào{' '}
          <strong>{new Date(order.autoReleaseAt).toLocaleDateString('vi-VN')}</strong> nếu không có tranh chấp
        </div>
      )}

      {order.adminNote && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-sm">
          <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1rem]">admin_panel_settings</span>
            Thông báo từ Admin
          </p>
          <p className="text-xs text-blue-800">{order.adminNote}</p>
        </div>
      )}

      <div className="mt-5 flex justify-end flex-wrap gap-3 pt-4 border-t border-border-light">

        {/* COD - Buyer đang chờ seller xác nhận */}
        {order.orderStatus === 'PENDING_SELLER_CONFIRMATION' && isBuyer && (
          <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-center gap-2 text-sm text-amber-800">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <span>Đang chờ seller xác nhận đơn COD... Seller có <strong>1 phút</strong> để phản hồi.</span>
          </div>
        )}

        {/* COD - Seller nhận request, cần xác nhận hoặc từ chối */}
        {order.orderStatus === 'PENDING_SELLER_CONFIRMATION' && !isBuyer && (
          <div className="w-full space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
              <p className="font-bold mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">notifications_active</span>
                Có đơn hàng COD mới cần xác nhận!
              </p>
              <p className="text-xs">Người mua: <strong>{order.buyerName}</strong> — Giao đến: <strong>{order.address || 'TP. Hồ Chí Minh'}</strong></p>
              <p className="text-xs mt-1 text-amber-600">Bạn cần phản hồi trong vòng <strong>1 phút</strong>, nếu không đơn sẽ tự động bị hủy.</p>
            </div>

            {showRejectInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Lý do từ chối (bắt buộc)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:border-error outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2 text-xs font-bold border border-border-light text-content-secondary hover:bg-surface-secondary rounded-sm"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={actionLoading || !rejectReason.trim()}
                    onClick={() => handleAction(
                      () => ordersService.sellerRejectOrder(order.paymentId, rejectReason),
                      'Từ chối đơn hàng này'
                    )}
                    className="flex-1 py-2 text-xs font-bold bg-error text-white hover:bg-error/90 rounded-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 py-2.5 text-xs font-bold border border-error text-error hover:bg-error/5 rounded-sm transition-colors disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(
                    () => ordersService.sellerConfirmOrder(order.paymentId),
                    'Xác nhận nhận đơn hàng COD này'
                  )}
                  className="flex-1 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
                </button>
              </div>
            )}
          </div>
        )}

        {order.orderStatus === 'PENDING_PAYMENT' && isBuyer && order.paymentUrl && (
          <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer"
            className="py-2.5 px-6 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors">
            Thanh toán ngay
          </a>
        )}

        {order.orderStatus === 'PAID_WAITING_DELIVERY' && !isBuyer && (
          <button
            disabled={actionLoading}
            onClick={() => openDeliveryModal(order)}
            className="py-2.5 px-6 bg-navy text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[1rem]">local_shipping</span>
            Xác nhận đã giao hàng
          </button>
        )}

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

        {order.orderStatus === 'IN_DELIVERY' && isBuyer && (
          <button
            disabled={actionLoading}
            onClick={() => handleAction(
              () => ordersService.confirmReceived(order.paymentId),
              'Xác nhận đã nhận được hàng'
            )}
            className="py-2.5 px-6 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[1rem]">inventory_2</span>
            {actionLoading ? 'Đang xử lý...' : 'Tôi đã nhận được hàng'}
          </button>
        )}

        {order.orderStatus === 'IN_DELIVERY' && !isBuyer && (
          <div className="py-2 px-4 text-xs font-medium text-blue-600 bg-blue-50 rounded-sm border border-blue-100 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Đang vận chuyển đến khách hàng...
          </div>
        )}

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
            {order.hasRated ? (
              <span className="py-2 px-4 text-xs font-medium text-green bg-green/10 rounded-sm border border-green/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">verified</span>
                Đã đánh giá
              </span>
            ) : (
              <button
                disabled={actionLoading}
                onClick={() => openReviewModal(order)}
                className="py-2.5 px-6 bg-green hover:bg-green/90 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[1rem]">verified</span>
                Hoàn thành & Đánh giá
              </button>
            )}
          </>
        )}

        {order.orderStatus === 'DELIVERED' && !isBuyer && (
          <span className="py-2 px-4 text-xs font-medium text-green bg-green/10 rounded-sm border border-green/20">
            Khách đã nhận hàng. Đang chờ đánh giá...
          </span>
        )}

        {order.orderStatus === 'RETURN_REQUESTED' && !isBuyer && (
          <span className="py-2 px-4 text-xs font-medium text-error bg-error/10 rounded-sm border border-error/20">
            Người mua đang yêu cầu hoàn trả — chờ Admin xử lý
          </span>
        )}
        {order.orderStatus === 'RETURN_REQUESTED' && isBuyer && (
          <span className="py-2.5 text-xs text-content-secondary">Đang chờ Admin xử lý...</span>
        )}

        {order.orderStatus === 'DISPUTE_SYSTEM' && isBuyer && (
          <span className="py-2.5 text-xs text-content-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.9rem]">hourglass_empty</span>
            Tranh chấp đang được xử lý
          </span>
        )}

        <button
          onClick={() => openOrderDetailModal(order)}
          className="py-2.5 px-4 bg-navy hover:bg-navy/90 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[1rem]">description</span>
          Xem Chi Tiết Đơn Hàng
        </button>
      </div>

      {order.orderStatus === 'DISPUTE_SYSTEM' && !isBuyer && dispute && (
        <SellerDisputePanel dispute={dispute} onAction={onAction} />
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('BUYER');
  const [orders, setOrders] = useState([]);
  const [sellerDisputeMap, setSellerDisputeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [orderDetailOrder, setOrderDetailOrder] = useState(null);

  const mapPayment = useCallback((payment, role) => ({
    paymentId: payment.id,
    orderId: payment.orderId,
    bikePostId: payment.bikePostId,
    bikeTitle: payment.bikeTitle || 'Xe đạp',
    amount: payment.amount,
    orderStatus: payment.orderStatus || (payment.status === 'SUCCESS' ? 'PAID_WAITING_DELIVERY' : 'PENDING_PAYMENT'),
    role,
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
    adminNote: payment.adminNote || null,
    hasRated: payment.hasRated || false,
    address: payment.address || null,
    phone: payment.phone || null,
  }), []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [buyerRes, sellerRes, disputeRes] = await Promise.allSettled([
        ordersService.getPaymentHistory(0, 50),
        ordersService.getPaymentHistoryAsSeller(0, 50),
        disputeService.getMyDisputesAsSeller(0, 100),
      ]);

      const buyerOrders = buyerRes.status === 'fulfilled'
        ? (buyerRes.value.content || []).filter(p => p.type === 'ORDER_PAYMENT' || p.type === 'DIRECT_PAYMENT').map(p => mapPayment(p, 'BUYER'))
        : [];
      const sellerOrders = sellerRes.status === 'fulfilled'
        ? (sellerRes.value.content || []).map(p => mapPayment(p, 'SELLER'))
        : [];

      console.log('🔍 Sample order data:', buyerOrders[0] || sellerOrders[0]);

      // Build paymentId → dispute map for quick lookup
      const disputeMap = {};
      if (disputeRes.status === 'fulfilled') {
        (disputeRes.value.content || []).forEach(d => { disputeMap[d.paymentId] = d; });
      }

      setOrders([...buyerOrders, ...sellerOrders]);
      setSellerDisputeMap(disputeMap);
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

  useOrderUpdates(useCallback((data) => {
    toast.info(`Đơn hàng ${data.paymentId} đã cập nhật trạng thái`)
    fetchOrders()
  }, [fetchOrders]))

  useDisputeUpdates(useCallback((data) => {
    toast.info(`Tranh chấp ${data.disputeId} đã cập nhật`)
    fetchOrders()
  }, [fetchOrders]))

  const filteredOrders = useMemo(
    () => orders.filter(o => o.role === activeTab),
    [orders, activeTab]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-navy">shopping_cart_checkout</span>
          Giao dịch của tôi
        </h1>
        <p className="text-sm text-content-secondary">Quản lý giao dịch mua và bán an toàn qua hệ thống escrow điểm</p>
      </div>

      <div className="flex gap-8 border-b border-border-light mb-6">
        <button
          onClick={() => setActiveTab('BUYER')}
          className={cn('pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors',
            activeTab === 'BUYER' ? 'border-orange text-orange' : 'border-transparent text-content-secondary hover:text-content-primary')}
        >
          Đơn mua ({orders.filter(o => o.role === 'BUYER').length})
        </button>
        <button
          onClick={() => setActiveTab('SELLER')}
          className={cn('pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors',
            activeTab === 'SELLER' ? 'border-orange text-orange' : 'border-transparent text-content-secondary hover:text-content-primary')}
        >
          Đơn bán ({orders.filter(o => o.role === 'SELLER').length})
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 text-error text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.2rem]">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 flex flex-col items-center gap-3 bg-white rounded-sm border border-border-light">
          <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
          <p className="text-content-secondary text-sm font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-sm border border-border-light border-dashed">
          <span className="material-symbols-outlined text-[4rem] text-content-tertiary mb-3 opacity-30">inventory_2</span>
          <h3 className="text-base font-semibold text-content-primary mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-sm text-content-secondary">
            {activeTab === 'BUYER' ? 'Bạn chưa mua chiếc xe nào trên hệ thống.' : 'Bạn chưa bán được chiếc xe nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.paymentId}
              order={order}
              dispute={order.role === 'SELLER' ? sellerDisputeMap[order.paymentId] : undefined}
              onAction={fetchOrders}
              openDeliveryModal={setDeliveryOrder}
              openDisputeModal={setDisputeOrder}
              openReviewModal={setReviewOrder}
              openOrderDetailModal={setOrderDetailOrder}
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
          onSuccess={() => { setReviewOrder(null); fetchOrders(); }}
        />
      )}
      {orderDetailOrder && (
        <OrderDetailModal
          order={orderDetailOrder}
          onClose={() => setOrderDetailOrder(null)}
        />
      )}
    </div>
  );
}
