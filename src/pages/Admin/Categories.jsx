import { useState } from 'react'
import { Table } from '@/components/admin/Table'
import { Modal } from '@/components/admin/Modal'

const CATEGORIES_DATA = [
  {
    id: 1,
    name: 'Xe máy',
    slug: 'xe-may',
    icon: '🏍️',
    itemCount: 1250,
    status: 'active',
  },
  {
    id: 2,
    name: 'Xe đạp',
    slug: 'xe-dap',
    icon: '🚴',
    itemCount: 340,
    status: 'active',
  },
  {
    id: 3,
    name: 'Phụ kiện xe',
    slug: 'phu-kien-xe',
    icon: '🔧',
    itemCount: 890,
    status: 'active',
  },
]

const BRANDS_DATA = [
  { id: 1, name: 'Honda', category: 'Xe máy', productCount: 450, status: 'active' },
  { id: 2, name: 'Yamaha', category: 'Xe máy', productCount: 380, status: 'active' },
  { id: 3, name: 'Trek', category: 'Xe đạp', productCount: 120, status: 'active' },
  { id: 4, name: 'Giant', category: 'Xe đạp', productCount: 95, status: 'active' },
]

export default function AdminCategories() {
  const [categories, setCategories] = useState(CATEGORIES_DATA)
  const [brands, setBrands] = useState(BRANDS_DATA)
  const [activeTab, setActiveTab] = useState('categories')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const categoryColumns = [
    { key: 'icon', label: 'Biểu tượng', width: '60px' },
    { key: 'name', label: 'Tên danh mục', width: '150px' },
    { key: 'slug', label: 'Slug', width: '150px' },
    { key: 'itemCount', label: 'Số sản phẩm', width: '120px' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
          {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
  ]

  const brandColumns = [
    { key: 'name', label: 'Tên thương hiệu', width: '150px' },
    { key: 'category', label: 'Danh mục', width: '150px' },
    { key: 'productCount', label: 'Số sản phẩm', width: '120px' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
          {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
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
              onClick={() => setIsCategoryModalOpen(true)}
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
                key="edit"
                onClick={() => {
                  setSelectedItem(item)
                  setIsCategoryModalOpen(true)
                }}
                className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
              >
                Chỉnh sửa
              </button>,
              <button
                key="delete"
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
              onClick={() => setIsBrandModalOpen(true)}
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
                  setIsBrandModalOpen(true)
                }}
                className="px-3 py-2 text-sm font-medium text-content-primary hover:bg-navy/10 rounded-sm transition-colors"
              >
                Chỉnh sửa
              </button>,
              <button
                key="delete"
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
        }}
        title={selectedItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Tên danh mục</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập tên danh mục"
              defaultValue={selectedItem?.name}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Slug</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập slug (ví dụ: xe-may)"
              defaultValue={selectedItem?.slug}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Biểu tượng Emoji</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Chọn emoji"
              defaultValue={selectedItem?.icon}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCategoryModalOpen(false)
                setSelectedItem(null)
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
        }}
        title={selectedItem ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Tên thương hiệu</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50"
              placeholder="Nhập tên thương hiệu"
              defaultValue={selectedItem?.name}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-content-primary block mb-1">Danh mục</label>
            <select className="w-full px-4 py-2 border border-border-light rounded-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-navy/50">
              <option>Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-navy text-white rounded-sm font-medium hover:opacity-90 transition-opacity"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBrandModalOpen(false)
                setSelectedItem(null)
              }}
              className="flex-1 px-4 py-2 border border-border-light text-content-primary rounded-sm font-medium hover:bg-surface-tertiary transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}





