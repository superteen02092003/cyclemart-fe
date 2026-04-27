import React, { useState } from 'react';
import { disputeService } from '@/services/orders';

export default function DisputeModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !agree) return;
    setIsSubmitting(true);
    setError('');
    try {
      await disputeService.openDispute(order.paymentId, reason.trim(), evidenceUrls.trim());
      onSuccess(order.paymentId);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm shadow-card-hover w-full max-w-lg overflow-hidden">
        <div className="bg-[#1a237e] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            <h3 className="font-bold">Mở yêu cầu tranh chấp</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[1.2rem]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-orange/10 border border-orange/20 p-3 rounded-sm text-sm text-content-primary">
            <p className="font-bold text-orange mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[1.1rem]">warning</span>
              Lưu ý quan trọng
            </p>
            <p className="leading-relaxed text-xs">
              Tranh chấp chỉ áp dụng cho xe <strong>đã được kiểm định</strong> và trong vòng <strong>7 ngày</strong> kể từ khi bạn xác nhận nhận hàng.
              Hệ thống sẽ giữ điểm escrow cho đến khi Admin ra quyết định.
            </p>
          </div>

          <div className="bg-surface-secondary p-3 rounded-sm text-sm border border-border-light">
            <p className="font-semibold text-content-primary mb-0.5">Mã đơn: {order.orderId}</p>
            <p className="text-content-secondary line-clamp-1">{order.bikeTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-1.5">
              Lý do tranh chấp <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải (xe khác mô tả, hỏng hóc, sai thông số...)"
              className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-1.5">
              Link bằng chứng (tùy chọn)
            </label>
            <input
              type="text"
              value={evidenceUrls}
              onChange={(e) => setEvidenceUrls(e.target.value)}
              placeholder="Link ảnh/video bằng chứng (Google Drive, Imgur...)"
              className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-xs text-content-secondary leading-relaxed">
              Tôi cam kết thông tin trên là sự thật và hiểu rằng mở tranh chấp vô lý có thể ảnh hưởng đến tài khoản.
            </span>
          </label>

          {error && (
            <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold border border-border-light text-content-secondary hover:bg-surface-secondary rounded-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!agree || !reason.trim() || isSubmitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#ff6b35' }}
            >
              {isSubmitting ? 'Đang gửi...' : 'Mở tranh chấp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
