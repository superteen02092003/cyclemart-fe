const STEPS = [
  {
    step: 1,
    icon: 'search',
    title: 'Tìm kiếm & Lọc',
    description:
      'Bộ lọc chuyên biệt: loại xe, hãng, groupset, size, khu vực, khoảng giá. Tìm đúng xe bạn cần trong vài giây.',
  },
  {
    step: 2,
    icon: 'chat_bubble',
    title: 'Chat & Trả giá',
    description:
      'Nhắn tin trực tiếp với seller hoặc gửi Make an Offer. Thương lượng giá ngay trong ứng dụng — không cần qua số điện thoại.',
  },
  {
    step: 3,
    icon: 'verified_user',
    title: 'Kiểm định (tùy chọn)',
    description:
      'Yêu cầu Inspector đến kiểm định xe trước khi quyết định. Xe đạt chuẩn được gắn nhãn Verified.',
  },
  {
    step: 4,
    icon: 'lock',
    title: 'Thanh toán Escrow',
    description:
      'Thanh toán qua PayOS escrow. Tiền được giữ tạm — chỉ chuyển cho seller khi bạn nhận xe và hài lòng.',
  },
]

// Airbnb How It Works: white canvas, numbered steps, clean iconography
export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-3">Quy trình</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-content-primary"
            style={{ letterSpacing: '-0.44px' }}
          >
            Mua xe chỉ trong 4 bước
          </h2>
        </div>

        {/* Steps — Airbnb clean cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="flex flex-col">
              {/* Step number + icon */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center shadow-card">
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.4rem' }}
                    >
                      {step.icon}
                    </span>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green flex items-center justify-center border-2 border-white">
                    <span className="text-white text-[0.55rem] font-black">{step.step}</span>
                  </div>
                </div>

                {/* Connector line (horizontal except last) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block flex-1 h-px bg-border-light" />
                )}
              </div>

              <h3 className="font-semibold text-content-primary mb-2 text-base">{step.title}</h3>
              <p className="text-sm text-content-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
