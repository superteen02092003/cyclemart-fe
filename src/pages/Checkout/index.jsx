import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { bikePostService } from '@/services/bikePost';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { cn } from '@/utils/cn';

// DỮ LIỆU HÀNH CHÍNH TP.HỒ CHÍ MINH CẬP NHẬT MỚI NHẤT
const HCM_DATA = {
  "Thành phố Thủ Đức": [
    "Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu", "Phường Bình Thọ", 
    "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Hiệp Bình Chánh", 
    "Phường Hiệp Bình Phước", "Phường Hiệp Phú", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây", 
    "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình", "Phường Long Phước", "Phường Long Thạnh Mỹ", 
    "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Bình", "Phường Phước Long A", "Phường Phước Long B", 
    "Phường Tam Bình", "Phường Tam Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Thạnh Mỹ Lợi", 
    "Phường Thảo Điền", "Phường Thủ Thiêm", "Phường Trường Thạnh", "Phường Trường Thọ"
  ],
  "Quận 1": [
    "Phường Bến Nghé", "Phường Bến Thành", "Phường Cô Giang", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", 
    "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định"
  ],
  "Quận 3": [
    "Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 4": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"
  ],
  "Quận 5": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 6": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 7": [
    "Phường Bình Thuận", "Phường Phú Mỹ", "Phường Phú Thuận", "Phường Tân Hưng", "Phường Tân Kiểng", "Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy", "Phường Tân Thuận Đông", "Phường Tân Thuận Tây"
  ],
  "Quận 8": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận 10": [
    "Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Quận 11": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận 12": [
    "Phường An Phú Đông", "Phường Đông Hưng Thuận", "Phường Hiệp Thành", "Phường Tân Chánh Hiệp", "Phường Tân Hưng Thuận", "Phường Tân Thới Hiệp", "Phường Tân Thới Nhất", "Phường Thạnh Lộc", "Phường Thạnh Xuân", "Phường Thới An", "Phường Trung Mỹ Tây"
  ],
  "Quận Bình Tân": [
    "Phường An Lạc", "Phường An Lạc A", "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A", "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A"
  ],
  "Quận Bình Thạnh": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"
  ],
  "Quận Gò Vấp": [
    "Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"
  ],
  "Quận Phú Nhuận": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 13", "Phường 15", "Phường 17"
  ],
  "Quận Tân Bình": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Quận Tân Phú": [
    "Phường Hiệp Tân", "Phường Hòa Thạnh", "Phường Phú Thạnh", "Phường Phú Thọ Hòa", "Phường Phú Trung", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Sơn Nhì", "Phường Tân Thành", "Phường Tân Thới Hòa", "Phường Tây Thạnh"
  ],
  "Huyện Bình Chánh": [
    "Thị trấn Tân Túc", "Xã An Phú Tây", "Xã Bình Chánh", "Xã Bình Hưng", "Xã Bình Lợi", "Xã Đa Phước", "Xã Hưng Long", "Xã Lê Minh Xuân", "Xã Phạm Văn Hai", "Xã Phong Phú", "Xã Quy Đức", "Xã Tân Kiên", "Xã Tân Nhựt", "Xã Tân Quý Tây", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B"
  ],
  "Huyện Cần Giờ": [
    "Thị trấn Cần Thạnh", "Xã An Thới Đông", "Xã Bình Khánh", "Xã Long Hòa", "Xã Lý Nhơn", "Xã Tam Thôn Hiệp", "Xã Thạnh An"
  ],
  "Huyện Củ Chi": [
    "Thị trấn Củ Chi", "Xã An Nhơn Tây", "Xã An Phú", "Xã Bình Mỹ", "Xã Hòa Phú", "Xã Nhuận Đức", "Xã Phạm Văn Cội", "Xã Phú Hòa Đông", "Xã Phú Mỹ Hưng", "Xã Phước Hiệp", "Xã Phước Thạnh", "Xã Phước Vĩnh An", "Xã Tân An Hội", "Xã Tân Phú Trung", "Xã Tân Thạnh Đông", "Xã Tân Thạnh Tây", "Xã Tân Thông Hội", "Xã Thái Mỹ", "Xã Trung An", "Xã Trung Lập Hạ", "Xã Trung Lập Thượng"
  ],
  "Huyện Hóc Môn": [
    "Thị trấn Hóc Môn", "Xã Bà Điểm", "Xã Đông Thạnh", "Xã Nhị Bình", "Xã Tân Hiệp", "Xã Tân Thới Nhì", "Xã Tân Xuân", "Xã Thới Tam Thôn", "Xã Trung Chánh", "Xã Xuân Thới Đông", "Xã Xuân Thới Sơn", "Xã Xuân Thới Thượng"
  ],
  "Huyện Nhà Bè": [
    "Thị trấn Nhà Bè", "Xã Hiệp Phước", "Xã Long Thới", "Xã Nhơn Đức", "Xã Phước Kiển", "Xã Phước Lộc", "Xã Phú Xuân"
  ]
};

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const platformFee = 0;
  const shippingFee = 200000;

  // Tách địa chỉ thành các phần
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const city = "TP. Hồ Chí Minh";

  const [form, setForm] = useState({
    name: '',
    phone: '',
    note: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDisputeWarning, setShowDisputeWarning] = useState(false);

  // Redirect nếu chưa login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/checkout/${id}`));
    }
  }, [isAuthenticated, isLoading, navigate, id]);

  // Fetch thông tin xe
  useEffect(() => {
    const fetchBike = async () => {
      if (!id || id === 'undefined') {
        setError('Mã xe không hợp lệ. Vui lòng quay lại danh sách xe.');
        setLoading(false);
        return;
      }

      try {
        const data = await bikePostService.getById(id);
        const bikeData = data?.result || data?.data || data;
        setBike(bikeData);
        
        if (user) {
          setForm(prev => ({
            ...prev,
            name: user.fullName || '',
            phone: user.phone || ''
          }));
        }
      } catch (err) {
        setError('Không thể tải thông tin xe');
      } finally {
        setLoading(false);
      }
    };
    fetchBike();
  }, [id, user]);

  // Reset phường khi đổi quận
  useEffect(() => {
    setWard("");
  }, [district]);

  // HÀM XỬ LÝ THANH TOÁN (ĐÃ TÍCH HỢP VNPAY & GIỮ LẠI MODAL QR)
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate Front-end
    if (!district || !ward || !street.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng tại TP.HCM");
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }

    // Hiển thị modal cảnh báo tranh chấp
    setShowDisputeWarning(true);
  };

  // Hàm thực hiện thanh toán sau khi đồng ý cảnh báo
  const proceedWithPayment = async () => {
    setShowDisputeWarning(false);
    setIsProcessing(true);
    
    try {
      // Kiểm tra: Chỉ cho phép mua trực tiếp nếu post đã được kiểm định
      if (!bike.isInspected) {
        setError('Bài đăng chưa được kiểm định. Vui lòng yêu cầu kiểm định trước khi mua.');
        return;
      }

      const fullAddress = `${street.trim()}, ${ward}, ${district}, ${city}`;
      
      const payload = {
        amount: Math.round(bike.price + shippingFee + platformFee), 
        type: 'ORDER_PAYMENT',
        referenceId: bike.id,
        bikePostId: bike.id, 
        address: fullAddress,
        phone: form.phone,
        name: form.name,
        buyerName: form.name,
        fullName: form.name,
        note: form.note,
        description: `Thanh toán mua xe: ${bike.title}`
      };

      const response = await api.post('/v1/payments/create', payload);

      // 🚀 TÍCH HỢP VNPAY THẬT: CHUYỂN HƯỚNG TRỰC TIẾP
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } 
      // NẾU BE CHƯA CÓ VNPAY, HIỂN THỊ MODAL QR DỰ PHÒNG (GIỮ NGUYÊN CODE CỦA BẠN)
      else if (response.data?.success || response.data?.qrCodeUrl || response.data?.orderId) {
        setPaymentResponse(response.data);
        setShowQRModal(true);
      } else {
        throw new Error(response.data?.message || 'Lỗi tạo thanh toán từ Server');
      }
    } catch (err) {
      console.error("Lỗi 400 Bad Request:", err.response?.data);
      const errorDetail = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || err.message;
      alert(`Thanh toán thất bại:\n${errorDetail}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;
  if (error || !bike) return (
    <div className="py-20 text-center flex flex-col items-center justify-center">
      <span className="material-symbols-outlined text-error text-[4rem] mb-4">error</span>
      <p className="text-content-secondary font-medium mb-4">{error || 'Không tìm thấy thông tin xe'}</p>
      <Link to="/browse">
         <button className="px-6 py-2 bg-navy text-white rounded-sm">Quay lại danh sách</button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-content-primary mb-8">Thanh toán đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-sm border border-border-light shadow-card">
            <h2 className="text-lg font-bold text-content-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-navy">local_shipping</span>
              Thông tin giao hàng
            </h2>

            <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Họ tên người nhận</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-sm focus:border-navy outline-none"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-sm focus:border-navy outline-none"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* PHẦN ĐỊA CHỈ TẠI TP.HCM */}
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-navy flex items-center gap-1">
                   <span className="material-symbols-outlined text-[1.2rem]">location_on</span>
                   Địa chỉ nhận hàng (Chỉ hỗ trợ TP. Hồ Chí Minh)
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Thành phố (Read-only) */}
                   <div>
                      <label className="block text-[11px] font-bold text-content-tertiary uppercase mb-1">Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        value={city}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-border-light rounded-sm text-content-tertiary cursor-not-allowed"
                      />
                   </div>

                   {/* Quận/Huyện */}
                   <div>
                      <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">Quận/Huyện *</label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-white border border-border-light rounded-sm focus:border-navy outline-none transition-all"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {Object.keys(HCM_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>

                   {/* Phường/Xã */}
                   <div>
                      <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">Phường/Xã *</label>
                      <select
                        required
                        disabled={!district}
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-sm outline-none transition-all",
                          district ? "bg-white border-border-light focus:border-navy" : "bg-gray-50 border-gray-200 cursor-not-allowed"
                        )}
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {district && HCM_DATA[district].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                   </div>

                   {/* Số nhà / Tên đường */}
                   <div>
                      <label className="block text-[11px] font-bold text-content-secondary uppercase mb-1">Số nhà, tên đường *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: 123 Lê Lợi"
                        className="w-full px-4 py-2.5 bg-white border border-border-light rounded-sm focus:border-navy outline-none"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Ghi chú (không bắt buộc)</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-sm focus:border-navy outline-none h-24 resize-none"
                  value={form.note}
                  onChange={(e) => setForm({...form, note: e.target.value})}
                  placeholder="Ví dụ: Giao vào giờ hành chính..."
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm border border-border-light shadow-card sticky top-24">
            <h2 className="text-lg font-bold text-content-primary mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="flex gap-4 pb-4 border-b border-border-light mb-4">
              <div className="w-16 h-16 bg-surface rounded-sm overflow-hidden flex-shrink-0">
                <img 
                  src={bike.images?.[0] || 'https://via.placeholder.com/150'} 
                  alt={bike.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-content-primary line-clamp-2">{bike.title}</h3>
                <p className="text-sm text-orange font-black mt-1">{formatPrice(bike.price)}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-content-secondary">
                <span>Giá xe</span>
                <span>{formatPrice(bike.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-content-secondary">
                <span>Phí vận chuyển (TP.HCM)</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-content-secondary">
                <span>Phí nền tảng</span>
                <span className="text-green font-bold">Miễn phí</span>
              </div>
              <div className="pt-3 border-t border-border-light flex justify-between items-center">
                <span className="font-bold text-content-primary">Tổng cộng</span>
                <span className="text-xl font-black text-navy">{formatPrice(bike.price + shippingFee)}</span>
              </div>
            </div>

            {/* NÚT THANH TOÁN */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing || !bike?.isInspected}
              className={cn(
                "w-full py-4 rounded-sm font-bold text-white transition-all flex items-center justify-center gap-2",
                isProcessing || !bike?.isInspected ? "bg-gray-400 cursor-not-allowed" : "bg-[#ff6b35] hover:bg-[#e65a2b] shadow-lg shadow-orange/20"
              )}
              title={!bike?.isInspected ? "Bài đăng chưa được kiểm định" : ""}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ĐANG XỬ LÝ...
                </>
              ) : !bike?.isInspected ? (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  CHƯA CÓ KIỂM ĐỊNH
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">payments</span>
                  THANH TOÁN NGAY
                </>
              )}
            </button>

            {!bike?.isInspected && (
              <div className="mt-3 p-3 bg-warning/10 rounded-sm flex items-start gap-3 border border-warning/20">
                <span className="material-symbols-outlined text-warning text-[1.2rem]">warning</span>
                <p className="text-[11px] text-warning leading-relaxed">
                  <strong>⚠️ Bài đăng chưa được kiểm định.</strong> Hệ thống không chịu trách nhiệm đối với các sự việc xảy ra khi giao dịch xe chưa qua kiểm định. Tuy nhiên, bạn có thể nhắn tin trực tiếp với người bán để trao đổi buôn bán.
                </p>
              </div>
            )}

            <div className="mt-4 p-3 bg-navy/5 rounded-sm flex items-start gap-3 border border-navy/10">
               <span className="material-symbols-outlined text-navy text-[1.2rem]">verified_user</span>
               <p className="text-[11px] text-content-secondary leading-relaxed">
                 Số tiền sẽ được <strong>CycleMart giữ an toàn</strong> và chỉ chuyển cho người bán khi bạn xác nhận đã nhận hàng thành công.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CẢNH BÁO TRANH CHẤP */}
      {showDisputeWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-error p-4 text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-[2rem]">warning</span>
              <h3 className="font-bold text-lg">⚠️ Cảnh báo quan trọng</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
                <p className="text-sm text-content-primary leading-relaxed font-medium">
                  Hệ thống <strong className="text-error">KHÔNG giải quyết</strong> các vấn đề tranh chấp nếu đơn hàng không bị lỗi từ phía nền tảng.
                </p>
              </div>

              <div className="space-y-2 text-sm text-content-secondary">
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[1rem] text-error mt-0.5">close</span>
                  <span>Không hoàn tiền nếu người mua cố ý khiếu nại sai</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[1rem] text-error mt-0.5">close</span>
                  <span>Không hoàn tiền nếu người mua thay đổi ý định</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[1rem] text-error mt-0.5">close</span>
                  <span>Không hoàn tiền nếu tranh chấp không có bằng chứng rõ ràng</span>
                </p>
              </div>

              <div className="bg-navy/5 border border-navy/20 p-4 rounded">
                <p className="text-xs text-content-primary leading-relaxed">
                  <strong className="text-navy">💡 Khuyến nghị:</strong> Vui lòng kiểm tra kỹ thông tin xe, liên hệ người bán và yêu cầu kiểm định trước khi thanh toán để đảm bảo an toàn.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDisputeWarning(false)}
                  className="flex-1 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-bold rounded-lg transition-colors border border-border-light"
                >
                  Hủy
                </button>
                <button
                  onClick={proceedWithPayment}
                  className="flex-1 py-3 bg-error hover:bg-error/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">check_circle</span>
                  Tôi đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THANH TOÁN DỰ PHÒNG GIỮ NGUYÊN NHƯ FILE CŨ */}
      {showQRModal && paymentResponse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-navy p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">qr_code_2</span>
                Thanh toán qua VNPay
              </h3>
              <button onClick={() => setShowQRModal(false)} className="hover:rotate-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-content-tertiary uppercase font-bold tracking-widest">Số tiền cần thanh toán</p>
                <p className="text-3xl font-black text-navy">{formatPrice(paymentResponse.amount)}</p>
              </div>

              <div className="relative group inline-block p-4 border-2 border-dashed border-navy/20 rounded-xl">
                 {paymentResponse.qrCodeUrl ? (
                    <img src={paymentResponse.qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto" />
                 ) : (
                    <div className="w-64 h-64 bg-surface flex items-center justify-center italic text-content-tertiary">
                       Đang tạo mã QR...
                    </div>
                 )}
              </div>

              <div className="bg-orange/5 p-4 rounded-lg border border-orange/10">
                <p className="text-sm text-content-primary font-medium">
                  Mở ứng dụng Ngân hàng hoặc Ví điện tử quét mã QR để thanh toán
                </p>
                <p className="text-xs text-orange mt-1 font-bold">Nội dung: {paymentResponse.orderId}</p>
              </div>

              <button
                onClick={async () => {
                  try {
                    const mockIpnData = {
                      vnp_Amount: paymentResponse.amount * 100,
                      vnp_BankCode: 'NCB',
                      vnp_OrderInfo: paymentResponse.description,
                      vnp_ResponseCode: '00',
                      vnp_TransactionNo: '12345678',
                      vnp_TxnRef: paymentResponse.orderId,
                      vnp_SecureHash: 'mock_hash'
                    };
                    await api.post('/v1/payments/vnpay/ipn', mockIpnData);
                    
                    // Redirect to success page
                    navigate(`/payment-success?orderId=${paymentResponse.orderId}`);
                  } catch (error) {
                    console.error('Error simulating payment:', error);
                    alert('Lỗi giả lập thanh toán: ' + error.message);
                  }
                }}
                className="w-full py-3 bg-green hover:bg-green/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[1.1rem]">done_all</span>
                ✓ Giả lập thanh toán thành công (Test)
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
    </div>
  );
}