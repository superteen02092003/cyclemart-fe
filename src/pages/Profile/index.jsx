import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { postService } from '@/services/post' 
import { Badge } from '@/components/ui/Badge'
import SubscribeModal from '@/components/seller/SubscribeModal'

export default function ProfilePage() {
  const { user, updateUserContext } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [priorityPosts, setPriorityPosts] = useState([])

  const [profile, setProfile] = useState({
    fullName: '',
    phone: ''
  })

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        phone: user.phone || ''
      })
      fetchPriorityPosts()
    }
  }, [user])

  const fetchPriorityPosts = async () => {
    try {
      const data = await postService.getMyPosts()
      const activeOnes = (data?.content || data || []).filter(p => p.activePriority)
      setPriorityPosts(activeOnes)
    } catch (error) {
      console.error("Lỗi lấy danh sách gói ưu tiên:", error)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.updateProfile(profile)
      updateUserContext({
        fullName: profile.fullName,
        phone: profile.phone
      })
      showMessage('Cập nhật thông tin thành công!', 'success')
      setIsEditingProfile(false)
    } catch (error) {
      showMessage(error.message || 'Có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setProfile({
      fullName: user?.fullName || '',
      phone: user?.phone || ''
    })
    setIsEditingProfile(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      return showMessage('Mật khẩu mới không khớp!', 'error')
    }
    setLoading(true)
    try {
      await authService.changePassword(passwords)
      showMessage('Đổi mật khẩu thành công!', 'success')
      setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (error) {
      showMessage(error.message || 'Mật khẩu cũ không đúng', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (post) => {
    if (post.activePriority.endDate) {
      const end = new Date(post.activePriority.endDate)
      const now = new Date()
      const diffTime = end - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? `${diffDays} ngày` : 'Sắp hết hạn'
    }
    return `${post.activePriority.durationDays} ngày`
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-content-primary mb-6">Cài đặt tài khoản</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded-sm ${message.type === 'success' ? 'bg-green/10 text-green' : 'bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* SECTION 1: THÔNG TIN CÁ NHÂN (Đã đưa lên đầu) */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-border-light">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-content-primary">Thông tin cá nhân</h2>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-[#ff6b35] text-white text-sm font-semibold rounded-sm transition-colors">
                Cập nhật
              </button>
            )}
          </div>
          
          {!isEditingProfile ? (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-content-secondary mb-1">Email</label><p className="text-content-primary">{user?.email}</p></div>
              <div><label className="block text-sm font-medium text-content-secondary mb-1">Họ và tên</label><p className="text-content-primary">{user?.fullName}</p></div>
              <div><label className="block text-sm font-medium text-content-secondary mb-1">Số điện thoại</label><p className="text-content-primary">{user?.phone}</p></div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Họ và tên</label>
                <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-[#ff6b35]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Số điện thoại</label>
                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-[#ff6b35]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#ff6b35] text-white rounded-sm disabled:opacity-50">Lưu</button>
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border rounded-sm">Hủy</button>
              </div>
            </form>
          )}
        </div>

        {/* SECTION 2: ĐỔI MẬT KHẨU */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-border-light">
          <h2 className="text-lg font-semibold text-content-primary mb-4">Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input type="password" placeholder="Mật khẩu cũ" required value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full px-3 py-2 border rounded-sm" />
              <input type="password" placeholder="Mật khẩu mới" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-3 py-2 border rounded-sm" />
              <input type="password" placeholder="Xác nhận mật khẩu mới" required value={passwords.confirmNewPassword} onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})} className="w-full px-3 py-2 border rounded-sm" />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 border border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white font-semibold rounded-sm transition-all">
              Cập nhật mật khẩu
            </button>
          </form>
        </div>

        {/* SECTION 3: GÓI ƯU TIÊN ĐANG HOẠT ĐỘNG (Đã đưa xuống cuối) */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-border-light">
          <h2 className="text-lg font-semibold text-content-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
            Gói ưu tiên đang hoạt động
          </h2>
          
          {priorityPosts.length > 0 ? (
            <div className="space-y-4">
              {priorityPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-sm border border-border-light">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-content-primary line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.activePriority.priorityLevel.toLowerCase()}>
                        {post.activePriority.priorityLevel}
                      </Badge>
                      <span className="text-xs text-content-secondary">
                        Còn lại: <span className="font-semibold text-navy">{getDaysRemaining(post)}</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                    {post.activePriority.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-surface-secondary rounded-sm border border-dashed border-border-light">
              <p className="text-sm text-content-secondary mb-3">Bạn chưa sử dụng gói ưu tiên nào cho bài đăng.</p>
              <button 
                onClick={() => setShowSubscribeModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded text-sm font-bold hover:bg-green-600 transition-colors"
              >
                Nâng cấp ngay (Test)
              </button>
            </div>
          )}
        </div>
      </div>

      {showSubscribeModal && (
        <SubscribeModal postId={1} onClose={() => setShowSubscribeModal(false)} />
      )}
    </div>
  )
}