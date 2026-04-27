import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin'
import { formatPrice } from '@/utils/formatPrice'

const TYPE_LABELS = {
  ORDER_PAYMENT:    'Mua xe',
  INSPECTION_FEE:   'Phí kiểm định',
  PRIORITY_PACKAGE: 'Gói ưu tiên',
  TOP_UP:           'Nạp điểm',
}

const STATUS_CONFIG = {
  SUCCESS:   { label: 'Hoàn tất',   color: 'bg-success/20 text-success' },
  PENDING:   { label: 'Chờ xử lý', color: 'bg-warning/20 text-warning' },
  FAILED:    { label: 'Thất bại',   color: 'bg-error/20 text-error' },
  REFUNDED:  { label: 'Đã hoàn',    color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Đã hủy',     color: 'bg-gray-100 text-gray-600' },
}

const VI_MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']

function fmtShort(val) {
  if (val == null) return '—'
  if (val >= 1_000_000_000) return `₫${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `₫${Math.round(val / 1_000_000)}M`
  return formatPrice(val)
}

function Trend({ cur, prev }) {
  if (!prev) return null
  const pct = Math.round(((cur - prev) / prev) * 100)
  const up = pct >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-success' : 'text-error'}`}>
      <span className="material-symbols-outlined text-[0.85rem]">{up ? 'trending_up' : 'trending_down'}</span>
      {up ? '+' : ''}{pct}% so với tháng trước
    </span>
  )
}

