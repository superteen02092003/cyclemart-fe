import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/admin/StatCard'
import { adminService } from '@/services/admin'
import { useAdminStats } from '@/contexts/AdminStatsContext'

const QUICK_ACTIONS = [
  { icon: 'fact_check', title: 'Duyệt tin đăng', path: '/admin/listings', statKey: 'pending', badgeColor: 'text-navy bg-navy-subtle' },
  { icon: 'report', title: 'Báo cáo & tranh chấp', path: '/admin/reports', statKey: 'disputes', badgeColor: 'text-error bg-error/10' },
  { icon: 'bar_chart', title: 'Xem thống kê', path: '/admin/statistics', statKey: null },
  { icon: 'label', title: 'Quản lý danh mục', path: '/admin/categories', statKey: null },
]

const ACTIVITY_ICONS = {
  listing: 'add_circle',
  report: 'flag',
  transaction: 'payments',
  user: 'manage_accounts',
}

export default function AdminDashboard() {
  const { stats } = useAdminStats()
  const [extraStats, setExtraStats] = useState({ totalUsers: null, totalRevenue: null, openDisputes: null, loading: true })

  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const [usersData, paymentStats, disputesData] = await Promise.allSettled([
          adminService.getAllUsers({ page: 0, size: 1 }),
          adminService.getPaymentStatistics(),
          adminService.getAllDisputes({ page: 0, size: 1 }),
        ])

        setExtraStats({
          totalUsers: usersData.status === 'fulfilled' ? (usersData.value?.totalElements ?? usersData.value?.total ?? null) : null,
          totalRevenue: paymentStats.status === 'fulfilled' ? (paymentStats.value?.totalRevenue ?? paymentStats.value?.total ?? null) : null,
          openDisputes: disputesData.status === 'fulfilled' ? (disputesData.value?.totalElements ?? null) : null,
          loading: false,
        })
      } catch {
        setExtraStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchExtra()
  }, [])

  const fmt = (val) => val == null ? '—' : val.toLocaleString('vi-VN')
  const fmtCurrency = (val) => {
    if (val == null) return '—'
    if (val >= 1_000_000_000) return `₫${(val / 1_000_000_000).toFixed(1)}B`
    if (val >= 1_000_000) return `₫${Math.round(val / 1_000_000)}M`
    return `₫${val.toLocaleString('vi-VN')}`
  }

  const heroStats = [
    { value: extraStats.loading ? '...' : fmt(extraStats.totalUsers), label: 'Người dùng' },
    { value: stats.loading ? '...' : fmt(stats.pending), label: 'Tin chờ duyệt' },
    { value: extraStats.loading ? '...' : fmt(extraStats.openDisputes), label: 'Tranh chấp' },
    { value: extraStats.loading ? '...' : fmtCurrency(extraStats.totalRevenue), label: 'Tổng giao dịch' },
  ]

  const statCards = [
    { title: 'Tổng người dùng', value: extraStats.loading ? '...' : fmt(extraStats.totalUsers), change: null, icon: 'group' },
    { title: 'Tin đăng chờ duyệt', value: stats.loading ? '...' : fmt(stats.pending), change: null, icon: 'fact_check' },
    { title: 'Tranh chấp đang mở', value: extraStats.loading ? '...' : fmt(extraStats.openDisputes), change: null, icon: 'gavel' },
    { title: 'Tổng giao dịch', value: extraStats.loading ? '...' : fmtCurrency(extraStats.totalRevenue), change: null, icon: 'payments' },
  ]

  const badgeMap = { pending: stats.pending, disputes: extraStats.openDisputes }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A1628 0%, #1e3a5f 60%, #0A1628 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a6fa5 0%, transparent 50%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-white/10">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.44px' }}>{stat.value}</p>
                <p className="text-sm text-white/50 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Stat Cards */}
        <div className="mb-3">
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Tổng quan</p>
          <h2 className="text-2xl font-bold text-content-primary mb-6" style={{ letterSpacing: '-0.44px' }}>Chỉ số hệ thống</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card) => (
            <StatCard key={card.title} title={card.title} value={card.value} change={card.change} icon={card.icon} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Điều hướng</p>
            <h2 className="text-2xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUICK_ACTIONS.map((action) => {
              const badgeVal = action.statKey ? badgeMap[action.statKey] : null
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-full bg-navy-subtle flex items-center justify-center">
                      <span className="material-symbols-outlined text-navy text-[1.3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {action.icon}
                      </span>
                    </div>
                    {badgeVal != null && badgeVal > 0 && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${action.badgeColor}`}>
                        {badgeVal}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-content-primary mb-1 text-base">{action.title}</h3>
                  <div className="flex items-center gap-1 mt-auto pt-4 text-navy text-sm font-semibold">
                    <span>Đi đến</span>
                    <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Inspection pending notice */}
        {!stats.loading && stats.inspections > 0 && (
          <div className="mb-8 p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-warning text-[1.4rem]">pending_actions</span>
            <p className="text-sm font-medium text-content-primary">
              Có <strong>{stats.inspections}</strong> yêu cầu kiểm định chưa được phân công inspector.
            </p>
            <Link to="/admin/inspections" className="ml-auto text-sm font-bold text-navy hover:underline whitespace-nowrap">
              Xem ngay →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
