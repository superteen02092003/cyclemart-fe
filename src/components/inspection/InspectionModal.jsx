import { useState } from 'react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'
import { MOCK_MY_LISTINGS, MOCK_INSPECTION_REQUESTS } from '@/constants/mockData'

const INSPECTION_FEE = 250000

const STATUS_CONFIG = {
  PENDING:    { label: 'Chờ phân công',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ASSIGNED:   { label: 'Đã phân công',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INSPECTING: { label: 'Đang kiểm định', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  PASSED:     { label: 'Đạt — Verified', color: 'bg-green-50 text-green-700 border-green-200' },
  FAILED:     { label: 'Không đạt',      color: 'bg-red-50 text-red-700 border-red-200' },
}

const STEPS = [
  { icon: 'assignment',        title: 'Đăng ký & Thanh toán', desc: 'Chọn xe, điền địa chỉ, thanh toán phí trước.' },
  { icon: 'person_pin_circle', title: 'Phân công Inspector',   desc: 'Admin gán nhân viên theo khu vực.' },
  { icon: 'search',            title: 'Kiểm định tại chỗ',     desc: 'Inspector kiểm tra theo checklist chuẩn.' },
  { icon: 'verified',          title: 'Nhận kết quả',          desc: 'Đạt → badge "Đã kiểm định". Không đạt → ghi lý do.' },
]

// ─── Request Card ─────────────────────────────────────────────
function RequestCard({ req }) {
  const cfg = STATUS_CONFIG[req.status]
  return (
    <div className="bg-surface-secondary rounded-sm border border-border-light p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-content-primary leading-snug line-clamp-2">{req.listingTitle}</h3>
        <span className={cn('flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.color)}>
          {cfg.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary mb-2">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[0.8rem]">location_on</span>
          {req.address}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[0.8rem]">calendar_today</span>
          {req.scheduledDate}
        </span>
        {req.inspectorName && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.8rem]">badge</span>
            {req.inspectorName}
          </span>
        )}
      </div>
      {req.status === 'PASSED' && req.resultNote && (
        <div className="flex items-start gap-1.5 bg-green-50 border border-green-200 rounded-sm px-3 py-2 mt-1">
          <span className="material-symbols-outlined text-green-600 text-[0.9rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <p className="text-xs text-green-800">{req.resultNote}</p>
        </div>
      )}
      {req.status === 'FAILED' && req.resultNote && (
        <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mt-1">
          <span className="material-symbols-outlined text-red-600 text-[0.9rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
          <p className="text-xs text-red-800">{req.resultNote}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────
export default function InspectionModal({ onClose, preselectedId }) {
  const [tab, setTab] = useState(preselectedId ? 'register' : 'register')
  const [requests, setRequests] = useState(MOCK_INSPECTION_REQUESTS)
  const [toast, setToast] = useState('')

  // Form state
  const activeListings = MOCK_MY_LISTINGS.filter((l) => l.status === 'ACTIVE')
  const defaultId = preselectedId ?? activeListings[0]?.id ?? ''
  const [form, setForm] = useState({ listingId: defaultId, address: '', scheduledDate: '', note: '' })
  const [formStep, setFormStep] = useState(1)

  const selected = activeListings.find((l) => l.id === form.listingId)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const handleSubmit = () => {
    const newReq = {
      id: `ins${Date.now()}`,
      listingId: form.listingId,
      listingTitle: selected?.title ?? '',
      address: form.address,
      scheduledDate: form.scheduledDate,
      note: form.note,
      fee: INSPECTION_FEE,
      status: 'PENDING',
      inspectorName: null,
      inspectorPhone: null,
      createdAt: new Date().toISOString().split('T')[0],
      result: null,
      resultNote: null,
    }
    setRequests((prev) => [newReq, ...prev])
    setForm({ listingId: defaultId, address: '', scheduledDate: '', note: '' })
    setFormStep(1)
    setTab('requests')
    showToast('Đăng ký kiểm định thành công! Chúng tôi sẽ liên hệ để xác nhận lịch.')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-navy text-[1.3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h2 className="text-base font-bold text-content-primary">Dịch vụ Kiểm định xe</h2>
          </div>
          <button onClick={onClose} className="text-content-tertiary hover:text-content-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light flex-shrink-0">
          {[
            { key: 'register', label: 'Đăng ký mới', icon: 'add_circle' },
            { key: 'requests', label: `Yêu cầu của tôi (${requests.length})`, icon: 'list_alt' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors',
                tab === t.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-content-secondary hover:text-content-primary'
              )}
            >
              <span className="material-symbols-outlined text-[1rem]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-sm text-sm font-medium text-green-800 flex-shrink-0">
            <span className="material-symbols-outlined text-green-600 text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {toast}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1">

          {/* ── Tab: Đăng ký mới ── */}
          {tab === 'register' && (
            <div className="px-6 py-5 space-y-5">

              {/* How it works */}
              <div className="grid grid-cols-4 gap-3">
                {STEPS.map((s, i) => (
                  <div key={i} className="text-center relative pt-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-navy text-white text-[0.65rem] font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="material-symbols-outlined text-navy text-[1.5rem]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    <p className="text-xs font-semibold text-content-primary mt-1 mb-0.5">{s.title}</p>
                    <p className="text-[0.7rem] text-content-secondary leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>

              <hr className="border-border-light" />

              {/* Form step 1 */}
              {formStep === 1 && (
                <div className="space-y-4">
                  {/* Bike */}
                  <div>
                    <label className="block text-sm font-semibold text-content-primary mb-1.5">
                      Chọn xe cần kiểm định <span className="text-error">*</span>
                    </label>
                    {activeListings.length === 0 ? (
                      <p className="text-sm text-content-secondary bg-surface-secondary rounded-sm px-4 py-3">
                        Bạn chưa có tin đăng nào đang hoạt động.
                      </p>
                    ) : (
                      <select
                        value={form.listingId}
                        onChange={(e) => setForm({ ...form, listingId: e.target.value })}
                        className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-navy"
                      >
                        {activeListings.map((l) => (
                          <option key={l.id} value={l.id}>{l.title} — {formatPrice(l.price)}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-content-primary mb-1.5">
                      Địa chỉ kiểm định <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP. HCM"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-navy"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-content-primary mb-1.5">
                      Ngày mong muốn <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.scheduledDate}
                      onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                      className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-navy"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-semibold text-content-primary mb-1.5">
                      Ghi chú <span className="text-content-tertiary font-normal">(tuỳ chọn)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="VD: Nhà có cầu thang, gọi trước khi đến..."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-navy resize-none"
                    />
                  </div>

                  {/* Fee */}
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-sm px-4 py-3">
                    <span className="material-symbols-outlined text-amber-600 text-[1rem] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <p className="text-sm text-amber-800">
                      Phí kiểm định: <strong>{formatPrice(INSPECTION_FEE)}</strong>. Thanh toán trước khi Inspector đến.
                      Phí không hoàn lại nếu xe không đạt.
                    </p>
                  </div>
                </div>
              )}

              {/* Form step 2: confirm */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-content-secondary">Xác nhận thông tin đăng ký:</p>
                  <div className="bg-surface-secondary rounded-sm divide-y divide-border-light">
                    {[
                      { label: 'Xe',     value: selected?.title },
                      { label: 'Địa chỉ', value: form.address },
                      { label: 'Ngày',   value: form.scheduledDate },
                      { label: 'Phí',    value: formatPrice(INSPECTION_FEE) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                        <span className="text-content-secondary">{label}</span>
                        <span className="font-medium text-content-primary text-right max-w-[65%]">{value}</span>
                      </div>
                    ))}
                  </div>
                  {form.note && <p className="text-sm text-content-secondary italic">Ghi chú: {form.note}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Yêu cầu của tôi ── */}
          {tab === 'requests' && (
            <div className="px-6 py-5">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-content-tertiary mb-3 text-[3rem]" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
                  <p className="font-semibold text-content-primary mb-1">Chưa có yêu cầu nào</p>
                  <p className="text-sm text-content-secondary mb-4">Đăng ký kiểm định để tăng uy tín cho xe của bạn.</p>
                  <button
                    onClick={() => setTab('register')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-sm"
                    style={{ backgroundColor: '#ff6b35' }}
                  >
                    <span className="material-symbols-outlined text-[1rem]">add</span>
                    Đăng ký ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => <RequestCard key={req.id} req={req} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'register' && (
          <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3 flex-shrink-0">
            {formStep === 2 && (
              <button
                onClick={() => setFormStep(1)}
                className="px-4 py-2 text-sm font-semibold border border-border rounded-sm text-content-primary hover:bg-surface-secondary"
              >
                Quay lại
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-border rounded-sm text-content-secondary hover:bg-surface-secondary">
              Đóng
            </button>
            {formStep === 1 ? (
              <button
                onClick={() => setFormStep(2)}
                disabled={!form.listingId || !form.address || !form.scheduledDate}
                className="px-5 py-2 text-sm font-semibold text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1e3a5f' }}
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold text-white rounded-sm"
                style={{ backgroundColor: '#ff6b35' }}
              >
                Xác nhận & Thanh toán
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
