import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';
import api from '@/services/api'; 
import { postService } from '@/services/post';
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import ReviewModal from '@/components/orders/ReviewModal';
import DisputeDepositModal from '@/components/orders/DisputeDepositModal';

const STATUS_LABELS = {
  PENDING_PAYMENT: { text: 'Chờ thanh toán', color: 'bg-navy/10 text-navy border border-navy/20' },
  PAID_WAITING_DELIVERY: { text: 'Chờ giao hàng', color: 'bg-orange/10 text-orange border border-orange/20' },
  IN_DELIVERY: { text: 'Đang vận chuyển', color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  DELIVERED: { text: 'Đã nhận hàng', color: 'bg-green/10 text-green border border-green/20' },
  COMPLETED: { text: 'Hoàn tất', color: 'bg-gray-100 text-gray-600 border border-gray-200' },
  RETURN_REQUESTED: { text: 'Yêu cầu hoàn trả', color: 'bg-error/10 text-error border border-error/20' },
  DISPUTE_SYSTEM: { text: 'Đang tranh chấp', color: 'bg-error/10 text-error' },
  CANCELLED: { text: 'Đã hủy', color: 'bg-content-tertiary/20 text-content-secondary' },
};

<<<<<<< HEAD
// ─── CÔNG CỤ CHUẨN HÓA VÀ ĐỒNG BỘ ──────────────────────────────
const getCleanSyncKey = (title) => {
  if (!title) return '';
  let cleaned = title.toLowerCase()
    .replace(/thanh toan( mua xe| don hang)?[:\-\s]*/ig, '')
    .replace(/thanh toán( mua xe| đơn hàng)?[:\-\s]*/ig, '');
  return cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '').trim();
};

const getOrderSyncKey = (bikeTitle) => {
  return `ORDER_STATUS_SYNC_FALLBACK_${getCleanSyncKey(bikeTitle)}`;
};

const resolveOrderStatus = (serverStatus, localStatus, defaultStatus) =>
  serverStatus || localStatus || defaultStatus;
// ─────────────────────────────────────────────────────────────

