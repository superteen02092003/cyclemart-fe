import { useState, useEffect } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'
import { categoryService } from '@/services/category'
import { brandService } from '@/services/brand'

const MOCK_BRANDS_DATA = [
  { id: 1, name: 'Honda', category: 'Xe máy', productCount: 450, status: 'active' },
  { id: 2, name: 'Yamaha', category: 'Xe máy', productCount: 380, status: 'active' },
  { id: 3, name: 'Trek', category: 'Xe đạp', productCount: 120, status: 'active' },
  { id: 4, name: 'Giant', category: 'Xe đạp', productCount: 95, status: 'active' },
]

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [activeTab, setActiveTab] = useState('categories')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({ 
    name: '', 
    description: '',
    displayOrder: 1,
    parentId: null,
    isActive: true 
  })
  const [brandFormData, setBrandFormData] = useState({ name: '', description: '', isActive: true })

  // Load categories và brands từ API
  useEffect(() => {
    loadCategories()
    loadBrands()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      console.log('📂 Loading categories from backend...')
      const data = await categoryService.getAll()
      console.log('✅ Categories loaded:', data)
      setCategories(data || [])
    } catch (error) {
      console.error('❌ Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    try {
      console.log('🏷️ Loading brands from backend...')
      const data = await brandService.getAll()
      console.log('✅ Brands loaded:', data)
      setBrands(data || [])
    } catch (error) {
      console.error('❌ Error loading brands, using mock data:', error)
      setBrands(MOCK_BRANDS_DATA)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (selectedItem) {
        // Update
        console.log('📝 Updating category:', selectedItem.id, categoryFormData)
        await categoryService.update(selectedItem.id, categoryFormData)
      } else {
        // Create
        console.log('➕ Creating new category:', categoryFormData)
        await categoryService.create(categoryFormData)
      }
      await loadCategories()
      setIsCategoryModalOpen(false)
      setCategoryFormData({ name: '', description: '', displayOrder: 1, parentId: null, isActive: true })
      setSelectedItem(null)
    } catch (error) {
      console.error('Error saving category:', error)
      alert(error.message || 'Lỗi khi lưu danh mục')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
      try {
        setLoading(true)
        console.log('🗑️ Deleting category:', id)
        await categoryService.delete(id)
        await loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(error.message || 'Lỗi khi xóa danh mục')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (selectedItem) {
        // Update
        console.log('📝 Updating brand:', selectedItem.id, brandFormData)
        await brandService.update(selectedItem.id, brandFormData)
      } else {
        // Create
        console.log('➕ Creating new brand:', brandFormData)
        await brandService.create(brandFormData)
      }
      await loadBrands()
      setIsBrandModalOpen(false)
      setBrandFormData({ name: '', description: '', isActive: true })
      setSelectedItem(null)
    } catch (error) {
      console.error('Error saving brand:', error)
      alert(error.message || 'Lỗi khi lưu thương hiệu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBrand = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa thương hiệu này?')) {
      try {
        setLoading(true)
        console.log('🗑️ Deleting brand:', id)
        await brandService.delete(id)
        await loadBrands()
      } catch (error) {
        console.error('Error deleting brand:', error)
        alert(error.message || 'Lỗi khi xóa thương hiệu')
      } finally {
        setLoading(false)
      }
    }
  }

  const categoryColumns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Tên danh mục', width: '200px' },
    { key: 'description', label: 'Mô tả', width: '200px' },
    { key: 'displayOrder', label: 'Thứ tự', width: '80px' },
    { 
      key: 'parentName', 
      label: 'Danh mục cha', 
      width: '150px',
      render: (value, item) => (
        <span className="text-content-primary">
          {item.parentId === null ? 'Danh mục gốc' : (value || 'Không xác định')}
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

  const brandColumns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Tên thương hiệu', width: '150px' },
    { key: 'description', label: 'Mô tả', width: '250px' },
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
        <h1 className="text-3xl font-bold text-content-primary">Danh mục & Thương hiệu</h1>
        <p className="text-content-secondary mt-2">Quản lý danh mục và thương hiệu xe</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-border-light">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-navy text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Danh mục ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'brands'
              ? 'border-navy text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Thương hiệu ({brands.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setSelectedItem(null)
                setCategoryFormData({ name: '', description: '', displayOrder: 1, parentId: null, isActive: true })
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
                    displayOrder: item.displayOrder || 1,
                    parentId: item.parentId,
                    isActive: item.isActive 
                  })
                  setIsCategoryModalOpen(true)
                }}
                className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
              >
                Chỉnh sửa
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
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setSelectedItem(null)
                setBrandFormData({ name: '', description: '', isActive: true })
                setIsBrandModalOpen(true)
              }}
              className="px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Thêm thương hiệu
            </button>
          </div>

          <Table
            columns={brandColumns}
            data={brands}
            actions={(item) => [
              <button
                key="edit"
                onClick={() => {
                  setSelectedItem(item)
                  setBrandFormData({ name: item.name, description: item.description || '', isActive: item.isActive })
                  setIsBrandModalOpen(true)
                }}
                className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
              >
                Chỉnh sửa
              </button>,
              <button
                key="delete"
                onClick={() => handleDeleteBrand(item.id)}
                className="px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-sm transition-colors"
              >
                Xóa
              </button>,
            ]}
            className="bg-surface"
          />
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setSelectedItem(null)
          setCategoryFormData({ name: '', description: '', displayOrder: 1, parentId: null, isActive: true })
        }}
        title={selectedItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        size="md"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Tên danh mục *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập tên danh mục"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Mô tả</label>
            <textarea
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập mô tả danh mục"
              rows="3"
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Danh mục cha</label>
            <select
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              value={categoryFormData.parentId || ''}
              onChange={(e) => setCategoryFormData({ 
                ...categoryFormData, 
                parentId: e.target.value === '' ? null : parseInt(e.target.value)
              })}
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
            <p className="text-xs text-content-secondary mt-1">
              Chọn "Danh mục gốc" để tạo danh mục chính, hoặc chọn danh mục có sẵn để tạo danh mục con
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Thứ tự hiển thị</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập thứ tự hiển thị"
              value={categoryFormData.displayOrder}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">
              <input
                type="checkbox"
                checked={categoryFormData.isActive}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                className="mr-2"
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
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCategoryModalOpen(false)
                setSelectedItem(null)
                setCategoryFormData({ name: '', description: '', displayOrder: 1, parentId: null, isActive: true })
              }}
              className="flex-1 px-4 py-2 border border-border-light text-content-primary rounded-sm font-medium hover:bg-surface-tertiary transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Brand Modal */}
      <Modal
        isOpen={isBrandModalOpen}
        onClose={() => {
          setIsBrandModalOpen(false)
          setSelectedItem(null)
          setBrandFormData({ name: '', description: '', isActive: true })
        }}
        title={selectedItem ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        size="md"
      >
        <form onSubmit={handleBrandSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Tên thương hiệu *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập tên thương hiệu"
              value={brandFormData.name}
              onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Mô tả</label>
            <textarea
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập mô tả thương hiệu (tối đa 500 ký tự)"
              rows="3"
              maxLength="500"
              value={brandFormData.description}
              onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })}
            />
            <p className="text-xs text-content-secondary mt-1">{brandFormData.description?.length || 0}/500</p>
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">
              <input
                type="checkbox"
                checked={brandFormData.isActive}
                onChange={(e) => setBrandFormData({ ...brandFormData, isActive: e.target.checked })}
                className="mr-2"
              />
              Kích hoạt thương hiệu
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBrandModalOpen(false)
                setSelectedItem(null)
                setBrandFormData({ name: '', description: '', isActive: true })
              }}
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
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setCategoryFormData({ 
                    name: selectedItem.name, 
                    description: selectedItem.description || '',
                    displayOrder: selectedItem.displayOrder || 1,
                    parentId: selectedItem.parentId,
                    isActive: selectedItem.isActive 
                  })
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


