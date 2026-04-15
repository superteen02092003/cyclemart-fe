import { StatCard } from '@/components/admin/StatCard'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navy Gradient Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A1628 0%, #1e3a5f 60%, #0A1628 100%)' }}
      >
        {/* Subtle mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a6fa5 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-green-container text-sm">✓</span>
            <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">
              Bảng điều khiển Admin
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            Quản lý hệ thống
            <br />
            <span className="text-green-container">toàn diện & hiệu quả</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Giám sát thời gian thực, quản lý người dùng, duyệt tin đăng và phân tích thống kê hệ thống CycleMart.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng người dùng" value="2,456" change={12} icon="👥" />
        <StatCard title="Tin đăng chờ duyệt" value="43" change={-5} icon="📝" />
        <StatCard title="Báo cáo chưa xử lý" value="18" change={8} icon="⚠️" />
        <StatCard title="Tổng giao dịch (tháng)" value="₫456M" change={24} icon="💳" />
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[
              { name: 'Nguyễn Văn A', action: 'Đăng tin đăng mới', time: '5 phút trước', type: 'listing' },
              { name: 'Trần Thị B', action: 'Gửi báo cáo vi phạm', time: '15 phút trước', type: 'report' },
              { name: 'Lê Văn C', action: 'Hoàn tất giao dịch', time: '1 giờ trước', type: 'transaction' },
              { name: 'Phạm Thị D', action: 'Cập nhật profil', time: '2 giờ trước', type: 'user' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border-light last:border-0">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                  {activity.type === 'listing' && '📝'}
                  {activity.type === 'report' && '⚠️'}
                  {activity.type === 'transaction' && '💳'}
                  {activity.type === 'user' && '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-content-primary">{activity.name}</p>
                  <p className="text-sm text-content-secondary">{activity.action}</p>
                  <p className="text-xs text-content-secondary mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-navy text-surface rounded-sm font-medium hover:bg-navy-dark transition-colors text-sm">
              Duyệt tin đăng
            </button>
            <button className="w-full px-4 py-3 bg-error/10 text-error rounded-sm font-medium hover:bg-error/20 transition-colors text-sm">
              Xử lý báo cáo
            </button>
            <button className="w-full px-4 py-3 bg-success/10 text-success rounded-sm font-medium hover:bg-success/20 transition-colors text-sm">
              Xem thống kê
            </button>
            <button className="w-full px-4 py-3 bg-warning/10 text-warning rounded-sm font-medium hover:bg-warning/20 transition-colors text-sm">
              Quản lý danh mục
            </button>
          </div>
        </div>
      </div>

        {/* System Health */}
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-6">Trạng thái hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'API Server', status: 'active', uptime: '99.9%' },
              { name: 'Database', status: 'active', uptime: '99.95%' },
              { name: 'Email Service', status: 'active', uptime: '99.8%' },
            ].map((service, idx) => (
              <div key={idx} className="p-4 rounded-sm bg-surface-tertiary">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-content-primary">{service.name}</p>
                  <span className="inline-block w-3 h-3 rounded-full bg-success"></span>
                </div>
                <p className="text-sm text-content-secondary">Uptime: {service.uptime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}