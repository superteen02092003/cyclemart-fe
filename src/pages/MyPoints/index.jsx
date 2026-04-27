import { useState, useEffect, useCallback } from 'react'
import { withdrawalService } from '@/services/withdrawal'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/formatPrice'
import { toast } from '@/utils/toast'
import api from '@/services/api'
import { usePointsUpdates } from '@/hooks/useWebSocket'

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xử lý', color: 'bg-warning/20 text-warning' },
  COMPLETED: { label: 'Đã chuyển', color: 'bg-success/20 text-success' },
  REJECTED:  { label: 'Bị từ chối', color: 'bg-error/20 text-error' },
}

const BANKS = [
  'Vietcombank', 'BIDV', 'Agribank', 'VietinBank', 'Techcombank',
  'MB Bank', 'VPBank', 'TPBank', 'ACB', 'Sacombank', 'HDBank',
  'OCB', 'SHB', 'VIB', 'MSB', 'SeABank', 'LienVietPostBank', 'Khác',
]

export default function MyPointsPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(user?.point ?? 0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ amount: '', bankName: '', accountNumber: '', accountHolder: '' })
  const [errors, setErrors] = useState({})

  const fetchBalance = async () => {
    try {
      const res = await api.get('/auth/me')
      setBalance(res.data?.point ?? 0)
    } catch {
      // fallback to JWT value
    }
  }

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await withdrawalService.getMyRequests({ page: 0, size: 50 })
      setHistory(data.content || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    fetchHistory()
  }, [])

  usePointsUpdates(useCallback((data) => {
    setBalance(data.newBalance)
    fetchHistory()
  }, []))

  const validate = () => {
    const errs = {}
    const amt = Number(form.amount)
    if (!form.amount || isNaN(amt) || amt < 1) errs.amount = 'Nhập số điểm hợp lệ'
    else if (amt > balance) errs.amount = `Bạn chỉ có ${balance.toLocaleString('vi-VN')} điểm`
    if (!form.bankName) errs.bankName = 'Chọn ngân hàng'
    if (!form.accountNumber.trim()) errs.accountNumber = 'Nhập số tài khoản'
    if (!form.accountHolder.trim()) errs.accountHolder = 'Nhập tên chủ tài khoản'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      await withdrawalService.createRequest({
        amount: Number(form.amount),
        bankName: form.bankName,
        accountNumber: form.accountNumber.trim(),
        accountHolder: form.accountHolder.trim(),
      })
      toast.success('Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong thời gian sớm nhất.')
      setForm({ amount: '', bankName: '', accountNumber: '', accountHolder: '' })
      fetchBalance()
      fetchHistory()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi gửi yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-content-primary mb-1">Điểm của tôi</h1>
      <p className="text-content-secondary text-sm mb-8">1 điểm = 1 VND. Rút về tài khoản ngân hàng bất kỳ lúc nào.</p>

      {/* Balance card */}
      <div className="bg-navy rounded-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Số dư hiện tại</p>
          <p className="text-3xl font-bold text-white">{balance.toLocaleString('vi-VN')} điểm</p>
          <p className="text-white/50 text-sm mt-0.5">≈ {formatPrice(balance)}</p>
        </div>
        <span className="material-symbols-outlined text-white/20 text-[4rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
          account_balance_wallet
        </span>
      </div>

      {/* Withdrawal form */}
      <div className="bg-white border border-border-light rounded-lg p-6 mb-8 shadow-card">
        <h2 className="text-base font-bold text-content-primary mb-4">Tạo yêu cầu rút tiền</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">Số điểm muốn rút</label>
            <input
              type="number"
              min={1}
              placeholder={`Tối đa ${balance.toLocaleString('vi-VN')}`}
              {...field('amount')}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy"
            />
            {errors.amount && <p className="text-xs text-error mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">Ngân hàng</label>
            <select
              {...field('bankName')}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy"
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bankName && <p className="text-xs text-error mt-1">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">Số tài khoản</label>
            <input
              type="text"
              placeholder="Nhập số tài khoản"
              {...field('accountNumber')}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy"
            />
            {errors.accountNumber && <p className="text-xs text-error mt-1">{errors.accountNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">Tên chủ tài khoản</label>
            <input
              type="text"
              placeholder="Nhập đúng tên chủ tài khoản"
              {...field('accountHolder')}
              className="w-full px-3 py-2.5 border border-border-light rounded-sm text-sm focus:outline-none focus:border-navy"
            />
            {errors.accountHolder && <p className="text-xs text-error mt-1">{errors.accountHolder}</p>}
          </div>

          {form.amount && !errors.amount && Number(form.amount) > 0 && (
            <div className="bg-navy/5 border border-navy/10 rounded-sm p-3 text-sm text-content-secondary">
              Bạn sẽ nhận <strong className="text-content-primary">{formatPrice(Number(form.amount))}</strong> vào tài khoản ngân hàng. Điểm sẽ bị trừ ngay khi gửi yêu cầu.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-navy text-white font-bold rounded-sm hover:bg-navy/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 className="text-base font-bold text-content-primary mb-4">Lịch sử yêu cầu</h2>
        {loading ? (
          <p className="text-center py-8 text-content-secondary text-sm">Đang tải...</p>
        ) : history.length === 0 ? (
          <p className="text-center py-8 text-content-tertiary text-sm">Chưa có yêu cầu rút tiền nào.</p>
        ) : (
          <div className="space-y-3">
            {history.map(item => {
              const cfg = STATUS_CONFIG[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={item.id} className="bg-white border border-border-light rounded-sm p-4 flex items-start justify-between gap-4 shadow-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-content-primary">{item.amount?.toLocaleString('vi-VN')} điểm</p>
                      <span className="text-content-tertiary text-xs">≈ {formatPrice(item.amount)}</span>
                    </div>
                    <p className="text-sm text-content-secondary">{item.bankName} · {item.accountNumber} · {item.accountHolder}</p>
                    {item.adminNote && (
                      <p className="text-xs text-content-tertiary mt-1 italic">{item.adminNote}</p>
                    )}
                    <p className="text-xs text-content-tertiary mt-1">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-block px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
