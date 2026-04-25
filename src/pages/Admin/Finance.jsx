import { useState } from 'react'
import { formatPrice } from '@/utils/formatPrice'

// ── Mock data ──────────────────────────────────────────────
const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

// GMV (Gross Merchandise Value) — tổng giá trị giao dịch qua sàn
const GMV_DATA = [820, 940, 1050, 1230, 1180, 1420, 1560, 1390, 1680, 1820, 1750, 2100]

// Doanh thu = phí giao dịch (3% GMV) + gói ưu tiên + kiểm định
const FEE_REVENUE    = GMV_DATA.map((v) => Math.round(v * 0.03))   // phí 3%
const PACKAGE_REVENUE = [12, 15, 18, 22, 19, 25, 28, 21, 30, 35, 32, 42]  // triệu ₫
const INSPECTION_REVENUE = [5, 6, 7, 8, 9, 10, 11, 9, 12, 14, 13, 16]     // triệu ₫
const TOTAL_REVENUE  = GMV_DATA.map((_, i) => FEE_REVENUE[i] + PACKAGE_REVENUE[i] + INSPECTION_REVENUE[i])

// Chi phí vận hành (server, nhân sự, marketing...)
const OPERATING_COST = [28, 30, 32, 33, 34, 36, 38, 35, 40, 42, 41, 48]

// Lợi nhuận ròng
const NET_PROFIT = TOTAL_REVENUE.map((r, i) => r - OPERATING_COST[i])

// Tháng hiện tại = tháng 4 (index 3)
const CUR_MONTH = 3
const PREV_MONTH = 2

const pct = (cur, prev) => (prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100))

// ── Helpers ────────────────────────────────────────────────
const M = (val) => `₫${val}M`   // shorthand for millions

function Trend({ value }) {
  const up = value >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-success' : 'text-error'}`}>
      <span className="material-symbols-outlined text-[0.85rem]">{up ? 'trending_up' : 'trending_down'}</span>
      {up ? '+' : ''}{value}% so với tháng trước
    </span>
  )
}

