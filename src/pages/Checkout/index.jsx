import { useEffect } from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { bikePostService } from '@/services/bikePost';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const platformFee = 0; // Phí nền tảng là 0 theo SRS (100% Escrow về Seller)
  const shippingFee = 200000;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });
  
  const [showPayOSContent, setShowPayOSContent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmitCheckout = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Fake thời gian tạo order và load cổng thanh toán (QR)
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayOSContent(true);
    }, 1500);
  };

  const handleSimulatePaymentSuccess = () => {
    // Fake xử lý thành công webhook
    setShowPayOSContent(false);
    setShowSuccessModal(true);
  };

  const closeSuccessAndRedirect = () => {
    navigate('/orders');
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
          </div>
        </div>
      </div>

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
