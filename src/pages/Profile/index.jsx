import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // THÊM: State để quản lý chế độ hiển thị form hay văn bản
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // State cho Thông tin cá nhân
  const [profile, setProfile] = useState({
    fullName: '',
    phone: ''
  })

  // State cho Đổi mật khẩu
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // Xử lý Cập nhật thông tin
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.updateProfile(profile)
      showMessage('Cập nhật thông tin thành công!', 'success')
      setIsEditingProfile(false) // Cập nhật xong thì quay về chế độ Xem
    } catch (error) {
      showMessage(error.message || 'Có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý Hủy cập nhật (Khôi phục lại dữ liệu gốc)
  const handleCancelEdit = () => {
    setProfile({
      fullName: user?.fullName || '',
      phone: user?.phone || ''
    })
    setIsEditingProfile(false)
  }

  // Xử lý Đổi mật khẩu
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-content-primary mb-6">Cài đặt tài khoản</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded-sm ${message.type === 'success' ? 'bg-green/10 text-green' : 'bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Card: Thông tin cá nhân */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-border-light">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-content-primary">Thông tin cá nhân</h2>
            
            {/* Nút bật form cập nhật */}
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-sm font-semibold rounded-sm transition-colors"
              >
                Cập nhật
              </button>
            )}
          </div>
          
          {/* LOGIC HIỂN THỊ: Nếu đang KHÔNG edit thì hiện text, nếu edit thì hiện form */}
          {!isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Email</label>
                <p className="text-content-primary">{user?.email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Họ và tên</label>
                <p className="text-content-primary">{user?.fullName || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Số điện thoại</label>
                <p className="text-content-primary">{user?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4 border-t border-border-light pt-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Email (Không thể thay đổi)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="w-full px-3 py-2 border border-border-light rounded-sm bg-surface-tertiary text-content-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff7849] text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
                >
                  Lưu thay đổi
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 border border-border-light text-content-secondary hover:bg-surface-secondary text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card: Đổi mật khẩu (Giữ nguyên như cũ) */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-border-light">
          <h2 className="text-lg font-semibold text-content-primary mb-4">Đổi mật khẩu</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Mật khẩu cũ</label>
              <input 
                type="password" 
                required
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Mật khẩu mới</label>
              <input 
                type="password" 
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                required
                value={passwords.confirmNewPassword}
                onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})}
                className="w-full px-3 py-2 border border-border-light rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 border border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}