function KpiCard({ title, value, sub, trend, prevTrend, icon, accent = '#1e3a5f' }) {
  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}18` }}
        >
          <span
            className="material-symbols-outlined text-[1.2rem]"
            style={{ color: accent, fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-sm text-content-secondary font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-content-primary mb-1">{value}</p>
      {sub && <p className="text-xs text-content-secondary mb-1.5">{sub}</p>}
      {trend !== undefined && prevTrend !== undefined && <Trend cur={trend} prev={prevTrend} />}
    </div>
  )
}

function BarChart({ data, color = '#1e3a5f', labels }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-navy text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
            {labels[i]}: {fmtShort(val)}
          </div>
          <div
            className="w-full rounded-t transition-opacity hover:opacity-75 cursor-default"
            style={{ height: `${(val / max) * 100}%`, backgroundColor: color, minHeight: val > 0 ? '4px' : '0' }}
          />
          <span className="text-[9px] text-content-secondary">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// Build last-12-months buckets from payment list
function buildMonthly(payments) {
  const now = new Date()
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth(), gmv: 0, revenue: 0, count: 0 }
  })

  payments.forEach((p) => {
    if (p.status !== 'SUCCESS') return
    const d = new Date(p.createdAt)
    const idx = buckets.findIndex(b => b.year === d.getFullYear() && b.month === d.getMonth())
    if (idx === -1) return
    const amt = p.amount || 0
    if (p.type === 'ORDER_PAYMENT') {
      buckets[idx].gmv += amt
      buckets[idx].revenue += Math.round(amt * 0.03)
    } else {
      buckets[idx].revenue += amt
    }
    buckets[idx].count += 1
  })

  return buckets
}

export default function AdminFinance() {
  const [payments, setPayments] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [paymentsRes, statsRes] = await Promise.allSettled([
          adminService.getAllPayments({ page: 0, size: 500, sort: 'createdAt', direction: 'desc' }),
          adminService.getPaymentStatistics(),
        ])
        if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value?.content || [])
        if (statsRes.status === 'fulfilled') setStatistics(statsRes.value)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Derived metrics ────────────────────────────────────────
  const success = payments.filter(p => p.status === 'SUCCESS')
  const orderSuccess = success.filter(p => p.type === 'ORDER_PAYMENT')
  const inspectionSuccess = success.filter(p => p.type === 'INSPECTION_FEE')
  const packageSuccess = success.filter(p => p.type === 'PRIORITY_PACKAGE')

  const totalGMV = orderSuccess.reduce((s, p) => s + (p.amount || 0), 0)
  const platformFeeRevenue = Math.round(totalGMV * 0.03)
  const inspectionRevenue = inspectionSuccess.reduce((s, p) => s + (p.amount || 0), 0)
  const packageRevenue = packageSuccess.reduce((s, p) => s + (p.amount || 0), 0)
  const totalRevenue = statistics?.totalRevenue ?? (platformFeeRevenue + inspectionRevenue + packageRevenue)
  const successRate = payments.length > 0 ? Math.round((success.length / payments.length) * 100) : 0

  const revenueBreakdown = [
    { label: 'Phí giao dịch (3% GMV)', value: platformFeeRevenue, color: '#1e3a5f', pct: totalRevenue > 0 ? Math.round((platformFeeRevenue / totalRevenue) * 100) : 0 },
    { label: 'Phí kiểm định', value: inspectionRevenue, color: '#10b981', pct: totalRevenue > 0 ? Math.round((inspectionRevenue / totalRevenue) * 100) : 0 },
    { label: 'Gói ưu tiên', value: packageRevenue, color: '#ff6b35', pct: totalRevenue > 0 ? Math.round((packageRevenue / totalRevenue) * 100) : 0 },
  ]

  const monthly = buildMonthly(payments)
  const monthLabels = monthly.map(b => VI_MONTHS[b.month])
  const monthlyGMV = monthly.map(b => b.gmv)
  const monthlyRevenue = monthly.map(b => b.revenue)

  const curIdx = monthly.length - 1
  const prevIdx = monthly.length - 2
  const curRevenue = monthly[curIdx]?.revenue ?? 0
  const prevRevenue = monthly[prevIdx]?.revenue ?? 0
  const curGMV = monthly[curIdx]?.gmv ?? 0
  const prevGMV = monthly[prevIdx]?.gmv ?? 0

  // Recent transactions (top 20 success)
  const recent = payments.filter(p => p.status === 'SUCCESS').slice(0, 20)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-3" />
          <p className="text-content-secondary text-sm">Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-surface-secondary min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Tài chính</p>
        <h1 className="text-3xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
          Quản lý dòng tiền
        </h1>
        <p className="text-content-secondary mt-1">Doanh thu · GMV · Cơ cấu theo nguồn</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Tổng GMV"
          value={fmtShort(totalGMV)}
          sub="Tổng giá trị đơn mua xe thành công"
          trend={curGMV} prevTrend={prevGMV}
          icon="shopping_cart"
          accent="#1e3a5f"
        />
        <KpiCard
          title="Doanh thu platform"
          value={fmtShort(totalRevenue)}
          sub="Phí giao dịch + kiểm định + gói"
          trend={curRevenue} prevTrend={prevRevenue}
          icon="trending_up"
          accent="#ff6b35"
        />
        <KpiCard
          title="Tổng giao dịch"
          value={payments.length.toLocaleString('vi-VN')}
          sub={`${success.length} thành công`}
          icon="receipt_long"
          accent="#6b7280"
        />
        <KpiCard
          title="Tỷ lệ thành công"
          value={`${successRate}%`}
          sub={`${payments.filter(p => p.status === 'PENDING').length} đang chờ xử lý`}
          icon="check_circle"
          accent="#10b981"
        />
      </div>

      {/* YTD banner */}
      <div
        className="rounded-lg p-5 mb-8 flex flex-wrap items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%)' }}
      >
        <span className="material-symbols-outlined text-[2rem]" style={{ color: '#10b981', fontVariationSettings: "'FILL' 1" }}>
          bar_chart
        </span>
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">Tổng doanh thu (tất cả thời gian)</p>
          <p className="text-2xl font-bold text-white">{fmtShort(totalRevenue)}</p>
        </div>
        <div className="w-px h-10 bg-white/20 hidden sm:block" />
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">GMV toàn sàn</p>
          <p className="text-2xl font-bold text-white">{fmtShort(totalGMV)}</p>
        </div>
        <div className="w-px h-10 bg-white/20 hidden sm:block" />
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">Take Rate</p>
          <p className="text-2xl font-bold text-white">
            {totalGMV > 0 ? `${((totalRevenue / totalGMV) * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white border border-border-light rounded-sm p-1 mb-6 w-fit shadow-sm">
        {[
          { value: 'overview',  label: 'Tổng quan',     icon: 'dashboard' },
          { value: 'monthly',   label: 'Theo tháng',    icon: 'bar_chart' },
          { value: 'breakdown', label: 'Giao dịch',     icon: 'table_chart' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              activeTab === tab.value ? 'bg-navy text-white shadow-sm' : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[0.95rem]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tổng quan ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Cơ cấu</p>
              <h2 className="text-lg font-bold text-content-primary mb-5">Phân bổ doanh thu theo nguồn</h2>

              {/* Stacked bar */}
              {totalRevenue > 0 ? (
                <>
                  <div className="flex h-4 rounded-full overflow-hidden mb-4">
                    {revenueBreakdown.map(item => (
                      <div
                        key={item.label}
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                        title={`${item.label}: ${item.pct}%`}
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {revenueBreakdown.map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-content-secondary">{item.label}</span>
                          <span className="text-xs text-content-tertiary">({item.pct}%)</span>
                        </div>
                        <span className="text-sm font-bold text-content-primary">{fmtShort(item.value)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-content-primary">Tổng doanh thu</span>
                      <span className="text-base font-bold text-navy">{fmtShort(totalRevenue)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-content-tertiary text-center py-8">Chưa có giao dịch thành công</p>
              )}
            </div>

            {/* Transaction status breakdown */}
            <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Trạng thái</p>
              <h2 className="text-lg font-bold text-content-primary mb-5">Phân bổ giao dịch</h2>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = payments.filter(p => p.status === key).length
                  const pct = payments.length > 0 ? Math.round((count / payments.length) * 100) : 0
                  if (count === 0) return null
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-content-secondary">{cfg.label}</span>
                        <span className="text-sm font-semibold text-content-primary">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: key === 'SUCCESS' ? '#10b981' : key === 'PENDING' ? '#f59e0b' : key === 'REFUNDED' ? '#3b82f6' : '#ef4444' }}
                        />
                      </div>
                    </div>
                  )
                })}
                {payments.length === 0 && (
                  <p className="text-sm text-content-tertiary text-center py-8">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </div>

          {/* Type breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: 'ORDER_PAYMENT', label: 'Giao dịch mua xe', icon: 'directions_bike', accent: '#1e3a5f' },
              { type: 'INSPECTION_FEE', label: 'Phí kiểm định', icon: 'verified', accent: '#10b981' },
              { type: 'PRIORITY_PACKAGE', label: 'Gói ưu tiên', icon: 'workspace_premium', accent: '#ff6b35' },
            ].map(({ type, label, icon, accent }) => {
              const typePayments = payments.filter(p => p.type === type)
              const typeSuccess = typePayments.filter(p => p.status === 'SUCCESS')
              const typeRevenue = typeSuccess.reduce((s, p) => s + (p.amount || 0), 0)
              return (
                <div key={type} className="bg-white rounded-lg border border-border-light shadow-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}18` }}>
                      <span className="material-symbols-outlined text-[1.1rem]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <p className="text-sm font-semibold text-content-primary">{label}</p>
                  </div>
                  <p className="text-xl font-bold text-content-primary mb-0.5">{fmtShort(typeRevenue)}</p>
                  <p className="text-xs text-content-secondary">{typeSuccess.length} giao dịch thành công / {typePayments.length} tổng</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Theo tháng ── */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">12 tháng gần nhất</p>
                <h2 className="text-lg font-bold text-content-primary">GMV theo tháng</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-content-secondary">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e3a5f' }} /> GMV</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#ff6b35' }} /> Doanh thu</span>
              </div>
            </div>
            <BarChart data={monthlyGMV} color="#1e3a5f" labels={monthLabels} />
          </div>

          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">12 tháng gần nhất</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Doanh thu platform theo tháng</h2>
            <BarChart data={monthlyRevenue} color="#ff6b35" labels={monthLabels} />
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Bảng</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Chi tiết từng tháng</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border-light">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Tháng</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">GMV</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Doanh thu</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Số GD</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Take Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[...monthly].reverse().map((b, idx) => {
                    const isCur = idx === 0
                    const takeRate = b.gmv > 0 ? ((b.revenue / b.gmv) * 100).toFixed(1) : '—'
                    return (
                      <tr key={idx} className={`border-b border-border-light transition-colors ${isCur ? 'bg-navy/5 font-semibold' : 'hover:bg-surface-secondary/50'}`}>
                        <td className="py-3 px-4 text-content-primary">
                          {VI_MONTHS[b.month]}/{b.year}
                          {isCur && <span className="ml-2 text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">Tháng này</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-content-secondary">{b.gmv > 0 ? fmtShort(b.gmv) : '—'}</td>
                        <td className="py-3 px-4 text-right font-semibold text-content-primary">{b.revenue > 0 ? fmtShort(b.revenue) : '—'}</td>
                        <td className="py-3 px-4 text-right text-content-secondary">{b.count}</td>
                        <td className="py-3 px-4 text-right">
                          {takeRate !== '—' ? (
                            <span className="text-xs font-semibold text-navy">{takeRate}%</span>
                          ) : <span className="text-content-tertiary">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Giao dịch ── */}
      {activeTab === 'breakdown' && (
        <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Gần nhất</p>
          <h2 className="text-lg font-bold text-content-primary mb-5">
            {recent.length} giao dịch thành công gần nhất
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-content-tertiary text-center py-10">Chưa có giao dịch thành công</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border-light">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Mã GD</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Người mua</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Loại</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Số tiền</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p, idx) => (
                    <tr key={p.id ?? idx} className="border-b border-border-light hover:bg-surface-secondary/50 transition-colors">
                      <td className="py-3 px-4 text-content-secondary font-mono text-xs">{p.orderId || '—'}</td>
                      <td className="py-3 px-4 text-content-primary">{p.buyerName || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-content-secondary bg-surface-secondary px-2 py-0.5 rounded-full">
                          {TYPE_LABELS[p.type] || p.type || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-content-primary">{formatPrice(p.amount)}</td>
                      <td className="py-3 px-4 text-right text-content-secondary">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
