import React, { useState } from 'react';
import { formatPrice } from '@/utils/formatPrice';

export default function DisputeDepositModal({ order, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const depositAmount = 200000;

  const handleDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowQR(true);
    }, 1000);
  };

  const handleSimulatePaymentSuccess = () => {
    onSuccess(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white rounded-sm shadow-card-hover w-full max-w-lg overflow-hidden relative">
         {/* HEADER */}
         <div className="bg-[#1a237e] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>gavel</span>
               <h3 className="font-bold">Mở Yêu cầu Can thiệp Hệ thống</h3>
            </div>
            {!showQR && (
               <button onClick={onClose} className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                 <span className="material-symbols-outlined text-[1.2rem]">close</span>
               </button>
            )}
         </div>

         <div className="p-6">
            {!showQR ? (
               // --- Bước 1: Thông báo luật nộp cọc ---
               <div className="space-y-4">
                  <div className="bg-orange/10 border border-orange/20 p-4 rounded-sm text-sm text-content-primary">
                     <p className="font-bold text-orange mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[1.1rem]">warning</span>
                        Quy định Bắt buộc
                     </p>
                     <p className="mb-2 leading-relaxed">
                        Do 2 bên không thể tự thương lượng (Tại đơn hàng <span className="font-bold">{order.id}</span>), bạn đang yêu cầu CycleMart điều phối Nhân viên Kiểm định (Inspector) trực tiếp phân giải.
                     </p>
                     <p className="leading-relaxed">
                        Để tránh lạm dụng, <span className="font-bold text-error">cả 2 bên đều phải đóng cọc {formatPrice(depositAmount)} VNĐ</span> trong vòng 48 giờ. Ai không đóng coi như tự bỏ cuộc. Nếu bạn <strong>thắng</strong>, cọc sẽ được hoàn lại 100%. Nếu bạn <strong>thua</strong>, cọc sẽ được dùng để trả phí cho Inspector.
                     </p>
                  </div>
                  
                  <button 
                     onClick={handleDeposit}
                     disabled={isProcessing}
                     className="w-full py-3 bg-[#ff6b35] hover:bg-[#ff7849] text-white font-bold rounded-sm transition-all flex items-center justify-center gap-2 mt-4"
                  >
                     {isProcessing ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Đang khởi tạo cổng thanh toán...
                        </>
                     ) : (
                        `Đồng ý & Nộp cọc ${formatPrice(depositAmount)}`
                     )}
                  </button>
                  <button onClick={onClose} className="w-full py-3 text-content-secondary hover:bg-surface-secondary font-semibold border border-border-light rounded-sm transition-colors mt-2">
                     Hủy bỏ
                  </button>
               </div>
            ) : (
               // --- Bước 2: Hiển thị QR PayOS giả lập ---
               <div className="text-center animate-in fade-in zoom-in duration-300">
                  <h4 className="font-bold text-content-primary mb-1">Mã QR Thanh toán Cọc Escrow</h4>
                  <p className="text-xs text-content-secondary mb-4">Sử dụng App Ngân hàng bất kỳ để quét</p>

                  <div className="w-48 h-48 bg-surface-secondary border border-border-light mx-auto flex items-center justify-center rounded-sm">
                     <span className="material-symbols-outlined text-border text-[4rem]">qr_code_2</span>
                  </div>

                  <div className="bg-surface-secondary rounded-sm p-4 text-sm space-y-2 text-left mt-4 border border-border-light">
                     <div className="flex justify-between">
                        <span className="text-content-secondary">Số tiền:</span>
                        <span className="font-bold text-navy">{formatPrice(depositAmount)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-content-secondary">Nội dung CK:</span>
                        <span className="font-bold text-content-primary">CMART DEP {order.id}</span>
                     </div>
                  </div>

                  <p className="text-[11px] text-content-tertiary mt-4 mb-3 italic">Hệ thống đang tự động lắng nghe kết quả từ ngân hàng...</p>

                  <button 
                     onClick={handleSimulatePaymentSuccess}
                     className="w-full py-2.5 bg-green hover:bg-green/90 text-white font-bold rounded-sm transition-all"
                  >
                     [Giả lập] Thanh toán cọc thành công
                  </button>
               </div>
            )}
         </div>
       </div>
    </div>
  );
}
