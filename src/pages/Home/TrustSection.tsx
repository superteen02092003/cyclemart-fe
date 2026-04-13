const TRUST_ITEMS = [
  {
    icon: 'verified_user',
    title: 'Kiểm định độc lập',
    description:
      'Inspector chuyên nghiệp đến tận nơi kiểm tra xe theo checklist chuẩn. Xe đạt được gắn nhãn "Verified" — mua với đầy đủ thông tin.',
  },
  {
    icon: 'lock',
    title: 'Escrow 100% an toàn',
    description:
      'Tiền được giữ an toàn bởi hệ thống escrow tích hợp PayOS. Chỉ giải phóng cho seller khi bạn xác nhận nhận xe thành công.',
  },
  {
    icon: 'chat_bubble',
    title: 'Chat & Trả giá trực tiếp',
    description:
      'Nhắn tin real-time và gửi Make an Offer ngay trong ứng dụng. Không cần qua Zalo, Messenger hay số điện thoại.',
  },
  {
    icon: 'star',
    title: 'Đánh giá minh bạch',
    description:
      'Hệ thống rating hai chiều sau mỗi giao dịch. Seller uy tín được badge xác nhận, buyer an tâm lựa chọn.',
  },
]

// Airbnb trust section: white canvas, card-shadow elevated boxes, warm text
export function TrustSection() {
  return (
    <section className="bg-surface-secondary py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-3">
            Tại sao chọn CycleMart?
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-content-primary max-w-md mx-auto"
            style={{ letterSpacing: '-0.44px' }}
          >
            Giao dịch an toàn, không lo lừa đảo
          </h2>
        </div>

        {/* Cards — Airbnb: white elevated, 20px radius, three-layer shadow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="w-11 h-11 rounded-full bg-navy-subtle flex items-center justify-center mb-5">
                <span
                  className="material-symbols-outlined text-navy text-[1.3rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              </div>
              <h3 className="font-semibold text-content-primary mb-2 text-base">{item.title}</h3>
              <p className="text-sm text-content-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