function OrderCard({ order, openReturnModal, openReviewModal, openDisputeModal, onUpdateStatus }) {
  const isBuyer = order.role === 'BUYER';
=======
function OrderCard({ order, openReturnModal, openReviewModal, openDisputeModal, simulateStatusUpdate }) {
  const isBuyer = order.orderType === 'PURCHASE';
>>>>>>> b225123722a3ae6d145942ed24c95940ed37e433
  
  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5 relative overflow-hidden transition-all hover:shadow-md">
       {!isBuyer && order.status === 'PAID_WAITING_DELIVERY' && (
         <div className="absolute top-3 right-[-30px] bg-red-500 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 shadow-sm uppercase">
           Đơn mới
         </div>
       )}

       <div className="flex justify-between items-start border-b border-border-light pb-4 mb-4">
         <div>
           <div className="flex items-center gap-2 mb-1.5">
             <span className="text-[10px] font-bold text-content-secondary bg-surface-secondary px-2 py-0.5 rounded-sm uppercase tracking-tighter border border-border-light">
               {isBuyer ? 'ĐƠN MUA' : 'ĐƠN BÁN'}
             </span>
             <span className="text-xs text-content-tertiary">|</span>
             <span className="text-xs text-content-secondary font-medium tracking-wide">Mã GD: {order.paymentOrderId || order.id}</span>
             <span className="text-xs text-content-tertiary">|</span>
             <span className="text-xs text-content-secondary">{order.createdAt}</span>
           </div>
           <p className="text-sm font-semibold text-content-primary">
             {isBuyer ? 'Người bán:' : 'Khách mua:'} <span className="text-navy">{order.counterpartName}</span>
           </p>
         </div>
         <div className={cn("px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide", STATUS_LABELS[order.status]?.color)}>
           {STATUS_LABELS[order.status]?.text || order.status}
         </div>
       </div>

       <div className="flex gap-4">
         <div className="w-20 h-20 bg-surface-secondary rounded-sm border border-border-light flex items-center justify-center flex-shrink-0">
           <span className="material-symbols-outlined text-content-tertiary text-[2.5rem]">local_shipping</span>
         </div>
         <div className="flex-1 min-w-0">
           <h3 className="text-base font-bold text-content-primary mb-1 line-clamp-1">{order.bikeTitle}</h3>
           <p className="text-lg font-black text-orange mb-2">{formatPrice(order.price)}</p>
           {order.deliveryAddress && (
              <p className="text-xs text-content-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[1.1rem]">location_on</span>
                {order.deliveryAddress}
              </p>
           )}
         </div>
       </div>

       <div className="mt-5 flex flex-wrap justify-end gap-3 pt-4 border-t border-border-light bg-gray-50/50 -mx-5 -mb-5 px-5 pb-5 rounded-b-sm">
          {/* NÚT CỦA NGƯỜI BÁN (SELLER) */}
          {!isBuyer && order.status === 'PAID_WAITING_DELIVERY' && (
             <button onClick={() => onUpdateStatus(order, 'IN_DELIVERY')} className="py-2 px-5 bg-navy hover:bg-navy/90 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[1rem]">local_shipping</span>
                Xác nhận đã bàn giao ĐVVC
             </button>
          )}

          {!isBuyer && order.status === 'IN_DELIVERY' && (
             <div className="py-2 px-4 text-xs font-medium text-blue-600 bg-blue-50 rounded-sm border border-blue-100 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Đang vận chuyển đến khách hàng...
             </div>
          )}

          {!isBuyer && order.status === 'DELIVERED' && (
             <span className="py-2 px-4 text-xs font-medium text-green bg-green/10 rounded-sm border border-green/20">
                Khách đã nhận hàng. Đang chờ đánh giá...
             </span>
          )}

          {!isBuyer && order.status === 'RETURN_REQUESTED' && (
             <span className="py-2 px-4 text-xs font-medium text-error bg-error/10 rounded-sm border border-error/20">
                Người mua đang yêu cầu trả hàng
             </span>
          )}

          {/* NÚT CỦA NGƯỜI MUA (BUYER) */}
          {isBuyer && order.status === 'PENDING_PAYMENT' && (
             <button className="py-2 px-5 bg-error hover:bg-red-600 text-white text-xs font-bold rounded-sm transition-colors shadow-sm">
                Thanh toán lại
             </button>
          )}

          {isBuyer && order.status === 'PAID_WAITING_DELIVERY' && (
             <div className="py-2 px-4 text-xs font-medium text-orange bg-orange/10 rounded-sm border border-orange/20 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
                Đang chờ người bán chuẩn bị hàng...
             </div>
          )}

          {isBuyer && order.status === 'IN_DELIVERY' && (
             <button onClick={() => onUpdateStatus(order, 'DELIVERED')} className="py-2 px-5 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm animate-pulse-slight">
                <span className="material-symbols-outlined text-[1rem]">inventory_2</span>
                Tôi đã nhận được hàng
             </button>
          )}

          {isBuyer && order.status === 'DELIVERED' && (
             <>
               <button onClick={() => openReturnModal(order)} className="py-2 px-4 text-xs font-bold border border-error text-error hover:bg-error/5 rounded-sm transition-colors">Yêu cầu trả hàng</button>
               <button onClick={() => onUpdateStatus(order, 'COMPLETED')} className="py-2 px-5 bg-green hover:bg-green/90 text-white text-xs font-bold rounded-sm transition-colors shadow-sm flex items-center gap-1">
                 <span className="material-symbols-outlined text-[1rem]">verified</span>
                 Xác nhận hoàn tất
               </button>
             </>
          )}

          {isBuyer && order.status === 'COMPLETED' && (
             <button onClick={() => openReviewModal(order)} className="py-2 px-5 border border-[#ff6b35] text-[#ff6b35] hover:bg-orange/5 text-xs font-bold rounded-sm transition-colors">Đánh giá người bán</button>
          )}
          
          <Link to={`/bike/${order.bikeId}`}>
             <button className="py-2 px-4 border border-border-light text-content-secondary hover:bg-surface-secondary text-xs font-bold rounded-sm transition-colors bg-white shadow-sm">Xem chi tiết</button>
          </Link>
       </div>
    </div>
  )
}

