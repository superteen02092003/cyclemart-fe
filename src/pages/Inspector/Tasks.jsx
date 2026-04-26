import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import api from '@/services/api';
import { inspectionService } from '@/services/inspection';

const formatPrice = (price) => {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function InspectorTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ASSIGNED');
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Form & Criteria states
  const [resultNote, setResultNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteria, setCriteria] = useState([]); 
  const [checklist, setChecklist] = useState({}); 

  useEffect(() => {
    fetchTasks();
    fetchCriteria(); 
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/inspections/inspector/me?page=0&size=50');
      if (response.data?.content) {
        setTasks(response.data.content);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách việc:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const data = await inspectionService.getActiveCriteria();
      setCriteria(data);
    } catch (error) {
      setCriteria([
        { id: 1, name: 'Khung xe (Nứt, gãy, sơn lại)' },
        { id: 2, name: 'Hệ thống phanh (Má phanh, cáp)' },
        { id: 3, name: 'Truyền động (Xích, líp, đề)' },
        { id: 4, name: 'Lốp & Vành xe (Mòn, cong)' },
      ]);
    }
  };

  const openModal = async (task) => {
    setSelectedTask(task);
    setResultNote(task.resultNote || '');
    
    // Đọc dữ liệu đã tick từ DB
    let parsedChecklist = {};
    if (task.checklistData) {
      try {
        const checkedIds = JSON.parse(task.checklistData);
        if (Array.isArray(checkedIds)) {
          checkedIds.forEach(id => parsedChecklist[id] = true);
        }
      } catch (e) {
        console.error("Lỗi parse checklist:", e);
      }
    }
    setChecklist(parsedChecklist);
    
    setIsLoadingDetails(true);
    setPostDetails(null);
    try {
      const res = await api.get(`/v1/posts/${task.postId}`);
      setPostDetails(res.data);
    } catch (error) {
      console.error("Không thể lấy chi tiết xe:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTask(null);
    setPostDetails(null);
  };

  const handleUpdateResult = async () => {
    if (!selectedTask) return;
    
    if (!resultNote.trim()) {
      alert('Vui lòng nhập ghi chú biên bản kiểm định để người mua có thể xem chi tiết!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Chuyển các ô đã tick thành mảng JSON
      const checkedIds = Object.keys(checklist).filter(id => checklist[id]).map(Number);
      const checklistDataStr = JSON.stringify(checkedIds);

      // Gửi ngầm định trạng thái PASSED để Backend bật isVerified = true, nhưng logic thực tế là "Đã hoàn tất kiểm định"
      await inspectionService.updateResult(selectedTask.id, 'PASSED', resultNote, checklistDataStr);
      
      alert(`Đã lưu biên bản kiểm định thành công!`);
      closeModal();
      fetchTasks();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Có lỗi xảy ra khi cập nhật kết quả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    activeTab === 'ASSIGNED' ? ['ASSIGNED', 'INSPECTING'].includes(t.status) : t.status === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Lịch hẹn kiểm định</h1>
          <p className="text-sm text-content-secondary mt-1">Quản lý và cập nhật kết quả kiểm định các xe được phân công.</p>
        </div>
        <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#175d5d] bg-white border border-[#175d5d]/20 rounded-sm hover:bg-[#175d5d]/5 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[1.1rem]">refresh</span> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-light">
        {[
          { id: 'ASSIGNED', label: 'Cần xử lý', icon: 'pending_actions' },
          { id: 'PASSED', label: 'Đã hoàn tất', icon: 'verified_user' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === tab.id ? "border-[#175d5d] text-[#175d5d] bg-white" : "border-transparent text-content-secondary hover:text-content-primary hover:bg-white/50")}>
            <span className="material-symbols-outlined text-[1.1rem]">{tab.icon}</span>
            {tab.label}
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-surface-secondary text-content-secondary">
              {tasks.filter(t => tab.id === 'ASSIGNED' ? ['ASSIGNED', 'INSPECTING'].includes(t.status) : t.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards Layout */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#175d5d]"></div></div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-sm border border-border-light p-10 text-center shadow-card">
          <span className="material-symbols-outlined text-4xl text-content-tertiary mb-3">inbox</span>
          <p className="text-content-secondary font-medium">Không có lịch hẹn nào trong mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-sm border border-border-light shadow-card p-5 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-1 h-full", task.status === 'PASSED' ? "bg-[#10b981]" : "bg-warning")} />
              <div className="pl-2">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-navy text-lg line-clamp-1" title={task.postTitle}>{task.postTitle}</h3>
                  <span className={cn("text-[0.7rem] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ml-2 flex-shrink-0", task.status === 'PASSED' ? "bg-green-100 text-green-700" : "bg-warning/10 text-warning-content")}>
                    {task.status === 'PASSED' ? 'Đã hoàn tất' : 'Chờ xử lý'}
                  </span>
                </div>
                <div className="space-y-2.5 text-sm text-content-secondary mb-5">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1.1rem]">schedule</span>
                    <strong className="text-content-primary">{task.scheduledDateTime ? new Date(task.scheduledDateTime).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có giờ'}</strong>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[1.1rem] mt-0.5">location_on</span>
                    <span className="line-clamp-2">{task.address}</span>
                  </p>
                  <div className="bg-surface-secondary p-3 rounded-sm border border-border-light mt-3">
                    <p className="flex items-center justify-between mb-1"><span className="flex items-center gap-2"><span className="material-symbols-outlined text-[1.1rem] text-content-tertiary">person</span>{task.sellerName}</span></p>
                    <p className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-navy font-bold"><span className="material-symbols-outlined text-[1.1rem] text-content-tertiary">call</span>{task.sellerPhone}</span>
                      <a href={`tel:${task.sellerPhone}`} className="text-[#175d5d] bg-[#175d5d]/10 px-2 py-1 rounded-sm text-xs font-semibold hover:bg-[#175d5d]/20 transition-colors">Gọi điện</a>
                    </p>
                  </div>
                </div>
                <button onClick={() => openModal(task)} className="w-full flex justify-center items-center gap-2 py-2.5 bg-navy text-white text-sm font-semibold rounded-sm hover:bg-navy-light transition-colors">
                  <span className="material-symbols-outlined text-[1.1rem]">assignment</span>
                  {activeTab === 'ASSIGNED' ? 'Tiến hành kiểm định' : 'Xem biên bản'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi tiết & Cập nhật kết quả */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-light bg-surface-secondary/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#175d5d]/10 rounded-full flex items-center justify-center text-[#175d5d]">
                  <span className="material-symbols-outlined text-[1.4rem]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">Hồ sơ kiểm định #{selectedTask.id}</h2>
                  <p className="text-sm text-content-secondary mt-0.5">{selectedTask.postTitle}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-content-tertiary hover:bg-white hover:text-error rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 bg-surface-secondary">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                
                {/* CỘT TRÁI: Dữ liệu người bán (Chiếm 3/5) */}
                <div className="lg:col-span-3 space-y-4">
                  {isLoadingDetails ? (
                    <div className="bg-white p-10 rounded-sm flex flex-col justify-center items-center h-full border border-border-light">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#175d5d] mb-3"></div>
                      <p className="text-sm text-content-secondary">Đang tải chi tiết xe...</p>
                    </div>
                  ) : postDetails ? (
                    <div className="bg-white rounded-sm shadow-sm border border-border-light overflow-hidden">
                      {/* Thư viện ảnh */}
                      {postDetails.images && postDetails.images.length > 0 ? (
                        <div className="flex overflow-x-auto gap-2 p-3 bg-surface-secondary/50 border-b border-border-light snap-x">
                          {postDetails.images.map((img, idx) => (
                            <img key={idx} src={typeof img === 'string' ? img : img.url} alt={`Ảnh ${idx + 1}`} className="h-40 w-auto object-cover rounded-sm snap-center border border-border-light flex-shrink-0" />
                          ))}
                        </div>
                      ) : (
                        <div className="h-32 bg-surface-secondary flex items-center justify-center border-b border-border-light">
                          <span className="text-content-tertiary text-sm">Người bán không đăng hình ảnh</span>
                        </div>
                      )}

                      {/* Thông số kỹ thuật */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-navy text-lg">{postDetails.title}</h3>
                          <span className="text-[#ff6b35] font-bold text-lg whitespace-nowrap ml-4">{formatPrice(postDetails.price)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5 p-4 bg-surface-secondary rounded-sm">
                          <div><span className="text-content-secondary text-xs block mb-0.5">Thương hiệu</span><span className="font-medium text-navy">{postDetails.brand || 'N/A'}</span></div>
                          <div><span className="text-content-secondary text-xs block mb-0.5">Dòng xe (Model)</span><span className="font-medium text-navy">{postDetails.model || 'N/A'}</span></div>
                          <div><span className="text-content-secondary text-xs block mb-0.5">Năm sản xuất</span><span className="font-medium text-navy">{postDetails.year || 'N/A'}</span></div>
                          <div><span className="text-content-secondary text-xs block mb-0.5">Kích thước khung</span><span className="font-medium text-navy">{postDetails.frameSize || 'N/A'}</span></div>
                          <div><span className="text-content-secondary text-xs block mb-0.5">Chất liệu khung</span><span className="font-medium text-navy">{postDetails.frameMaterial || 'N/A'}</span></div>
                          <div><span className="text-content-secondary text-xs block mb-0.5">Loại phanh</span><span className="font-medium text-navy">{postDetails.brakeType || 'N/A'}</span></div>
                          <div className="col-span-2"><span className="text-content-secondary text-xs block mb-0.5">Bộ truyền động (Groupset)</span><span className="font-medium text-navy">{postDetails.groupset || 'N/A'}</span></div>
                        </div>

                        <div>
                          <span className="text-content-secondary text-xs font-bold uppercase tracking-wider block mb-2">Mô tả của người bán</span>
                          <p className="text-sm text-content-primary whitespace-pre-wrap leading-relaxed">{postDetails.description || 'Không có mô tả'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-sm border border-error/20 bg-error/5 text-error text-sm">
                      Không thể tải chi tiết bài đăng. Bài đăng có thể đã bị xóa.
                    </div>
                  )}

                  {/* Thông tin lịch hẹn */}
                  <div className="bg-white p-4 rounded-sm shadow-sm border border-border-light text-sm">
                    <h3 className="font-bold text-navy flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-[#175d5d] text-[1.1rem]">today</span>Thông tin cuộc hẹn</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-content-secondary">Thời gian:</span> <span className="font-bold text-warning-content">{selectedTask.scheduledDateTime ? new Date(selectedTask.scheduledDateTime).toLocaleString('vi-VN') : 'N/A'}</span></div>
                      <div><span className="text-content-secondary">Khách hàng:</span> <span className="font-medium">{selectedTask.sellerName}</span></div>
                      <div className="col-span-2"><span className="text-content-secondary">Địa điểm:</span> <span className="font-medium">{selectedTask.address}</span></div>
                      <div className="col-span-2"><span className="text-content-secondary">Ghi chú hẹn:</span> <span className="italic text-content-primary">{selectedTask.note || selectedTask.sellerNote || 'Không có ghi chú'}</span></div>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: Bảng Công việc của Inspector (Chiếm 2/5) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white p-5 rounded-sm shadow-sm border border-border-light h-full flex flex-col sticky top-0">
                    <h3 className="font-bold text-navy flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                      <span className="material-symbols-outlined text-[#175d5d]">fact_check</span>
                      Biên bản kiểm định
                    </h3>
                    
                    <p className="text-xs text-content-secondary mb-3 italic">Tích vào các mục đạt yêu cầu. Các mục không được tích sẽ hiển thị là cần sửa chữa cho người mua.</p>

                    <div className="space-y-3 mb-6">
                      {criteria.map((item) => (
                        <label key={item.id} className={cn("flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors", checklist[item.id] ? "bg-green-50 border-green-200" : "bg-surface-secondary border-border-light hover:bg-white")}>
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-gray-300 text-[#175d5d] focus:ring-[#175d5d]"
                            checked={!!checklist[item.id]} 
                            onChange={(e) => setChecklist({...checklist, [item.id]: e.target.checked})}
                            disabled={selectedTask.status !== 'ASSIGNED' && selectedTask.status !== 'INSPECTING'}
                          />
                          <span className={cn("text-sm font-medium", checklist[item.id] ? "text-green-800" : "text-content-primary")}>{item.name}</span>
                        </label>
                      ))}
                    </div>

                    {/* Ghi chú biên bản */}
                    <div className="mt-auto">
                      <label className="block text-sm font-bold text-navy mb-2">Ghi chú chi tiết cho người mua <span className="text-error">*</span></label>
                      <textarea
                        value={resultNote}
                        onChange={(e) => setResultNote(e.target.value)}
                        placeholder="Ghi rõ tình trạng thực tế của xe so với tin đăng để công khai cho người mua xem..."
                        className="w-full border-border-light rounded-sm p-3 text-sm focus:border-[#175d5d] focus:ring-1 focus:ring-[#175d5d] resize-none h-32"
                        disabled={selectedTask.status !== 'ASSIGNED' && selectedTask.status !== 'INSPECTING'}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-light bg-white flex flex-wrap items-center gap-3 justify-end flex-shrink-0">
              <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-content-secondary border border-border-light rounded-sm hover:bg-surface-secondary transition-colors" disabled={isSubmitting}>Đóng</button>
              {(selectedTask.status === 'ASSIGNED' || selectedTask.status === 'INSPECTING') && (
                <button onClick={handleUpdateResult} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#10b981] rounded-sm hover:bg-[#059669] transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? <span className="material-symbols-outlined text-[1.1rem] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[1.1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                  XÁC NHẬN ĐÃ KIỂM ĐỊNH
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}