function KpiCard({ title, value, sub, trend, icon, accent = '#1e3a5f' }) {
  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15` }}
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
      {trend !== undefined && <Trend value={trend} />}
    </div>
  )
}

function BarChart({ data, color = '#1e3a5f', labels = MONTHS, unit = 'M' }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-navy text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
            {labels[i]}: {unit === 'M' ? `₫${val}M` : val.toLocaleString('vi-VN')}
          </div>
          <div
            className="w-full rounded-t transition-opacity hover:opacity-80 cursor-default"
            style={{
              height: `${(val / max) * 100}%`,
              backgroundColor: color,
              minHeight: '4px',
            }}
          />
          <span className="text-[9px] text-content-secondary">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function StackedBar({ items }) {
  // items: [{label, value, color}]
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden mb-3">
        {items.map((item) => (
          <div
            key={item.label}
            style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
            title={item.label}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-content-secondary">{item.label}</span>
            <span className="text-xs font-semibold text-content-primary">{M(item.value)}</span>
            <span className="text-xs text-content-tertiary">({Math.round((item.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Trang chính ────────────────────────────────────────────
export default function AdminFinance() {
  const [period, setPeriod] = useState('month') // month | quarter | year
  const [activeTab, setActiveTab] = useState('overview') // overview | cashflow | breakdown

  // Dữ liệu tháng hiện tại
  const curGMV     = GMV_DATA[CUR_MONTH]
  const prevGMV    = GMV_DATA[PREV_MONTH]
  const curRev     = TOTAL_REVENUE[CUR_MONTH]
  const prevRev    = TOTAL_REVENUE[PREV_MONTH]
  const curProfit  = NET_PROFIT[CUR_MONTH]
  const prevProfit = NET_PROFIT[PREV_MONTH]
  const curCost    = OPERATING_COST[CUR_MONTH]
  const ytdRev     = TOTAL_REVENUE.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0)
  const ytdProfit  = NET_PROFIT.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0)

  const revenueBreakdown = [
    { label: 'Phí giao dịch (3%)', value: FEE_REVENUE[CUR_MONTH], color: '#1e3a5f' },
    { label: 'Gói ưu tiên', value: PACKAGE_REVENUE[CUR_MONTH], color: '#ff6b35' },
    { label: 'Kiểm định xe', value: INSPECTION_REVENUE[CUR_MONTH], color: '#10b981' },
  ]

  const MONTHLY_TABLE = MONTHS.slice(0, CUR_MONTH + 1).map((m, i) => ({
    month: m,
    gmv: GMV_DATA[i],
    revenue: TOTAL_REVENUE[i],
    cost: OPERATING_COST[i],
    profit: NET_PROFIT[i],
    margin: Math.round((NET_PROFIT[i] / TOTAL_REVENUE[i]) * 100),
  })).reverse()

  return (
    <div className="p-8 bg-surface-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Tài chính</p>
          <h1 className="text-3xl font-bold text-content-primary" style={{ letterSpacing: '-0.44px' }}>
            Quản lý dòng tiền
          </h1>
          <p className="text-content-secondary mt-1">Doanh thu · Lợi nhuận · Chi phí · Dòng tiền</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-1 bg-white border border-border-light rounded-sm p-1 shadow-sm">
          {[
            { value: 'month', label: 'Tháng này' },
            { value: 'quarter', label: 'Quý này' },
            { value: 'year', label: 'Năm nay' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-navy text-white'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="GMV tháng này"
          value={M(curGMV)}
          sub="Tổng giá trị giao dịch qua sàn"
          trend={pct(curGMV, prevGMV)}
          icon="shopping_cart"
          accent="#1e3a5f"
        />
        <KpiCard
          title="Doanh thu tháng này"
          value={M(curRev)}
          sub={`Phí + gói + kiểm định`}
          trend={pct(curRev, prevRev)}
          icon="trending_up"
          accent="#ff6b35"
        />
        <KpiCard
          title="Chi phí vận hành"
          value={M(curCost)}
          sub="Server, nhân sự, marketing"
          icon="receipt_long"
          accent="#6b7280"
        />
        <KpiCard
          title="Lợi nhuận ròng"
          value={M(curProfit)}
          sub={`Biên lợi nhuận ${Math.round((curProfit / curRev) * 100)}%`}
          trend={pct(curProfit, prevProfit)}
          icon="savings"
          accent="#10b981"
        />
      </div>

      {/* YTD Summary banner */}
      <div
        className="rounded-lg p-5 mb-8 flex flex-wrap items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%)' }}
      >
        <span
          className="material-symbols-outlined text-green-container text-[2rem]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bar_chart
        </span>
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">Lũy kế từ đầu năm (YTD)</p>
          <p className="text-2xl font-bold text-white">{M(ytdRev)} <span className="text-white/50 text-base font-normal">doanh thu</span></p>
        </div>
        <div className="w-px h-10 bg-white/20 hidden sm:block" />
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">Lợi nhuận YTD</p>
          <p className="text-2xl font-bold text-green-container">{M(ytdProfit)}</p>
        </div>
        <div className="w-px h-10 bg-white/20 hidden sm:block" />
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-0.5">Take Rate trung bình</p>
          <p className="text-2xl font-bold text-white">
            {(TOTAL_REVENUE.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0) /
              GMV_DATA.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0) *
              100
            ).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white border border-border-light rounded-sm p-1 mb-6 w-fit shadow-sm">
        {[
          { value: 'overview', label: 'Tổng quan', icon: 'dashboard' },
          { value: 'cashflow', label: 'Dòng tiền', icon: 'waterfall_chart' },
          { value: 'breakdown', label: 'Chi tiết tháng', icon: 'table_chart' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-navy text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
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
          {/* Revenue chart + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GMV & Revenue chart */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-border-light shadow-card p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Biểu đồ</p>
                  <h2 className="text-lg font-bold text-content-primary">Doanh thu & GMV theo tháng</h2>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e3a5f' }} /> GMV</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#ff6b35' }} /> Doanh thu</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} /> Lợi nhuận</span>
                </div>
              </div>
              {/* Grouped bar chart */}
              <div className="flex items-end gap-2 h-44">
                {MONTHS.map((m, i) => {
                  const maxVal = Math.max(...GMV_DATA)
                  const isCur = i === CUR_MONTH
                  return (
                    <div key={m} className={`flex-1 flex flex-col items-center gap-1 group relative ${i > CUR_MONTH ? 'opacity-30' : ''}`}>
                      <div className="absolute bottom-6 hidden group-hover:flex flex-col bg-navy text-white text-xs px-2 py-1.5 rounded whitespace-nowrap z-10 gap-0.5 pointer-events-none">
                        <span className="font-bold">{m}</span>
                        <span>GMV: {M(GMV_DATA[i])}</span>
                        <span>Doanh thu: {M(TOTAL_REVENUE[i])}</span>
                        <span>LN: {M(NET_PROFIT[i])}</span>
                      </div>
                      <div className="flex items-end gap-0.5 w-full" style={{ height: `${(GMV_DATA[i] / maxVal) * 140}px` }}>
                        <div className="flex-1 rounded-t" style={{ height: '100%', backgroundColor: isCur ? '#0A1628' : '#1e3a5f' }} />
                        <div className="flex-1 rounded-t" style={{ height: `${(TOTAL_REVENUE[i] / GMV_DATA[i]) * 100}%`, backgroundColor: '#ff6b35' }} />
                        <div className="flex-1 rounded-t" style={{ height: `${(NET_PROFIT[i] / GMV_DATA[i]) * 100}%`, backgroundColor: '#10b981' }} />
                      </div>
                      <span className={`text-[9px] ${isCur ? 'font-bold text-navy' : 'text-content-secondary'}`}>{m}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Tháng {CUR_MONTH + 1}</p>
              <h2 className="text-lg font-bold text-content-primary mb-5">Cơ cấu doanh thu</h2>
              <StackedBar items={revenueBreakdown} />

              <div className="mt-6 space-y-3">
                {revenueBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-content-secondary">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-content-primary">{M(item.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border-light">
                  <span className="text-sm font-bold text-content-primary">Tổng doanh thu</span>
                  <span className="text-base font-bold text-navy">{M(curRev)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lợi nhuận & chi phí */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">12 tháng</p>
              <h2 className="text-lg font-bold text-content-primary mb-5">Lợi nhuận ròng</h2>
              <BarChart data={NET_PROFIT} color="#10b981" />
            </div>
            <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">12 tháng</p>
              <h2 className="text-lg font-bold text-content-primary mb-5">Chi phí vận hành</h2>
              <BarChart data={OPERATING_COST} color="#6b7280" />
            </div>
          </div>

          {/* Key ratios */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Chỉ số</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Tỷ lệ tài chính tháng {CUR_MONTH + 1}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Take Rate',
                  value: `${((curRev / curGMV) * 100).toFixed(1)}%`,
                  sub: 'Doanh thu / GMV',
                  color: '#1e3a5f',
                },
                {
                  label: 'Biên lợi nhuận',
                  value: `${Math.round((curProfit / curRev) * 100)}%`,
                  sub: 'Lợi nhuận / Doanh thu',
                  color: '#10b981',
                },
                {
                  label: 'Chi phí / Doanh thu',
                  value: `${Math.round((curCost / curRev) * 100)}%`,
                  sub: 'Cost-to-Revenue ratio',
                  color: '#6b7280',
                },
                {
                  label: 'ROI gói ưu tiên',
                  value: `${Math.round((PACKAGE_REVENUE[CUR_MONTH] / curCost) * 100)}%`,
                  sub: 'Đóng góp / Chi phí',
                  color: '#ff6b35',
                },
              ].map((kpi) => (
                <div key={kpi.label} className="p-4 rounded-lg bg-surface-secondary">
                  <p className="text-xs text-content-secondary font-medium mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-xs text-content-tertiary">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Dòng tiền ── */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Cashflow chart: tiền vào vs tiền ra */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Dòng tiền</p>
                <h2 className="text-lg font-bold text-content-primary">Tiền vào vs Tiền ra theo tháng</h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-success" /> Tiền vào</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-error" /> Tiền ra</span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-52">
              {MONTHS.map((m, i) => {
                const maxIn  = Math.max(...TOTAL_REVENUE)
                const maxOut = Math.max(...OPERATING_COST)
                const maxVal = Math.max(maxIn, maxOut)
                const isCur  = i === CUR_MONTH
                return (
                  <div key={m} className={`flex-1 flex flex-col items-center gap-1 group relative ${i > CUR_MONTH ? 'opacity-30' : ''}`}>
                    <div className="absolute bottom-6 hidden group-hover:flex flex-col bg-navy text-white text-xs px-2 py-1.5 rounded whitespace-nowrap z-10 gap-0.5 pointer-events-none">
                      <span className="font-bold">{m}</span>
                      <span className="text-success">Vào: {M(TOTAL_REVENUE[i])}</span>
                      <span className="text-error">Ra: {M(OPERATING_COST[i])}</span>
                      <span>Ròng: {M(NET_PROFIT[i])}</span>
                    </div>
                    <div className="flex items-end gap-0.5 w-full" style={{ height: `${(Math.max(TOTAL_REVENUE[i], OPERATING_COST[i]) / maxVal) * 200}px` }}>
                      <div
                        className="flex-1 rounded-t"
                        style={{ height: `${(TOTAL_REVENUE[i] / maxVal) * 200}px`, backgroundColor: isCur ? '#059669' : '#10b981' }}
                      />
                      <div
                        className="flex-1 rounded-t"
                        style={{ height: `${(OPERATING_COST[i] / maxVal) * 200}px`, backgroundColor: isCur ? '#dc2626' : '#ef4444' }}
                      />
                    </div>
                    <span className={`text-[9px] ${isCur ? 'font-bold text-navy' : 'text-content-secondary'}`}>{m}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Net cashflow bar */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Dòng tiền ròng</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Lợi nhuận ròng từng tháng (₫ triệu)</h2>
            <BarChart data={NET_PROFIT} color="#10b981" />
          </div>

          {/* Dòng tiền tích lũy */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Lũy kế</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Dòng tiền tích lũy từ đầu năm</h2>
            {(() => {
              const cumulative = NET_PROFIT.slice(0, CUR_MONTH + 1).reduce((acc, v) => {
                acc.push((acc[acc.length - 1] || 0) + v)
                return acc
              }, [])
              return <BarChart data={cumulative} color="#1e3a5f" labels={MONTHS.slice(0, CUR_MONTH + 1)} />
            })()}
            <p className="text-sm text-content-secondary mt-3">
              Dòng tiền tích lũy đến tháng {CUR_MONTH + 1}:
              <span className="font-bold text-content-primary ml-1">{M(ytdProfit)}</span>
            </p>
          </div>

          {/* Cash breakdown table */}
          <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
            <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Bảng</p>
            <h2 className="text-lg font-bold text-content-primary mb-5">Chi tiết dòng tiền</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-surface-secondary">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Nguồn tiền vào</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Tháng trước</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Tháng này</th>
                    <th className="text-right py-3 px-4 font-semibold text-content-primary">Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Phí giao dịch (3% GMV)', prev: FEE_REVENUE[PREV_MONTH], cur: FEE_REVENUE[CUR_MONTH] },
                    { label: 'Gói ưu tiên', prev: PACKAGE_REVENUE[PREV_MONTH], cur: PACKAGE_REVENUE[CUR_MONTH] },
                    { label: 'Kiểm định xe', prev: INSPECTION_REVENUE[PREV_MONTH], cur: INSPECTION_REVENUE[CUR_MONTH] },
                  ].map((row) => {
                    const growth = pct(row.cur, row.prev)
                    return (
                      <tr key={row.label} className="border-b border-border-light hover:bg-surface-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-content-primary">{row.label}</td>
                        <td className="py-3 px-4 text-right text-content-secondary">{M(row.prev)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-content-primary">{M(row.cur)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-xs font-semibold ${growth >= 0 ? 'text-success' : 'text-error'}`}>
                            {growth >= 0 ? '+' : ''}{growth}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-surface-secondary font-bold border-t-2 border-border-light">
                    <td className="py-3 px-4 text-content-primary">Tổng tiền vào</td>
                    <td className="py-3 px-4 text-right text-content-secondary">{M(prevRev)}</td>
                    <td className="py-3 px-4 text-right text-navy">{M(curRev)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold ${pct(curRev, prevRev) >= 0 ? 'text-success' : 'text-error'}`}>
                        {pct(curRev, prevRev) >= 0 ? '+' : ''}{pct(curRev, prevRev)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tbody>
                  <tr className="border-b border-border-light bg-surface-secondary/50">
                    <td className="py-3 px-4 font-semibold text-content-primary">Chi phí vận hành</td>
                    <td className="py-3 px-4 text-right text-content-secondary">{M(OPERATING_COST[PREV_MONTH])}</td>
                    <td className="py-3 px-4 text-right font-semibold text-error">{M(curCost)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-semibold ${pct(curCost, OPERATING_COST[PREV_MONTH]) >= 0 ? 'text-error' : 'text-success'}`}>
                        {pct(curCost, OPERATING_COST[PREV_MONTH]) >= 0 ? '+' : ''}{pct(curCost, OPERATING_COST[PREV_MONTH])}%
                      </span>
                    </td>
                  </tr>
                  <tr className="font-bold border-t-2 border-border-light">
                    <td className="py-3 px-4 text-content-primary">Lợi nhuận ròng</td>
                    <td className="py-3 px-4 text-right text-content-secondary">{M(prevProfit)}</td>
                    <td className="py-3 px-4 text-right text-success text-base">{M(curProfit)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold ${pct(curProfit, prevProfit) >= 0 ? 'text-success' : 'text-error'}`}>
                        {pct(curProfit, prevProfit) >= 0 ? '+' : ''}{pct(curProfit, prevProfit)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Chi tiết tháng ── */}
      {activeTab === 'breakdown' && (
        <div className="bg-white rounded-lg border border-border-light shadow-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">Lịch sử</p>
              <h2 className="text-lg font-bold text-content-primary">Bảng chi tiết từng tháng</h2>
            </div>
            <button
              onClick={() => {/* export CSV placeholder */}}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-navy border border-navy/30 rounded-sm hover:bg-navy/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[1rem]">download</span>
              Xuất CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary border-b border-border-light">
                  <th className="text-left py-3 px-4 font-semibold text-content-primary">Tháng</th>
                  <th className="text-right py-3 px-4 font-semibold text-content-primary">GMV (₫M)</th>
                  <th className="text-right py-3 px-4 font-semibold text-content-primary">Doanh thu (₫M)</th>
                  <th className="text-right py-3 px-4 font-semibold text-content-primary">Chi phí (₫M)</th>
                  <th className="text-right py-3 px-4 font-semibold text-content-primary">Lợi nhuận (₫M)</th>
                  <th className="text-right py-3 px-4 font-semibold text-content-primary">Biên LN</th>
                  <th className="text-center py-3 px-4 font-semibold text-content-primary">Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_TABLE.map((row, idx) => {
                  const isPositive = row.profit > 0
                  const isCur = row.month === MONTHS[CUR_MONTH]
                  const prevRow = MONTHLY_TABLE[idx + 1]
                  const revGrowth = prevRow ? pct(row.revenue, prevRow.revenue) : null
                  return (
                    <tr
                      key={row.month}
                      className={`border-b border-border-light transition-colors ${
                        isCur ? 'bg-navy/5 font-semibold' : 'hover:bg-surface-secondary/50'
                      }`}
                    >
                      <td className="py-3 px-4 text-content-primary">
                        {row.month}
                        {isCur && (
                          <span className="ml-2 text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                            Hiện tại
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-content-secondary">{row.gmv}</td>
                      <td className="py-3 px-4 text-right text-content-primary">{row.revenue}</td>
                      <td className="py-3 px-4 text-right text-error">{row.cost}</td>
                      <td className={`py-3 px-4 text-right font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
                        {isPositive ? '+' : ''}{row.profit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            row.margin >= 30
                              ? 'bg-success/10 text-success'
                              : row.margin >= 15
                                ? 'bg-warning/10 text-warning'
                                : 'bg-error/10 text-error'
                          }`}
                        >
                          {row.margin}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {revGrowth !== null ? (
                          <span className={`text-xs font-semibold ${revGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                            <span className="material-symbols-outlined text-[0.85rem] align-middle">
                              {revGrowth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                            {Math.abs(revGrowth)}%
                          </span>
                        ) : (
                          <span className="text-xs text-content-tertiary">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="border-t-2 border-border-light bg-navy/5 font-bold">
                  <td className="py-3 px-4 text-content-primary">Cộng (YTD)</td>
                  <td className="py-3 px-4 text-right text-content-secondary">
                    {GMV_DATA.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-navy">{ytdRev}</td>
                  <td className="py-3 px-4 text-right text-error">
                    {OPERATING_COST.slice(0, CUR_MONTH + 1).reduce((s, v) => s + v, 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-success">+{ytdProfit}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-bold text-success">
                      {Math.round((ytdProfit / ytdRev) * 100)}%
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
