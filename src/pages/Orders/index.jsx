import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_ORDERS } from '@/constants/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import ReviewModal from '@/components/orders/ReviewModal';
import DisputeDepositModal from '@/components/orders/DisputeDepositModal';

const STATUS_LABELS = {
  PENDING_PAYMENT: { text: 'Chờ thanh toán', color: 'bg-navy/10 text-navy' },
  PAID_WAITING_DELIVERY: { text: 'Chờ giao hàng', color: 'bg-orange/10 text-orange' },
  IN_DELIVERY: { text: 'Đang giao hàng', color: 'bg-blue-500/10 text-blue-600' },
  DELIVERED: { text: 'Đã nhận hàng', color: 'bg-green/10 text-green' },
  RETURN_REQUESTED: { text: 'Yêu cầu hoàn hàng', color: 'bg-error/10 text-error' },
  AWAITING_DISPUTE_DEPOSIT: { text: 'Chờ nộp cọc', color: 'bg-error/10 text-error' },
  DISPUTE_SYSTEM: { text: 'Đang tranh chấp', color: 'bg-error/10 text-error' },
  COMPLETED: { text: 'Hoàn tất', color: 'bg-green/10 text-green' },
  CANCELLED: { text: 'Đã hủy', color: 'bg-content-tertiary/20 text-content-secondary' },
};

