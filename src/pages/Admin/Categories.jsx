import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { categoryService } from '@/services/category'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({}) // State lưu lỗi validate

  const [categoryFormData, setCategoryFormData] = useState({ 
    name: '', 
    description: '',
    displayOrder: 1,
    parentId: null,
    isActive: true 
  })

  // Load categories từ API
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      setCategories(data || [])
    } catch (error) {
      console.error('❌ Error loading categories:', error)
      alert('Không thể tải danh sách danh mục.')
    } finally {
      setLoading(false)
    }
  }

  // VALIDATE FRONTEND
  const validateForm = () => {
    const newErrors = {}
    
    if (!categoryFormData.name || categoryFormData.name.trim() === '') {
      newErrors.name = 'Tên danh mục không được để trống'
    } else if (categoryFormData.name.length < 2 || categoryFormData.name.length > 100) {
      newErrors.name = 'Tên danh mục phải từ 2 đến 100 ký tự'
    }

    if (categoryFormData.description && categoryFormData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự'
    }

    if (categoryFormData.displayOrder === '' || categoryFormData.displayOrder === null) {
      newErrors.displayOrder = 'Thứ tự hiển thị không được để trống'
    } else if (categoryFormData.displayOrder < 0 || categoryFormData.displayOrder > 9999) {
      newErrors.displayOrder = 'Thứ tự hiển thị phải từ 0 đến 9999'
    }

    // Tùy chọn: Validate không cho phép danh mục cha tự chọn chính nó (nếu đang update)
    if (selectedItem && categoryFormData.parentId === selectedItem.id) {
       newErrors.parentId = 'Danh mục không thể là cha của chính nó'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // Trả về true nếu không có lỗi
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    
    // Kiểm tra validate trước khi gọi API
    if (!validateForm()) return;

    try {
      setLoading(true)
      if (selectedItem) {
        // Update
        await categoryService.update(selectedItem.id, categoryFormData)
      } else {
        // Create
        await categoryService.create(categoryFormData)
      }
      await loadCategories()
      closeModal()
    } catch (error) {
      console.error('Error saving category:', error)
      // Hiển thị lỗi từ backend nếu có (Backend trả về mảng/object lỗi)
      if (error.response?.data?.message) {
         alert('Lỗi: ' + error.response.data.message)
      } else {
         alert('Lỗi khi lưu danh mục')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
      try {
        setLoading(true)
        await categoryService.delete(id)
        await loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(error.response?.data?.message || 'Lỗi khi xóa danh mục')
      } finally {
        setLoading(false)
      }
    }
  }

  const closeModal = () => {
    setIsCategoryModalOpen(false)
    setSelectedItem(null)
    setCategoryFormData({ name: '', description: '', displayOrder: 1, parentId: null, isActive: true })
    setErrors({}) // Xóa lỗi khi đóng modal
  }

  const categoryColumns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Tên danh mục', width: '200px' },
    { key: 'description', label: 'Mô tả', width: '250px' },
    { key: 'displayOrder', label: 'Thứ tự', width: '80px' },
    { 
      key: 'parentName', 
      label: 'Danh mục cha', 
      width: '150px',
      render: (value, item) => (
        <span className="text-content-primary">
          {item.parentId === null ? 'Danh mục gốc' : (value || `ID: ${item.parentId}`)}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
        }`}>
          {value ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Quản lý Danh mục</h1>
        <p className="text-content-secondary mt-2">Thêm, sửa, xóa các danh mục xe trên hệ thống</p>
      </div>

      <div>
        <div className="mb-6 flex justify-between items-center">
          <span className="text-content-secondary font-medium">Tổng số: {categories.length} danh mục</span>
          <button
            onClick={() => {
              closeModal()
              setIsCategoryModalOpen(true)
            }}
            className="px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Thêm danh mục
          </button>
        </div>

        <Table
          columns={categoryColumns}
          data={categories}
          actions={(item) => [
            <button
              key="view"
              onClick={() => {
                setSelectedItem(item)
                setIsViewModalOpen(true)
              }}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
              title="Xem chi tiết"
            >
              Xem
            </button>,
            <button
              key="edit"
              onClick={() => {
                setSelectedItem(item)
                setCategoryFormData({ 
                  name: item.name, 
                  description: item.description || '',
                  displayOrder: item.displayOrder !== null ? item.displayOrder : 1,
                  parentId: item.parentId,
                  isActive: item.isActive 
                })
                setErrors({}) // Reset lỗi
                setIsCategoryModalOpen(true)
              }}
              className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
            >
              Sửa
            </button>,
            <button
              key="delete"
              onClick={() => handleDeleteCategory(item.id)}
              className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
            >
              Xóa
            </button>,
          ]}
          className="bg-surface"
        />
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeModal}
        title={selectedItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        size="md"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Tên danh mục <span className="text-error">*</span></label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 ${
                errors.name ? 'border-error bg-red-50' : 'border-border-light'
              }`}
              placeholder="Nhập tên danh mục"
              value={categoryFormData.name}
              onChange={(e) => {
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
                if (errors.name) setErrors({...errors, name: null})
              }}
            />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Mô tả</label>
            <textarea
              className={`w-full px-4 py-2 border rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 ${
                errors.description ? 'border-error bg-red-50' : 'border-border-light'
              }`}
              placeholder="Nhập mô tả danh mục"
              rows="3"
              value={categoryFormData.description}
              onChange={(e) => {
                setCategoryFormData({ ...categoryFormData, description: e.target.value })
                if (errors.description) setErrors({...errors, description: null})
              }}
            />
             {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Danh mục cha</label>
            <select
              className={`w-full px-4 py-2 border rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 ${
                 errors.parentId ? 'border-error' : 'border-border-light'
              }`}
              value={categoryFormData.parentId || ''}
              onChange={(e) => {
                setCategoryFormData({ 
                  ...categoryFormData, 
                  parentId: e.target.value === '' ? null : parseInt(e.target.value)
                })
                if(errors.parentId) setErrors({...errors, parentId: null})
              }}
            >
              <option value="">Danh mục gốc (không có cha)</option>
              {categories
                .filter(cat => cat.id !== selectedItem?.id) // Không cho chọn chính nó làm cha
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              }
            </select>
            {errors.parentId ? (
               <p className="text-xs text-error mt-1">{errors.parentId}</p>
            ) : (
               <p className="text-xs text-content-secondary mt-1">
                 Chọn "Danh mục gốc" để tạo danh mục chính, hoặc chọn danh mục khác làm cha
               </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Thứ tự hiển thị <span className="text-error">*</span></label>
            <input
              type="number"
              className={`w-full px-4 py-2 border rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50 ${
                errors.displayOrder ? 'border-error bg-red-50' : 'border-border-light'
              }`}
              placeholder="Ví dụ: 1"
              value={categoryFormData.displayOrder}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                setCategoryFormData({ ...categoryFormData, displayOrder: val })
                if (errors.displayOrder) setErrors({...errors, displayOrder: null})
              }}
            />
            {errors.displayOrder && <p className="text-xs text-error mt-1">{errors.displayOrder}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-content-primary flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={categoryFormData.isActive}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                className="mr-2 w-4 h-4 text-navy focus:ring-navy rounded-sm"
              />
              Kích hoạt danh mục
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Lưu danh mục'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-border-light text-content-primary rounded-sm font-medium hover:bg-surface-tertiary transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* View Category Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedItem(null)
        }}
        title="Chi tiết danh mục"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-content-secondary block mb-1">ID</label>
                <p className="text-content-primary font-medium">{selectedItem.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-content-secondary block mb-1">Thứ tự hiển thị</label>
                <p className="text-content-primary font-medium">{selectedItem.displayOrder}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-content-secondary block mb-1">Tên danh mục</label>
              <p className="text-content-primary font-medium">{selectedItem.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-content-secondary block mb-1">Mô tả</label>
              <p className="text-content-primary">{selectedItem.description || 'Không có mô tả'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-content-secondary block mb-1">Danh mục cha</label>
              <p className="text-content-primary">
                {selectedItem.parentName || 'Danh mục gốc'}
                {selectedItem.parentId && (
                  <span className="text-content-secondary ml-2">(ID: {selectedItem.parentId})</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-content-secondary block mb-1">Trạng thái</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedItem.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
              }`}>
                {selectedItem.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            
            <div className="flex gap-2 pt-4 mt-2 border-t border-border-light">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setCategoryFormData({ 
                    name: selectedItem.name, 
                    description: selectedItem.description || '',
                    displayOrder: selectedItem.displayOrder !== null ? selectedItem.displayOrder : 1,
                    parentId: selectedItem.parentId,
                    isActive: selectedItem.isActive 
                  })
                  setErrors({})
                  setIsCategoryModalOpen(true)
                }}
                className="flex-1 px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedItem(null)
                }}
                className="flex-1 px-4 py-2 border border-border-light text-content-primary rounded-sm font-medium hover:bg-surface-tertiary transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}