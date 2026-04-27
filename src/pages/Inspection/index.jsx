// File: src/pages/Inspection/index.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginPromptModal } from '@/components/shared/LoginPromptModal'
import InspectionModal from '@/components/inspection/InspectionModal'

export default function InspectionPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [open, setOpen] = useState(true)

  // Show login prompt modal if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <LoginPromptModal
        title="Cần đăng nhập để sử dụng dịch vụ kiểm định"
        description="Dịch vụ kiểm định xe chuyên nghiệp giúp tăng giá trị và độ tin cậy cho xe của bạn. Đăng nhập để đặt lịch kiểm định ngay!"
        icon="verified"
        iconColor="#2563eb"
      />
    )
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-content-secondary">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!open && (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-content-secondary mb-4">Dịch vụ kiểm định xe của BikeConnect.</p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-sm"
            style={{ backgroundColor: '#ff6b35' }}
          >
            <span className="material-symbols-outlined text-[1rem]">verified</span>
            Mở dịch vụ kiểm định
          </button>
        </div>
      )}
      {open && <InspectionModal onClose={() => setOpen(false)} />}
    </>
  )
}