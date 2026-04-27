import React, { useState, useEffect } from 'react';import { sellerRatingService } from '@/services/sellerRating';
import { bikePostService } from '@/services/bikePost';

export default function ReviewModal({ order, onClose, onSuccess, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resolvedSellerId, setResolvedSellerId] = useState(null);


  useEffect(() => {
    const fetchSellerId = async () => {
      try {
        console.log("order:", order); // debug 1 lần là biết ngay

        // 1. Ưu tiên lấy trực tiếp từ order
        if (order?.sellerId != null) {
          setResolvedSellerId(order.sellerId);
          return;
        }

        // 2. Fallback nhiều field (quan trọng)
        const postId =
          order?.bikePostId ||
          order?.postId ||
          order?.bikeId ||
          order?.productId;

        if (!postId) {
          throw new Error('Order không chứa postId (bikePostId/postId/...)');
        }

        // 3. Gọi API
        const res = await bikePostService.getById(postId);
        const bikePost = res?.result || res;

        console.log("bikePost:", bikePost);

        // 4. Lấy sellerId an toàn
        const sellerId =
          bikePost?.userId ||
          bikePost?.sellerId ||
          bikePost?.ownerId;

        if (!sellerId) {
          throw new Error('Không tìm thấy sellerId từ bài đăng');
        }

        setResolvedSellerId(sellerId);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchSellerId();
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resolvedPaymentId = order?.paymentId ?? order?.id;

    if (rating === 0 || isSubmitting || !resolvedSellerId || !resolvedPaymentId) return;

    setIsSubmitting(true);
    setError('');

    try {
      await sellerRatingService.createOrUpdateRating({
        sellerId: resolvedSellerId,
        paymentId: resolvedPaymentId,
        score: rating,
        comment: comment.trim()
      });

      onSuccess(order.id);
    } catch (submitError) {
      const message =
        submitError?.response?.data?.errors?.paymentId ||
        submitError?.response?.data?.message ||
        submitError?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white rounded-sm shadow-card-hover w-full max-w-md text-center overflow-hidden">
         <div className="bg-[#1e3a5f] text-white py-6 px-6">
           <h3 className="text-xl font-bold mb-1">Đánh giá người bán</h3>
           <p className="text-sm opacity-80">Trải nghiệm của bạn với <span className="font-bold">{order.counterpartName}</span> như thế nào?</p>
         </div>

         <form onSubmit={handleSubmit} className="px-6 py-6 text-left">
            <div className="flex justify-center gap-2 mb-6 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[2.5rem] transition-colors"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                    color: (hoverRating || rating) >= star ? '#f59e0b' : '#d1d5db'
                  }}
                >
                  star
                </span>
              ))}
            </div>

            <p className="text-center text-sm font-semibold text-content-primary mb-6">
              {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : rating === 1 ? 'Quá tệ' : 'Chọn số sao'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-content-primary mb-1.5">Nhận xét chi tiết</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ thêm về trải nghiệm giao dịch, chất lượng xe, thái độ của người bán..."
                className="w-full px-3 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-navy resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-error mb-4">{error}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-border-light text-content-secondary hover:bg-surface-secondary rounded-sm">Để sau</button>
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting || !resolvedSellerId || !(order?.paymentId ?? order?.id)}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#ff6b35' }}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
         </form>
       </div>
    </div>
  );
}
