import { useState, useEffect } from 'react'
import { inspectionService } from '@/services/inspection'
import { Modal } from '@/components/admin/Modal'

export default function InspectorTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  
  // State form cập nhật kết quả
  const [resultForm, setResultForm] = useState({ status: 'PASSED', note: '' })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await inspectionService.getInspectorTasks({ page: 0, size: 50 })
      setTasks(data.content || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResult = async () => {
    if (!resultForm.note) return alert('Vui lòng nhập ghi chú kiểm định!')
    try {
      await inspectionService.updateResult(selectedTask.id, resultForm.status, resultForm.note)
      alert('Đã lưu kết quả kiểm định!')
      setSelectedTask(null)
      loadTasks()
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cập nhật')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
        Công việc của tôi
      </h1>

      {loading ? <p>Đang tải công việc...</p> : tasks.length === 0 ? (
        <p className="text-gray-500 bg-gray-50 p-6 rounded text-center">Hôm nay bạn không có lịch hẹn nào!</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white border rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{task.postTitle}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  task.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                  task.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <strong className="text-red-500">{new Date(task.scheduledDateTime).toLocaleString('vi-VN')}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {task.address}
                </p>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded mt-2 border">
                  <div>
                    <p className="font-medium text-gray-900">{task.sellerName}</p>
                    <p className="font-bold text-blue-600 text-lg">{task.sellerPhone}</p>
                  </div>
                  <a href={`tel:${task.sellerPhone}`} className="bg-green-500 text-white p-2 rounded-full flex items-center shadow-md">
                    <span className="material-symbols-outlined">call</span>
                  </a>
                </div>
              </div>

              {(task.status === 'ASSIGNED' || task.status === 'INSPECTING') && (
                <button 
                  onClick={() => { setSelectedTask(task); setResultForm({ status: 'PASSED', note: '' }) }}
                  className="w-full bg-[#1e3a5f] hover:bg-navy text-white py-2 rounded font-semibold transition-colors"
                >
                  Cập nhật kết quả
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Cập nhật Kết quả */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Kết quả kiểm định">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Đánh giá:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded flex-1 bg-green-50 border-green-200">
                <input 
                  type="radio" 
                  name="status" 
                  checked={resultForm.status === 'PASSED'} 
                  onChange={() => setResultForm({...resultForm, status: 'PASSED'})} 
                  className="w-5 h-5 accent-green-600"
                />
                <span className="font-bold text-green-700">ĐẠT (PASSED)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded flex-1 bg-red-50 border-red-200">
                <input 
                  type="radio" 
                  name="status" 
                  checked={resultForm.status === 'FAILED'} 
                  onChange={() => setResultForm({...resultForm, status: 'FAILED'})}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="font-bold text-red-700">KHÔNG ĐẠT (FAILED)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú / Biên bản kiểm tra:</label>
            <textarea 
              rows={4}
              className="w-full border p-2 rounded-sm focus:outline-none focus:border-blue-500"
              placeholder="Ghi rõ tình trạng xước xát, phụ tùng..."
              value={resultForm.note}
              onChange={(e) => setResultForm({...resultForm, note: e.target.value})}
            />
          </div>

          <button onClick={handleUpdateResult} className="w-full bg-[#ff6b35] text-white py-2 rounded-sm font-bold">
            Lưu Kết Quả
          </button>
        </div>
      </Modal>
    </div>
  )
}