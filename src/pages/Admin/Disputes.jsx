import { useState } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { formatPrice } from '@/utils/formatPrice'

const DISPUTES_DATA = [
  {
    id: 'ORD-8910',
    bikeTitle: 'Trek Emonda SL6 2023',
    buyer: 'Nguyễn Văn A',
    seller: 'Trần Thị B',
    disputeReason: 'Người mua báo khung bị nứt nhẹ ở phuộc trước, khác với mô tả.',
    sellerResponse: 'Xe lúc giao hoàn hảo, người mua tự làm nứt rồi báo.',
    status: 'SYSTEM_PROCESSING', // Mới nộp cọc
    createdAt: '2024-04-14',
    depositStatus: 'Đã nộp cọc (Cả 2 bên)',
    inspectorReport: null,
  },
  {
    id: 'ORD-9921',
    bikeTitle: 'Giant TCR Advanced',
    buyer: 'Lê Hoàng C',
    seller: 'Đặng Văn D',
    disputeReason: 'Group Set không mượt, đùi đĩa xước nhiều.',
    sellerResponse: 'Xe cũ nên xước là bình thường, đã chụp hình rõ.',
    status: 'WAITING_DECISION', // Inspector đã có báo cáo
    createdAt: '2024-04-10',
    depositStatus: 'Đã nộp cọc (Cả 2 bên)',
    inspectorReport: 'Group set hoạt động bình thường, vết xước khớp với ảnh lúc đăng.',
  },
]

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState(DISPUTES_DATA)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')

  const filteredDisputes = filterStatus === 'ALL' ? disputes : disputes.filter((r) => r.status === filterStatus)

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute)
    setIsDetailModalOpen(true)
  }

  const handleResolve = (id, winnerClass) => {
    // winnerClass: 'BUYER' or 'SELLER'
    setDisputes(disputes.map((r) => (r.id === id ? { ...r, status: `RESOLVED_${winnerClass}` } : r)))
    setIsDetailModalOpen(false)
  }

  const columns = [
    { key: 'id', label: 'Mã Đơn', width: '100px' },
    { key: 'bikeTitle', label: 'Sản phẩm', width: '200px' },
    { key: 'buyer', label: 'Người Mua', width: '150px' },
    { key: 'seller', label: 'Người Bán', width: '150px' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'SYSTEM_PROCESSING'
              ? 'bg-warning/20 text-warning'
              : value === 'WAITING_DECISION'
                ? 'bg-blue-500/20 text-blue-600'
                : 'bg-success/20 text-success'
          }`}
        >
          {value === 'SYSTEM_PROCESSING' ? 'Chờ Inspector' : value === 'WAITING_DECISION' ? 'Chờ Phán Quyết' : 'Đã Đóng'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Quản lý Tranh chấp Hệ thống</h1>
        <p className="text-content-secondary mt-2">Theo dõi và ra quyết định cho các ca tranh chấp (Giai đoạn 2)</p>
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
            <option value="ALL">Tất cả</option>
            <option value="SYSTEM_PROCESSING">Chờ Inspector</option>
            <option value="WAITING_DECISION">Chờ Phán Quyết</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredDisputes}
        actions={(dispute) => [
          <button
             key="view"
             onClick={() => handleViewDetails(dispute)}
             className="px-3 py-2 text-sm font-medium text-white bg-navy hover:bg-navy/90 rounded-sm transition-colors"
          >
             Xem & Xét Xử
          </button>,
        ]}
        className="bg-surface"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Xử lý Tranh chấp: ${selectedDispute?.id}`}
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-surface-secondary p-4 rounded-sm border border-border-light">
               <div>
                  <p className="text-xs text-content-secondary font-medium uppercase mb-1">Mã đơn hàng & Sản phẩm</p>
                  <p className="font-bold text-navy">{selectedDispute.id} - {selectedDispute.bikeTitle}</p>
               </div>
               <div>
                  <p className="text-xs text-content-secondary font-medium uppercase mb-1">Tiền cọc hệ thống</p>
                  <p className="font-bold text-success">{selectedDispute.depositStatus}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-error/5 p-4 rounded-sm border border-error/20">
                <p className="text-xs text-error font-bold uppercase mb-2">Lời khai Người Mua ({selectedDispute.buyer})</p>
                <p className="text-sm leading-relaxed">{selectedDispute.disputeReason}</p>
              </div>
              <div className="bg-orange/5 p-4 rounded-sm border border-orange/20">
                <p className="text-xs text-orange font-bold uppercase mb-2">Phản biện Người Bán ({selectedDispute.seller})</p>
                <p className="text-sm leading-relaxed">{selectedDispute.sellerResponse}</p>
              </div>
            </div>

            <div className="bg-[#1a237e]/5 border border-navy/20 p-4 rounded-sm">
               <p className="text-xs text-navy font-bold uppercase mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[1.1rem]">search</span>
                  Báo cáo trực tiếp từ Inspector
               </p>
               {selectedDispute.inspectorReport ? (
                  <p className="text-sm text-content-primary italic">{selectedDispute.inspectorReport}</p>
               ) : (
                  <p className="text-sm text-content-secondary italic">Inspector đang trên đường kiểm tra, chưa có báo cáo.</p>
               )}
            </div>

            {selectedDispute.status.includes('RESOLVED') ? (
               <div className="bg-success/10 p-4 font-bold text-success text-center border border-success/20 rounded-sm">
                  Tranh chấp đã đóng. Quyết định: Người thắng là {selectedDispute.status === 'RESOLVED_BUYER' ? selectedDispute.buyer : selectedDispute.seller}.
               </div>
            ) : (
               <div className="pt-4 border-t border-border-light">
                  <p className="text-sm font-bold text-error mb-3">Thẩm quyền của Admin: Đưa ra quyết định cuối cùng</p>
                  <div className="flex gap-4">
                     <button 
                        onClick={() => handleResolve(selectedDispute.id, 'BUYER')}
                        disabled={selectedDispute.status === 'SYSTEM_PROCESSING'}
                        className="flex-1 py-3 text-white bg-error hover:bg-error/90 font-bold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        Xử Người Mua Thắng (Hoàn Escrow về Buyer)
                     </button>
                     <button 
                        onClick={() => handleResolve(selectedDispute.id, 'SELLER')}
                        disabled={selectedDispute.status === 'SYSTEM_PROCESSING'}
                        className="flex-1 py-3 text-white bg-[#ff6b35] hover:bg-[#ff7849] font-bold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        Xử Người Bán Thắng (Giải Phóng Escrow 100%)
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
