import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'offer', title: 'Có Offer mới', content: 'Minh Tuấn đã trả giá 27.000.000đ cho Giant Defy', time: '10 phút trước', read: false },
  { id: 2, type: 'payment', title: 'Thanh toán thành công', content: 'Đơn hàng mua Brompton M6L đã được giữ an toàn trên Escrow', time: '1 giờ trước', read: false },
  { id: 3, type: 'delivery', title: 'Cập nhật giao hàng', content: 'Người bán đã cập nhật trạng thái Đang giao hàng cho xe Trek Domane', time: '2 giờ trước', read: true },
  { id: 4, type: 'system', title: 'Tin đăng được duyệt', content: 'Tin bán xe Specialized của bạn đã hiển thị công khai', time: 'Hôm qua', read: true }
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-tertiary transition-colors relative"
      >
        <span className="material-symbols-outlined text-content-primary">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-sm shadow-card-hover border border-border-light z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex justify-between items-center bg-surface-secondary">
             <h3 className="text-sm font-bold text-content-primary">Thông báo</h3>
             <button className="text-xs text-orange font-semibold hover:underline">Đánh dấu đã đọc</button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
             {notifications.length === 0 ? (
                <div className="py-8 text-center text-content-secondary text-sm">Không có thông báo nào</div>
             ) : (
                notifications.map(noti => (
                   <div key={noti.id} className={cn("px-4 py-3 border-b border-border-light hover:bg-surface-secondary transition-colors cursor-pointer", !noti.read && "bg-orange/5")}>
                      <div className="flex gap-3">
                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                            noti.type === 'offer' ? 'bg-orange/20 text-orange' :
                            noti.type === 'payment' ? 'bg-green/20 text-green' :
                            noti.type === 'delivery' ? 'bg-navy/20 text-navy' : 'bg-surface-tertiary text-content-secondary'
                         )}>
                            <span className="material-symbols-outlined text-[1rem]">
                               {noti.type === 'offer' ? 'local_offer' : noti.type === 'payment' ? 'payments' : noti.type === 'delivery' ? 'local_shipping' : 'info'}
                            </span>
                         </div>
                         <div>
                            <p className={cn("text-sm", !noti.read ? "font-bold text-content-primary" : "font-semibold text-content-secondary")}>{noti.title}</p>
                            <p className="text-xs text-content-secondary mt-0.5 line-clamp-2">{noti.content}</p>
                            <p className="text-[10px] text-content-tertiary mt-1.5">{noti.time}</p>
                         </div>
                      </div>
                   </div>
                ))
             )}
          </div>
          <div className="border-t border-border-light p-2 text-center">
             <button className="text-xs font-semibold text-content-secondary hover:text-navy transition-colors">Xem tất cả</button>
          </div>
        </div>
      )}
    </div>
  );
}