export default function OrdersPage() {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('BUYER');
=======
  const [activeTab, setActiveTab] = useState('USER'); // USER for both buying and selling
>>>>>>> b225123722a3ae6d145942ed24c95940ed37e433
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [returnOrder, setReturnOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. LẤY ĐƠN MUA
      let paymentData = [];
      try {
<<<<<<< HEAD
        const fallbackRes = await api.get('/v1/payments/history?page=0&size=100');
        paymentData = fallbackRes.data?.content || fallbackRes.data || [];
=======
        setLoading(true);
        const response = await ordersService.getPaymentHistory(0, 50);
        
        // Map payment data to order format
        const mappedOrders = response.content?.map(payment => ({
          id: payment.orderId,
          bikeId: payment.bikePostId,
          bikeTitle: payment.bikeTitle || 'Xe đạp',
          price: payment.amount,
          status: payment.status === 'SUCCESS' ? 'PAID_WAITING_DELIVERY' : 'PENDING_PAYMENT',
          counterpartName: payment.sellerName || 'Người bán',
          deliveryAddress: '',
          createdAt: new Date(payment.createdAt).toLocaleDateString('vi-VN'),
          orderType: 'PURCHASE' // This user is the buyer in this transaction
        })) || [];
        
        setOrders(mappedOrders);
        setError(null);
>>>>>>> b225123722a3ae6d145942ed24c95940ed37e433
      } catch (err) {
        console.error("Lỗi lấy đơn mua:", err);
      }

      const buyerOrders = paymentData
        .filter(payment => {
          const desc = (payment.description || '').toLowerCase();
          const isPriority = payment.type === 'PRIORITY_PACKAGE' || desc.includes('ưu tiên');
          const isInspection = payment.type === 'INSPECTION_FEE' || desc.includes('kiểm định') || desc.includes('kiem dinh');
          if (isPriority || isInspection) return false;
          if (payment.type && payment.type !== 'ORDER_PAYMENT') return false;
          return true;
        })
        .map(payment => {
          const titleParts = payment.description?.split(': ');
          const bikeTitle = titleParts?.length > 1 ? titleParts[1].trim() : (payment.description || 'Xe đạp CycleMart');
          
          const syncKey = getOrderSyncKey(bikeTitle);
          const savedStatus = localStorage.getItem(syncKey);

          return {
            id: payment.id, 
            paymentOrderId: payment.orderId, 
            bikeId: payment.referenceId || payment.bikePostId || payment.id,
            bikeTitle: bikeTitle,
            price: payment.amount,
            status: resolveOrderStatus(payment.orderStatus, savedStatus, payment.status === 'SUCCESS' ? 'PAID_WAITING_DELIVERY' : 'PENDING_PAYMENT'),
            counterpartName: payment.sellerName || 'Người bán (Hệ thống)',
            deliveryAddress: payment.address || 'Hồ Chí Minh',
            createdAt: new Date(payment.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
            sortAt: new Date(payment.createdAt).getTime() || 0,
            role: 'BUYER'
          };
        });

      // 2. LẤY ĐƠN BÁN
      let sellerOrders = [];
      try {
        const postsRes = await postService.getMyPosts();
        const postData = postsRes?.content || postsRes || [];
        
        sellerOrders = postData
          .filter(post => post.postStatus === 'SOLD')
          .map(post => {
            // 🔥 THUẬT TOÁN GHÉP ĐÔI THÔNG MINH: Đi tìm mã Hóa Đơn thật trong danh sách người mua
            const cleanPostTitle = getCleanSyncKey(post.title);
            const matchingBuyerOrder = buyerOrders.find(b => getCleanSyncKey(b.bikeTitle) === cleanPostTitle);
            
            // Nếu ghép đôi thành công, dùng mã ORDER_1777... Nếu không thì dùng ORD_SELL_x
            const realPaymentOrderId = matchingBuyerOrder ? matchingBuyerOrder.paymentOrderId : (post.paymentOrderId || `ORD_SELL_${post.id}`);

            const syncKey = getOrderSyncKey(post.title);
            const savedStatus = localStorage.getItem(syncKey);
            const serverOrderStatus = post.orderStatus || post.paymentOrderStatus || post.latestOrderStatus;

            return {
              id: post.id, 
              paymentOrderId: realPaymentOrderId, 
              bikeId: post.id,
              bikeTitle: post.title,
              price: post.price,
              status: resolveOrderStatus(serverOrderStatus, savedStatus, 'PAID_WAITING_DELIVERY'),
              counterpartName: post.buyerName || post.customerName || 'Khách hàng',
              deliveryAddress: post.deliveryAddress || 'Liên hệ khách để lấy địa chỉ',
              createdAt: new Date(post.updatedAt || post.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
              sortAt: new Date(post.updatedAt || post.createdAt).getTime() || 0,
              role: 'SELLER'
            };
          });
      } catch (err) {
        console.error("Lỗi lấy đơn bán:", err);
      }

      setOrders([...buyerOrders, ...sellerOrders]);
    } catch (err) {
      console.error('Lỗi tổng khi tải đơn hàng:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Tự động reload để thấy trạng thái mới nhất từ người kia
  useEffect(() => {
    const timer = setInterval(() => {
      fetchOrders();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = useMemo(() => {
<<<<<<< HEAD
    return orders
      .filter(o => o.role === activeTab)
      .sort((a, b) => (b.sortAt || 0) - (a.sortAt || 0));
=======
    return orders.filter(o => o.orderType === 'PURCHASE').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
>>>>>>> b225123722a3ae6d145942ed24c95940ed37e433
  }, [orders, activeTab]);

  const handleUpdateStatus = async (orderObj, newStatus) => {
    try {
      const syncKey = getOrderSyncKey(orderObj.bikeTitle);
      let syncedToBackend = false;

      // 🔥 CHỈ ĐẨY LÊN BACKEND KHI LÀ MÃ ORDER_xxx (Tránh lỗi 400 Bad Request)
      if (orderObj.paymentOrderId && !orderObj.paymentOrderId.startsWith('ORD_SELL_')) {
        try {
          await api.put(`/v1/payments/${orderObj.paymentOrderId}/order-status?status=${newStatus}`);
          syncedToBackend = true;
        } catch (apiError) {
          console.error('Lỗi khi gọi API Backend. Sử dụng Đồng bộ Local làm phương án dự phòng.', apiError);
        }
      }

      // Lưu LocalStorage theo TÊN XE (Mã dùng chung cho 2 tài khoản)
      localStorage.setItem(syncKey, newStatus);

      // Cập nhật giao diện ngay lập tức cho TẤT CẢ xe có cùng Tên
      setOrders(prev => prev.map(o => {
        if (getCleanSyncKey(o.bikeTitle) === getCleanSyncKey(orderObj.bikeTitle)) {
          return { ...o, status: newStatus };
        }
        return o;
      }));

      if (syncedToBackend) {
        await fetchOrders();
      }
      
      if (newStatus === 'COMPLETED') {
        setTimeout(() => {
          setReviewOrder({...orderObj, status: 'COMPLETED'});
        }, 300);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 bg-surface-primary min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-navy">shopping_cart_checkout</span>
          Giao dịch của tôi
        </h1>
        <p className="text-sm text-content-secondary font-medium">Theo dõi lịch sử mua xe và các đơn hàng bạn đã bán thành công.</p>
      </div>

      <div className="flex gap-10 border-b border-border-light mb-8">
         <button 
<<<<<<< HEAD
           onClick={() => setActiveTab('BUYER')} 
           className={cn("pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all", activeTab === 'BUYER' ? "border-[#ff6b35] text-[#ff6b35]" : "border-transparent text-content-tertiary hover:text-content-primary")}
         >
           Đơn mua ({orders.filter(o => o.role === 'BUYER').length})
         </button>
         <button 
           onClick={() => setActiveTab('SELLER')} 
           className={cn("pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all", activeTab === 'SELLER' ? "border-[#ff6b35] text-[#ff6b35]" : "border-transparent text-content-tertiary hover:text-content-primary")}
         >
           Đơn bán ({orders.filter(o => o.role === 'SELLER').length})
=======
           onClick={() => setActiveTab('USER')} 
           className={cn("pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'USER' ? "border-orange text-orange" : "border-transparent text-content-secondary hover:text-content-primary")}
         >
           Đơn hàng của tôi
>>>>>>> b225123722a3ae6d145942ed24c95940ed37e433
         </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 text-error text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.2rem]">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 flex flex-col items-center gap-3 bg-white rounded-sm border border-border-light">
           <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
           <p className="text-content-secondary text-sm font-medium">Đang tải dữ liệu đơn hàng...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
         <div className="text-center py-24 bg-white rounded-sm border border-border-light border-dashed">
           <span className="material-symbols-outlined text-[5rem] text-content-tertiary mb-4 opacity-30">inventory_2</span>
           <h3 className="text-lg font-bold text-content-primary mb-1">Hiện chưa có đơn hàng nào</h3>
           <p className="text-sm text-content-secondary">
             {activeTab === 'BUYER' ? 'Bạn chưa mua chiếc xe nào trên hệ thống.' : 'Bạn chưa bán được chiếc xe nào.'}
           </p>
         </div>
      ) : (
         <div className="space-y-6">
           {filteredOrders.map(order => (
             <OrderCard 
               key={`${order.role}_${order.id}`} 
               order={order} 
               openReturnModal={setReturnOrder}
               openReviewModal={setReviewOrder}
               openDisputeModal={setDisputeOrder}
               onUpdateStatus={handleUpdateStatus}
             />
           ))}
         </div>
      )}

      {reviewOrder && (
        <ReviewModal 
          order={reviewOrder} 
          onClose={() => setReviewOrder(null)} 
          onSuccess={() => { alert("Cảm ơn bạn đã đánh giá!"); setReviewOrder(null); }} 
        />
      )}
      
      {returnOrder && (
        <ReturnRequestModal 
          order={returnOrder} 
          onClose={() => setReturnOrder(null)} 
          onSuccess={() => handleUpdateStatus(returnOrder, 'RETURN_REQUESTED')} 
        />
      )}

      {disputeOrder && (
        <DisputeDepositModal 
          order={disputeOrder} 
          onClose={() => setDisputeOrder(null)} 
          onSuccess={() => handleUpdateStatus(disputeOrder, 'DISPUTE_SYSTEM')} 
        />
      )}
    </div>
  );
}