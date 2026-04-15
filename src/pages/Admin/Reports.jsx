import { useState } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'

const REPORTS_DATA = [
  {
    id: 1,
    title: 'Tin đăng giả mạo',
    reportedBy: 'Trần Văn A',
    targetUser: 'Nguyễn Thị B',
    reason: 'Hình ảnh sử dụng từ nguồn khác',
    status: 'open',
    priority: 'high',
    submittedAt: '2024-04-14',
    description: 'Hình ảnh trong tin đăng không phải của sản phẩm thực tế',
  },
  {
    id: 2,
    title: 'Giao dịch không hoàn thành',
    reportedBy: 'Lê Thị C',
    targetUser: 'Phạm Văn D',
    reason: 'Người bán không giao hàng sau thanh toán',
    status: 'resolved',
    priority: 'high',
    submittedAt: '2024-04-13',
    description: 'Đã thanh toán nhưng chưa nhận được hàng sau 5 ngày',
  },
]

export default function AdminReports() {
  const [reports, setReports] = useState(REPORTS_DATA)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('open')

  const filteredReports = reports.filter((r) => r.status === filterStatus)

  const handleViewDetails = (report) => {
    setSelectedReport(report)
    setIsDetailModalOpen(true)
  }

  const handleResolveReport = (id) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)))
  }

  const handleRejectReport = (id) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
  }

  const columns = [
    { key: 'title', label: 'Tiêu đề báo cáo', width: '180px' },
    { key: 'reportedBy', label: 'Người báo cáo', width: '150px' },
    { key: 'targetUser', label: 'Người bị báo cáo', width: '150px' },
    { key: 'reason', label: 'Lý do', width: '200px' },
    {
      key: 'priority',
      label: 'Độ ưu tiên',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'high'
              ? 'bg-error/20 text-error'
              : value === 'medium'
                ? 'bg-warning/20 text-warning'
                : 'bg-success/20 text-success'
          }`}
        >
          {value === 'high' ? 'Cao' : value === 'medium' ? 'Trung bình' : 'Thấp'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'open'
              ? 'bg-warning/20 text-warning'
              : value === 'resolved'
                ? 'bg-success/20 text-success'
                : 'bg-gray-200 text-gray-600'
          }`}
        >
          {value === 'open' ? 'Mở' : value === 'resolved' ? 'Giải quyết' : 'Từ chối'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Báo cáo & tranh chấp</h1>
        <p className="text-content-secondary mt-2">Xử lý báo cáo vi phạm và tranh chấp giao dịch</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-content-primary block mb-2">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
          >
            <option value="open">Mở</option>
            <option value="resolved">Giải quyết</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Mở</p>
          <p className="text-3xl font-bold text-warning mt-2">{reports.filter((r) => r.status === 'open').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Giải quyết</p>
          <p className="text-3xl font-bold text-success mt-2">{reports.filter((r) => r.status === 'resolved').length}</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-4">
          <p className="text-sm text-content-secondary font-medium">Độ ưu tiên cao</p>
          <p className="text-3xl font-bold text-error mt-2">{reports.filter((r) => r.priority === 'high').length}</p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredReports}
        actions={(report) =>
          report.status === 'open'
            ? [
                <button
                  key="view"
                  onClick={() => handleViewDetails(report)}
                  className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
                >
                  Xem chi tiết
                </button>,
                <button
                  key="resolve"
                  onClick={() => handleResolveReport(report.id)}
                  className="px-3 py-2 text-sm font-medium text-success hover:bg-success/10 rounded-sm transition-colors"
                >
                  Giải quyết
                </button>,
                <button
                  key="reject"
                  onClick={() => handleRejectReport(report.id)}
                  className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
                >
                  Từ chối
                </button>,
              ]
            : [
                <button
                  key="view"
                  onClick={() => handleViewDetails(report)}
                  className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
                >
                  Xem chi tiết
                </button>,
              ]
        }
        className="bg-surface"
      />

      {/* Report Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết báo cáo"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Tiêu đề báo cáo</p>
              <p className="text-content-primary font-medium mt-1">{selectedReport.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người báo cáo</p>
                <p className="text-content-primary font-medium mt-1">{selectedReport.reportedBy}</p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Người bị báo cáo</p>
                <p className="text-content-primary font-medium mt-1">{selectedReport.targetUser}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Lý do báo cáo</p>
              <p className="text-content-primary font-medium mt-1">{selectedReport.reason}</p>
            </div>
            <div>
              <p className="text-xs text-content-secondary font-medium uppercase">Mô tả chi tiết</p>
              <p className="text-content-primary mt-1">{selectedReport.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Độ ưu tiên</p>
                <p className="text-content-primary font-medium mt-1">
                  {selectedReport.priority === 'high'
                    ? 'Cao'
                    : selectedReport.priority === 'medium'
                      ? 'Trung bình'
                      : 'Thấp'}
                </p>
              </div>
              <div>
                <p className="text-xs text-content-secondary font-medium uppercase">Trạng thái</p>
                <p className="text-content-primary font-medium mt-1">
                  {selectedReport.status === 'open'
                    ? 'Mở'
                    : selectedReport.status === 'resolved'
                      ? 'Giải quyết'
                      : 'Từ chối'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}





