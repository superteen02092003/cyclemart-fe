export default function InspectorReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Biên bản & Báo cáo</h1>
          <p className="text-sm text-content-secondary mt-1">
            Quản lý biên bản kiểm định và các báo cáo liên quan.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-border-light p-10 text-center shadow-card">
        <span className="material-symbols-outlined text-4xl text-content-tertiary mb-3">
          upload_file
        </span>
        <p className="text-content-secondary font-medium">
          Tính năng đang được phát triển.
        </p>
      </div>
    </div>
  )
}

