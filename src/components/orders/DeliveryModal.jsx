import React, { useState } from 'react';
import { ordersService } from '@/services/orders';

export default function DeliveryModal({ order, onClose, onSuccess }) {
  const [deliveryMethod, setDeliveryMethod] = useState('HANDOFF');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceUrls.trim()) {
      setError('Vui lòng nhập link bằng chứng giao hàng');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await ordersService.submitDelivery(order.paymentId, deliveryMethod, evidenceUrls.trim(), note);
      onSuccess(order.paymentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm shadow-card-hover w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-base font-bold text-content-primary">Xác nhận đã giao hàng</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary">
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-surface-secondary p-3 rounded-sm text-sm border border-border-light">
            <p className="font-semibold text-content-primary mb-0.5">Mã đơn: {order.orderId}</p>
            <p className="text-content-secondary line-clamp-1">{order.bikeTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-1.5">
              Phương thức giao hàng <span className="text-error">*</span>
            </label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy bg-white"
            >
              <option value="HANDOFF">Trao tay trực tiếp</option>
              <option value="EXTERNAL_SHIPPING">Giao qua đơn vị vận chuyển</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-1.5">
              Link bằng chứng giao hàng <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={evidenceUrls}
              onChange={(e) => setEvidenceUrls(e.target.value)}
              placeholder="Link ảnh/video giao xe (Google Drive, Imgur...)"
              className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy"
            />
            <p className="text-xs text-content-tertiary mt-1">
              Upload ảnh/video lên Google Drive hoặc Imgur rồi paste link vào đây
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-primary mb-1.5">Ghi chú (tùy chọn)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thông tin thêm về quá trình giao hàng..."
              className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy resize-none"
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-navy hover:bg-navy/90 rounded-sm disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận đã giao'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
