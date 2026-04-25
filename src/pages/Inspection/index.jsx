// File: src/pages/Inspection/index.jsx
import { useState } from 'react'
import InspectionModal from '@/components/inspection/InspectionModal'

export default function InspectionPage() {
  const [open, setOpen] = useState(true)

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