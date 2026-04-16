import { StatCard } from '@/components/admin/StatCard'
import { Link } from 'react-router-dom'

const QUICK_ACTIONS = [
  {
    icon: 'fact_check',
    title: 'Duyệt tin đăng',
    description: '43 tin đang chờ xét duyệt',
    badge: '43',
    badgeColor: 'text-navy bg-navy-subtle',
    path: '/admin/listings',
  },
  {
    icon: 'report',
    title: 'Xử lý báo cáo',
    description: '18 báo cáo vi phạm mới',
    badge: '18',
    badgeColor: 'text-error bg-error/10',
    path: '/admin/reports',
  },
  {
    icon: 'bar_chart',
    title: 'Xem thống kê',
    description: 'Phân tích doanh thu & tăng trưởng',
    badge: null,
    badgeColor: '',
    path: '/admin/statistics',
  },
  {
    icon: 'label',
    title: 'Quản lý danh mục',
    description: 'Thương hiệu, loại xe, groupset',
    badge: null,
    badgeColor: '',
    path: '/admin/categories',
  },
]

const RECENT_ACTIVITIES = [
  { name: 'Nguyễn Văn A', action: 'Đăng tin đăng mới', time: '5 phút trước', type: 'listing' },
  { name: 'Trần Thị B', action: 'Gửi báo cáo vi phạm', time: '15 phút trước', type: 'report' },
  { name: 'Lê Văn C', action: 'Hoàn tất giao dịch', time: '1 giờ trước', type: 'transaction' },
  { name: 'Phạm Thị D', action: 'Cập nhật profile', time: '2 giờ trước', type: 'user' },
]

const ACTIVITY_ICONS = {
  listing: 'add_circle',
  report: 'flag',
  transaction: 'payments',
  user: 'manage_accounts',
}

const SYSTEM_SERVICES = [
  { name: 'API Server', status: 'active', uptime: '99.9%', icon: 'dns' },
  { name: 'Database', status: 'active', uptime: '99.95%', icon: 'storage' },
  { name: 'Email Service', status: 'active', uptime: '99.8%', icon: 'mail' },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Hero — đồng bộ với HeroSection trang Home */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A1628 0%, #1e3a5f 60%, #0A1628 100%)' }}
      >
        {/* Mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a6fa5 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
          {/* Quick stats inline — like HeroSection stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-white/10">
            {[
              { value: '2.456', label: 'Người dùng' },
              { value: '43', label: 'Tin chờ duyệt' },
              { value: '18', label: 'Báo cáo mới' },
              { value: '₫456M', label: 'Giao dịch tháng' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.44px' }}>
                  {stat.value}
                </p>
                <p className="text-sm text-white/50 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Stats Grid — dùng StatCard đã redesign */}
        <div className="mb-3">
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Tổng quan</p>
          <h2 className="text-2xl font-bold text-content-primary mb-6" style={{ letterSpacing: '-0.44px' }}>
            Chỉ số hôm nay
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Tổng người dùng" value="2.456" change={12} icon="group" />
          <StatCard title="Tin đăng chờ duyệt" value="43" change={-5} icon="fact_check" />
          <StatCard title="Báo cáo chưa xử lý" value="18" change={8} icon="report" />
          <StatCard title="Giao dịch tháng này" value="₫456M" change={24} icon="payments" />
        </div>

        {/* Quick Actions — Airbnb TrustSection style cards */}
        <div className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Điều hướng</p>
            <h2 className="text-2xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
              Thao tác nhanh
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-full bg-navy-subtle flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-navy text-[1.3rem]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {action.icon}
                    </span>
                  </div>
                  {action.badge && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-content-primary mb-1 text-base">{action.title}</h3>
                <p className="text-sm text-content-secondary leading-relaxed flex-1">{action.description}</p>
                <div className="flex items-center gap-1 mt-4 text-navy text-sm font-semibold">
                  <span>Đi đến</span>
                  <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Row: Recent Activities + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Nhật ký</p>
                <h2 className="text-xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
                  Hoạt động gần đây
                </h2>
              </div>
              <button className="text-sm font-semibold text-navy flex items-center gap-1 hover:text-navy-medium transition-colors">
                Xem tất cả
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border-light last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-navy-subtle flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-navy text-[1.1rem]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {ACTIVITY_ICONS[activity.type]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-content-primary text-sm">{activity.name}</p>
                    <p className="text-sm text-content-secondary">{activity.action}</p>
                  </div>
                  <p className="text-xs text-content-tertiary whitespace-nowrap flex-shrink-0">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="mb-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Hệ thống</p>
              <h2 className="text-xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
                Trạng thái
              </h2>
            </div>

            <div className="space-y-4">
              {SYSTEM_SERVICES.map((service, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary">
                  <div className="w-10 h-10 rounded-full bg-navy-subtle flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-navy text-[1.1rem]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {service.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-content-primary text-sm">{service.name}</p>
                    <p className="text-xs text-content-secondary mt-0.5">Uptime {service.uptime}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                    <span className="text-xs font-semibold text-success">Online</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall status summary */}
            <div
              className="mt-5 rounded-lg px-4 py-3 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%)' }}
            >
              <span
                className="material-symbols-outlined text-green-container text-[1.3rem]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Tất cả hệ thống hoạt động</p>
                <p className="text-xs text-white/50">Cập nhật lúc 07:42 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
