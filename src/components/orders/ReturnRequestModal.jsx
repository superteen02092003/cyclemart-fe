import React, { useState } from 'react';

export default function ReturnRequestModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState('NOT_AS_DESCRIBED');
  const [description, setDescription] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) return;
    setIsSubmitting(true);
    
    // Giả lập call API
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(order.id);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white rounded-sm shadow-card-hover w-full max-w-lg">
         <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
           <h3 className="text-base font-bold text-content-primary">Yêu cầu hoàn trả hàng</h3>
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary">
             <span className="material-symbols-outlined text-[1.1rem]">close</span>
           </button>
         </div>

         <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="bg-surface-secondary p-3 rounded-sm text-sm mb-2 border border-border-light">
               <p className="font-semibold text-content-primary mb-1">Mã đơn: {order.id}</p>
               <p className="text-content-secondary line-clamp-1">{order.bikeTitle}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-primary mb-1.5">Lý do hoàn trả <span className="text-error">*</span></label>
              <select 
                value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-white"
              >
                <option value="NOT_AS_DESCRIBED">Khác với mô tả ban đầu</option>
                <option value="DEFECTIVE">Xe bị hỏng hóc nặng không thể sử dụng</option>
                <option value="WRONG_ITEM">Giao sai sản phẩm</option>
                <option value="OTHER">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-primary mb-1.5">Chi tiết tình trạng khuyết điểm <span className="text-error">*</span></label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả rõ vấn đề ở đâu, tình trạng ra sao để người bán và hệ thống kiểm duyệt dễ xác nhận..."
                className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy resize-none"
              />
            </div>

            <div>
               <label className="block text-sm font-semibold text-content-primary mb-1.5">Ảnh/Video chứng minh</label>
               <div className="border border-dashed border-border-light hover:border-navy cursor-pointer bg-surface-secondary rounded-sm p-4 text-center">
                  <span className="material-symbols-outlined text-content-tertiary mb-1">upload_file</span>
                  <p className="text-xs text-content-secondary">Click để tải lên hình ảnh/video khuyết điểm</p>
               </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5" 
                />
                <span className="text-xs text-content-secondary leading-relaxed">
                  Tôi cam kết các thông tin trên là sự thật. Tôi hiểu nếu mở tranh chấp vô lý có thể sẽ bị phạt theo chính sách của BikeConnect.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-border-light text-content-secondary hover:bg-surface-secondary rounded-sm">Hủy</button>
              <button 
                type="submit" 
                disabled={!agree || isSubmitting}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#ff6b35' }}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
         </form>
       </div>
    </div>
  );
}
