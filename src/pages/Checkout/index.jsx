import { useEffect } from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { bikePostService } from '@/services/bikePost';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const platformFee = 0;
  const shippingFee = 200000;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Auto-fill form từ user info
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.fullName || '',
        phone: user.phone || ''
      }))
    }
  }, [user])

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên người nhận');
      return;
    }
    if (!form.phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    if (!form.address.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentData = {
        bikePostId: parseInt(id),
        name: form.name,
        phone: form.phone,
        address: form.address,
        description: form.note || 'Không có ghi chú'
      };

      console.log('Payment data:', paymentData);
      
      const response = await api.post('/v1/payments/sepay/create', paymentData);
      
      if (response.data.success && response.data.qrUrl) {
        setPaymentResponse(response.data);
        setShowQRModal(true);
      } else {
        alert('Lỗi tạo thanh toán: ' + (response.data.message || 'Không xác định'));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Lỗi tạo thanh toán: ' + (error.response?.data?.message || error.message));
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchBike = async () => {
      try {
        setLoading(true);
        const data = await bikePostService.getById(id);
        setBike(data?.result || data?.data || data);
        setError(null);
      } catch (err) {
        console.error('Fetch bike error:', err);
        setBike(null);
        setError(err?.response?.data?.message || err.message || 'Không tải được thông tin xe');
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [id]);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error || !bike) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-surface-primary min-h-screen">
        <p className="text-sm text-error">{error || 'Không tìm thấy dữ liệu xe'}</p>
      </div>
    );
  }

  const total = bike.price + platformFee + shippingFee;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-surface-primary min-h-screen">
      <Link to={`/bike/${bike.id}`} className="inline-flex items-center gap-1 text-sm text-content-secondary hover:text-content-primary transition-colors mb-6">
        <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
        Quay lại
      </Link>
      
      <h1 className="text-2xl font-bold text-content-primary mb-6">Hoàn tất thanh toán an toàn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Cột trái (Form nhập thông tin) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-card border border-border-light">
            <h2 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.2rem] text-orange">local_shipping</span>
              Thông tin nhận hàng
            </h2>
            <form id="checkout-form" onSubmit={handleSubmitCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-content-primary mb-1.5">Tên người nhận <span className="text-error">*</span></label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-4 py-2 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm font-medium focus:ring-1 focus:ring-navy transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-content-primary mb-1.5">Số điện thoại <span className="text-error">*</span></label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="VD: 0912345678"
                    className="w-full px-4 py-2 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm font-medium focus:ring-1 focus:ring-navy transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-content-primary mb-1.5">Địa chỉ cụ thể <span className="text-error">*</span></label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full px-4 py-2 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm font-medium focus:ring-1 focus:ring-navy transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-content-primary mb-1.5">Ghi chú cho người bán</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({...form, note: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm font-medium focus:ring-1 focus:ring-navy transition-all resize-none"
                  placeholder="Thời gian nhận hàng thuận tiện, chỉ đường chi tiết..."
                />
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-card border border-border-light">
             <h2 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.2rem] text-orange">account_balance_wallet</span>
              Phương thức thanh toán
            </h2>
            <div className="border-2 border-orange/50 bg-orange/5 rounded-sm p-4 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange text-white text-[10px] font-bold px-2 py-1 rounded-bl-sm uppercase tracking-wider">Khuyên dùng</div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-4 border-orange bg-white flex items-center justify-center flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Thanh toán an toàn qua PayOS (Escrow)</p>
                  <p className="text-xs text-content-secondary mt-1">BikeConnect sẽ giữ 100% tiền của bạn cho đến khi bạn nhận được xe và xác nhận hài lòng (tối đa 10 ngày).</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-content-tertiary mt-3 italic flex items-center justify-center">
              <span className="material-symbols-outlined text-[1rem] mr-1">lock</span>
              Giao dịch được mã hóa và bảo vệ an toàn.
            </p>
          </div>
        </div>

        {/* Cột phải (Summary) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-sm shadow-card border border-border-light sticky top-24">
            <h2 className="text-lg font-bold text-content-primary mb-4">Chi tiết đơn hàng</h2>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-border-light">
               <div className="w-20 h-20 bg-surface-secondary rounded-sm flex items-center justify-center flex-shrink-0 border border-border-light">
                 <span className="material-symbols-outlined text-content-tertiary" style={{fontSize: '2rem'}}>directions_bike</span>
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-content-primary line-clamp-2 leading-snug">{bike.title}</h3>
                 <p className="text-xs text-content-secondary mt-1">Người bán: <span className="font-semibold">{bike.sellerName}</span></p>
               </div>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between items-center text-content-secondary">
                <span>Tạm tính</span>
                <span className="font-medium text-content-primary">{formatPrice(bike.price)}</span>
              </div>
              <div className="flex justify-between items-center text-content-secondary">
                <span>Phí giao dịch nền tảng</span>
                <span className="font-medium text-green">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center text-content-secondary">
                <span>Ước tính phí vận chuyển</span>
                 <span className="font-medium text-content-primary">{formatPrice(shippingFee)}</span>
              </div>
            </div>

            <div className="border-t border-border-light pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-content-primary">Tổng thanh toán</span>
                <span className="text-2xl font-black text-orange">{formatPrice(total)}</span>
              </div>
               <p className="text-right text-[11px] text-content-tertiary mt-1">Đã bao gồm VAT</p>
            </div>

            <button
              form="checkout-form"
              disabled={isProcessing}
              className="w-full py-4 bg-[#ff6b35] hover:bg-[#ff7849] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-sm transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
                  Xác nhận & Thanh toán
                </>
              )}
            </button>

            {/* Mock Payment Test Buttons (Local Testing) */}
            <div className="mt-4 pt-4 border-t border-border-light space-y-2">
              <p className="text-xs text-content-tertiary text-center mb-2">🧪 Test Mode (Local)</p>
              <button
                onClick={() => navigate(`/payment-success?orderId=ORDER_${Date.now()}`)}
                className="w-full py-2 bg-green/10 hover:bg-green/20 text-green font-semibold rounded-sm transition-all text-sm border border-green/30"
              >
                ✓ Test Thanh Toán Thành Công
              </button>
              <button
                onClick={() => navigate(`/payment-failure?reason=Lỗi kết nối&bikeId=${id}`)}
                className="w-full py-2 bg-error/10 hover:bg-error/20 text-error font-semibold rounded-sm transition-all text-sm border border-error/30"
              >
                ✗ Test Thanh Toán Thất Bại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sepay Form - Auto-submit to Sepay */}
      {paymentResponse && <SepayForm paymentData={paymentResponse} />}

      {/* QR Code Modal */}
      {showQRModal && paymentResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-center">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-content-primary mb-2">Quét mã QR để thanh toán</h2>
              <p className="text-sm text-content-secondary">Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới</p>
            </div>

            {/* QR Code */}
            <div className="bg-surface-secondary rounded-lg p-4 mb-6 border-2 border-border-light">
              <img 
                src={paymentResponse.qrUrl} 
                alt="QR Code" 
                className="w-full h-auto rounded"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EQR Code Error%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>

            {/* Order Info */}
            <div className="bg-blue/5 border border-blue/20 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-content-secondary">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-content-primary">{paymentResponse.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Số tiền:</span>
                  <span className="font-bold text-orange">{formatPrice(paymentResponse.amount)}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-orange/5 border border-orange/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-content-primary mb-2">📱 Hướng dẫn:</p>
              <ol className="text-xs text-content-secondary space-y-1 list-decimal list-inside">
                <li>Mở ứng dụng ngân hàng của bạn</li>
                <li>Chọn "Chuyển khoản" hoặc "Quét QR"</li>
                <li>Quét mã QR trên màn hình</li>
                <li>Xác nhận và hoàn tất thanh toán</li>
              </ol>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/payment-success?orderId=${paymentResponse.orderId}`)}
                className="w-full py-3 bg-green hover:bg-green/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[1.1rem]">done_all</span>
                ✓ Giả lập thanh toán thành công
              </button>

              <button
                onClick={() => {
                  setShowQRModal(false);
                  setPaymentResponse(null);
                  setIsProcessing(false);
                }}
                className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
              >
                Đóng
              </button>
              <p className="text-xs text-content-tertiary text-center">
                Hệ thống sẽ tự động cập nhật khi thanh toán thành công
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mock PayOS Dialog */}
      {showPayOSContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
             <div className="bg-[#1a237e] p-4 text-white text-center rounded-t-xl sm:rounded-none">
                <h3 className="font-bold text-lg">Cổng thanh toán PayOS (Mô phỏng)</h3>
                <p className="text-sm opacity-80 mt-1">Quét mã QR bằng App Ngân Hàng</p>
             </div>
             
             <div className="p-6 text-center space-y-4">
               <div className="w-48 h-48 bg-surface-secondary border-2 border-dashed border-border mx-auto flex items-center justify-center rounded-md relative group">
                  <span className="material-symbols-outlined text-border text-[4rem]">qr_code_2</span>
                  <div className="absolute inset-0 bg-white/60 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                     <span className="text-xs font-bold text-content-primary">MOCK QR</span>
                  </div>
               </div>

               <div className="bg-surface-secondary rounded p-4 text-sm space-y-2 text-left mt-4 border border-border-light">
                 <div className="flex justify-between">
                   <span className="text-content-secondary">Số tiền:</span>
                   <span className="font-bold text-navy">{formatPrice(total)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-content-secondary">Nội dung CK:</span>
                   <span className="font-bold">CMART ORD001</span>
                 </div>
               </div>
               
               <p className="text-xs text-content-tertiary">Hoặc click nút bên dưới để mô phỏng webhook thành công từ PayOS trả về hệ thống.</p>
               
               <button
                 onClick={handleSimulatePaymentSuccess}
                 className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-sm shadow-sm transition-all flex justify-center items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[1.1rem]">done_all</span>
                 Giả lập thanh toán hoàn tất
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Success Success */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-md shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green text-[2.5rem] mx-auto mb-4 border border-green/20">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-content-primary mb-2">Đặt hàng thành công!</h3>
              <p className="text-sm text-content-secondary mb-6 leading-relaxed">
                Đơn hàng của bạn đã được ghi nhận và tiền đang được giữ an toàn tại hệ thống Escrow. Người bán sẽ tiến hành giao hàng cho bạn sớm nhất.
              </p>
              <button
                onClick={closeSuccessAndRedirect}
                className="w-full py-3 bg-[#ff6b35] hover:bg-[#ff7849] text-white font-bold rounded-sm transition-colors"
                style={{letterSpacing: '0.3px'}}
              >
                Xem đơn hàng của tôi
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