function OrderCard({ order, openReturnModal, openReviewModal, openDisputeModal, simulateStatusUpdate }) {
  const isBuyer = order.role === 'BUYER';
  
  return (
    <div className="bg-white rounded-sm border border-border-light shadow-card p-5">
       <div className="flex justify-between items-start border-b border-border-light pb-3 mb-4">
         <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold text-content-secondary uppercase tracking-wide">Mã Đơn: {order.id}</span>
             <span className="text-xs text-content-tertiary">·</span>
             <span className="text-xs text-content-secondary">{order.createdAt}</span>
           </div>
           <p className="text-sm font-semibold text-content-primary">
             {isBuyer ? 'Người bán:' : 'Người mua:'} <span className="text-navy">{order.counterpartName}</span>
           </p>
         </div>
         <div className={cn("px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide", STATUS_LABELS[order.status]?.color || '')}>
           {STATUS_LABELS[order.status]?.text || order.status}
         </div>
       </div>

       <div className="flex gap-4">
         <div className="w-20 h-20 bg-surface-secondary rounded-sm border border-border-light flex items-center justify-center flex-shrink-0">
           <span className="material-symbols-outlined text-content-tertiary text-[2rem]">directions_bike</span>
         </div>
         <div className="flex-1 min-w-0">
           <h3 className="text-base font-bold text-content-primary mb-1 line-clamp-1">{order.bikeTitle}</h3>
           <p className="text-lg font-black text-orange mb-2">{formatPrice(order.price)}</p>
           {order.deliveryAddress && order.deliveryAddress !== 'None' && order.deliveryAddress !== '' && (
              <p className="text-xs text-content-secondary line-clamp-1">
                <span className="font-semibold text-content-primary">Giao đến:</span> {order.deliveryAddress}
              </p>
           )}
         </div>
       </div>

       {/* Các nút hành động dựa trên trạng thái và vai trò */}
       <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-border-light">
          {order.status === 'PENDING_PAYMENT' && isBuyer && (
             <>
               <button onClick={() => simulateStatusUpdate(order.id, 'CANCELLED')} className="py-2.5 px-4 text-xs font-bold text-content-secondary hover:bg-surface-secondary rounded-sm transition-colors">Hủy Đơn</button>
               <button onClick={() => simulateStatusUpdate(order.id, 'PAID_WAITING_DELIVERY')} className="py-2.5 px-6 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors">Thanh toán ngay</button>
             </>
          )}

          {order.status === 'PAID_WAITING_DELIVERY' && !isBuyer && (
             <button onClick={() => simulateStatusUpdate(order.id, 'IN_DELIVERY')} className="py-2.5 px-6 bg-navy text-white text-xs font-bold rounded-sm transition-colors">Cập nhật Đã Giao Hàng</button>
          )}

          {order.status === 'IN_DELIVERY' && isBuyer && (
             <button onClick={() => simulateStatusUpdate(order.id, 'DELIVERED')} className="py-2.5 px-6 bg-green text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                Đã Nhận Được Hàng
             </button>
          )}

          {order.status === 'DELIVERED' && isBuyer && ( // Thời hạn 7 ngày hoàn trả
             <>
               <button onClick={() => openReturnModal(order)} className="py-2.5 px-4 text-xs font-bold border border-error text-error hover:bg-error/5 rounded-sm transition-colors">Yêu cầu hoàn trả</button>
               <button onClick={() => simulateStatusUpdate(order.id, 'COMPLETED')} className="py-2.5 px-6 bg-navy text-white text-xs font-bold rounded-sm transition-colors">Hoàn thành & Chọn Đánh Giá</button>
             </>
          )}

          {order.status === 'RETURN_REQUESTED' && !isBuyer && (
             <>
               <button onClick={() => simulateStatusUpdate(order.id, 'AWAITING_DISPUTE_DEPOSIT')} className="py-2.5 px-4 text-xs font-bold text-content-secondary hover:bg-surface-secondary rounded-sm transition-colors cursor-pointer">Từ chối (Mở Tranh Chấp)</button>
               <button onClick={() => simulateStatusUpdate(order.id, 'CANCELLED')} className="py-2.5 px-6 bg-error hover:bg-red-600 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer">Chấp nhận Thu Hồi</button>
             </>
          )}

          {order.status === 'RETURN_REQUESTED' && isBuyer && (
             <span className="py-2.5 text-xs text-content-secondary">Đang chờ người bán phản hồi...</span>
          )}

          {order.status === 'AWAITING_DISPUTE_DEPOSIT' && (
             <button onClick={() => openDisputeModal(order)} className="py-2.5 px-6 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-xs font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined text-[1rem]">gavel</span>
                Nộp 200K Giải Quyết Tranh Chấp
             </button>
          )}

          {order.status === 'COMPLETED' && isBuyer && (
             <button onClick={() => openReviewModal(order)} className="py-2.5 px-6 border border-[#ff6b35] text-[#ff6b35] hover:bg-orange/5 text-xs font-bold rounded-sm transition-colors">Đánh Giá Người Bán</button>
          )}
          
          <Link to={`/bike/${order.bikeId}`}>
             <button className="py-2.5 px-4 border border-border-light text-content-secondary hover:bg-surface-secondary text-xs font-bold rounded-sm transition-colors">Xem Chi Tiết Xe</button>
          </Link>
       </div>
    </div>
  )
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('BUYER'); // BUYER | SELLER
  
  // Dùng state để mock luồng đổi trạng thái sống
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // States cho Modals
  const [returnOrder, setReturnOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => o.role === activeTab).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeTab]);

  const simulateStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    // Nếu chuyển sang COMPLETED, hỏi user có muốn Review không
    if (newStatus === 'COMPLETED') {
       const userChoice = window.confirm("Đơn hàng đã hoàn tất! Bạn có muốn đánh giá người bán ngay không?");
       if (userChoice) {
          const theOrder = orders.find(x => x.id === orderId);
          setReviewOrder({...theOrder, status: 'COMPLETED'});
       }
    }
  }

  const handleReturnSuccess = (orderId) => {
    setReturnOrder(null);
    simulateStatusUpdate(orderId, 'RETURN_REQUESTED');
  };

  const handleReviewSuccess = (orderId) => {
    setReviewOrder(null);
    alert("Đánh giá của bạn đã được gửi thành công!");
  };

  const handleDisputeSuccess = (orderId) => {
    setDisputeOrder(null);
    simulateStatusUpdate(orderId, 'DISPUTE_SYSTEM');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary mb-1">Đơn hàng của tôi</h1>
        <p className="text-sm text-content-secondary">Quản lý giao dịch mua và bán an toàn qua PayOS Escrow</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border-light mb-6">
         <button 
           onClick={() => setActiveTab('BUYER')} 
           className={cn("pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'BUYER' ? "border-orange text-orange" : "border-transparent text-content-secondary hover:text-content-primary")}
         >
           Đơn mua của tôi
         </button>
         <button 
           onClick={() => setActiveTab('SELLER')} 
           className={cn("pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'SELLER' ? "border-orange text-orange" : "border-transparent text-content-secondary hover:text-content-primary")}
         >
           Đơn bán của tôi
         </button>
      </div>

      {/* Order List */}
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
               key={order.id} 
               order={order} 
               openReturnModal={setReturnOrder}
               openReviewModal={setReviewOrder}
               openDisputeModal={setDisputeOrder}
               simulateStatusUpdate={simulateStatusUpdate}
             />
           ))}
         </div>
      )}

      {/* Modals */}
      {returnOrder && (
        <ReturnRequestModal order={returnOrder} onClose={() => setReturnOrder(null)} onSuccess={handleReturnSuccess} />
      )}
      {reviewOrder && (
        <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSuccess={handleReviewSuccess} />
      )}
      {disputeOrder && (
        <DisputeDepositModal order={disputeOrder} onClose={() => setDisputeOrder(null)} onSuccess={handleDisputeSuccess} />
      )}
    </div>
  );
}
