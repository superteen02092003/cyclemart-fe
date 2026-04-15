# 📊 Admin Dashboard Design - CycleMart

## Tổng Quan Hệ Thống Admin

Hệ thống quản trị CycleMart được thiết kế để quản lý các khía cạnh quan trọng của nền tảng giao dịch xe máy và xe đạp.

## 🏗️ Kiến Trúc

### Layout
- **AdminLayout**: Layout chung cho tất cả các trang admin với sidebar navigation
- **AdminSidebar**: Sidebar collapsible với quản lý menu điều hướng

### Thành Phần UI Tái sử dụng
- **StatCard**: Card hiển thị thống kê với icon, giá trị, và thay đổi
- **Table**: Component bảng linh hoạt với cột tùy chỉnh, hành động
- **Modal**: Dialog component cho xem chi tiết, thêm/chỉnh sửa

---

## 📑 Các Trang Admin

### 1. **Dashboard** (`/admin`)
Trang chính admin với nhiều chức năng:

#### Thống kê chính
- Tổng người dùng
- Tin đăng chờ duyệt
- Báo cáo chưa xử lý
- Tổng giao dịch (tháng)

#### Hoạt động gần đây
- Theo dõi các hành động người dùng mới nhất
- Tin đăng mới, báo cáo, giao dịch, cập nhật profil

#### Thao tác nhanh
- Nút lối tắt đến các chức năng chính
- Duyệt tin đăng, xử lý báo cáo, xem thống kê, quản lý danh mục

#### Trạng thái hệ thống
- Kiểm tra tình trạng API Server, Database, Email Service

---

### 2. **Quản lý Người dùng** (`/admin/users`)
Quản lý toàn bộ người dùng (Buyer & Seller)

#### Chức năng
- Lọc theo loại người dùng (Tất cả, Người mua, Người bán)
- Xem thống kê: Tổng người dùng, Hoạt động, Chưa xác thực
- Hiển thị danh sách người dùng chi tiết
- Xem chi tiết người dùng (Modal)

#### Hành động
- **Xem chi tiết**: Hiển thị thông tin người dùng
- **Xác thực**: Xác minh tài khoản người dùng
- **Cấm**: Cấm người dùng vi phạm

#### Cột Bảng
- Tên người dùng
- Email
- Loại (Người bán/Người mua)
- Trạng thái (Hoạt động/Tạm khóa/Cấm)
- Xác thực (Đã xác thực/Chưa xác thực)
- Ngày tạo

---

### 3. **Kiểm duyệt Tin đăng** (`/admin/listings`)
Xem xét và duyệt các tin đăng mới

#### Chức năng
- Lọc theo trạng thái (Chờ duyệt, Đã duyệt, Từ chối)
- Xem thống kê: Chờ duyệt, Đã duyệt, Từ chối

#### Hành động (Chỉ cho tin chờ duyệt)
- **Xem chi tiết**: Hiển thị thông tin tin đăng, hình ảnh
- **Duyệt**: Chấp thuận tin đăng
- **Từ chối**: Từ chối tin đăng

#### Cột Bảng
- Tiêu đề tin đăng
- Người bán
- Danh mục
- Giá
- Trạng thái
- Ngày gửi

#### Modal Chi tiết
- Tiêu đề, Người bán, Danh mục, Giá
- Hiển thị hình ảnh sản phẩm (Grid 3 cột)

---

### 4. **Báo cáo & Tranh chấp** (`/admin/reports`)
Xử lý báo cáo vi phạm và tranh chấp giao dịch

#### Chức năng
- Lọc theo trạng thái (Mở, Giải quyết, Từ chối)
- Xem thống kê: Mở, Giải quyết, Độ ưu tiên cao

#### Hành động (Chỉ cho báo cáo mở)
- **Xem chi tiết**: Xem đầy đủ thông tin báo cáo
- **Giải quyết**: Đánh dấu báo cáo đã giải quyết
- **Từ chối**: Từ chối báo cáo

#### Cột Bảng
- Tiêu đề báo cáo
- Người báo cáo
- Người bị báo cáo
- Lý do
- Độ ưu tiên (Cao/Trung bình/Thấp)
- Trạng thái

#### Modal Chi tiết
- Tiêu đề, Người báo cáo, Người bị báo cáo
- Lý do báo cáo
- Mô tả chi tiết
- Độ ưu tiên, Trạng thái

---

### 5. **Danh mục & Thương hiệu** (`/admin/categories`)
Quản lý danh mục xe và thương hiệu

#### Tabs
- **Danh mục**: Quản lý các danh mục xe
- **Thương hiệu**: Quản lý các thương hiệu

#### Tính năng Danh mục
- **Bảng**: Tên, Slug, Biểu tượng, Số sản phẩm, Trạng thái
- **Hành động**: Chỉnh sửa, Xóa
- **Modal**: Thêm/Chỉnh sửa danh mục
  - Tên danh mục
  - Slug
  - Biểu tượng Emoji

#### Tính năng Thương hiệu
- **Bảng**: Tên, Danh mục, Số sản phẩm, Trạng thái
- **Hành động**: Chỉnh sửa, Xóa
- **Modal**: Thêm/Chỉnh sửa thương hiệu
  - Tên thương hiệu
  - Danh mục (Chọn từ list)

---

### 6. **Giao dịch & Phí dịch vụ** (`/admin/transactions`)
Quản lý giao dịch và cấu hình phí

#### Chức năng
- Lọc giao dịch theo trạng thái
- Thống kê: Tổng giao dịch, Tổng giá trị, Tổng phí, Hoàn tất hôm nay

#### Cấu hình Phí
- Phí giao dịch mặc định (3%)
- Phí rút tiền
- Giảm phí VIP (1.5%)
- Chiết khấu mùa vụ

#### Cột Bảng Giao dịch
- Mã giao dịch
- Người mua, Người bán
- Số tiền
- Phí dịch vụ
- Phương thức thanh toán
- Trạng thái
- Ngày

#### Hành động
- Xem chi tiết
- Hoàn tiền (Nếu chờ xử lý)

#### Biểu đồ
- Doanh thu 30 ngày gần đây (Bar chart)

---

### 7. **Thống kê & Báo cáo** (`/admin/statistics`)
Xem toàn cảnh hiệu suất hệ thống

#### Thống kê Chính
- Tổng người dùng
- Người bán hoạt động
- Tổng tin đăng
- Tổng giao dịch (tháng)

#### Biểu đồ
- **Tăng trưởng người dùng**: 12 tháng
- **Xu hướng giao dịch**: 12 tháng

#### Phân bố Dữ liệu
- **Phân bố theo danh mục**: Xe máy (60%), Xe đạp (25%), Phụ kiện (10%), Khác (5%)
- **Phân bố loại người dùng**: Người mua (55%) vs Người bán (45%)

#### Chỉ số Chính (KPI)
- Tỷ lệ chuyển đổi: 3.2%
- Thời gian bán trung bình: 4.2 ngày
- Mức độ hài lòng: 4.6/5 sao
- Tỷ lệ giao dịch thành công: 98.5%

#### Báo cáo Hiệu suất 30 Ngày
- Lượt xem trung bình/ngày
- Giao dịch/ngày
- Doanh thu/ngày
- Người dùng mới
- Tỷ lệ giữ chân

---

## 🎨 Thiết kế UI/UX

### Color Scheme
- **Primary**: #2563eb (Blue) - Màu chính
- **Success**: #10b981 (Green) - Thành công, duyệt
- **Error**: #ef4444 (Red) - Lỗi, từ chối, cấm
- **Warning**: #f59e0b (Amber) - Cảnh báo, chờ xử lý
- **Background**: #f9fafb (Light Gray) - Nền

### Thành phần
- **StatCard**: Card vuông với thống kê (3x3 hoặc 4x4)
- **Table**: Bảng dữ liệu với border nhẹ, hover effect
- **Modal**: Dialog overlay với shadow
- **Sidebar**: Navigation collapsible với icon + text

### Responsive
- **Desktop**: Grid đầy đủ (4 cột stats, sidebar đầy đủ)
- **Tablet**: Grid 2-3 cột
- **Mobile**: 1 cột, Sidebar thu gọn mặc định

---

## 📁 Cấu trúc File

```
src/
├── layouts/
│   ├── AdminLayout.jsx          # Admin container layout
│   └── MainLayout.jsx
├── components/
│   └── admin/
│       ├── AdminSidebar.jsx     # Navigation sidebar
│       ├── StatCard.jsx         # Statistics card
│       ├── Table.jsx            # Data table
│       └── Modal.jsx            # Modal dialog
├── pages/
│   └── Admin/
│       ├── index.jsx            # Dashboard
│       ├── Users.jsx            # User management
│       ├── Listings.jsx         # Listing review
│       ├── Reports.jsx          # Reports & disputes
│       ├── Categories.jsx       # Categories & brands
│       ├── Transactions.jsx     # Transactions & fees
│       └── Statistics.jsx       # Statistics & reports
└── routes.jsx                   # Router config
```

---

## 🚀 Các Tính năng Nâng cao (Tương lai)

- [ ] Export báo cáo (PDF, Excel)
- [ ] Gửi thông báo/email cho người dùng
- [ ] Lịch sử hành động audit log
- [ ] Phân quyền (Roles & Permissions)
- [ ] Dashboard tùy chỉnh theo role
- [ ] Real-time notifications
- [ ] API integration cho dữ liệu động
- [ ] Dark mode support

---

## 🔐 Bảo mật

- [ ] Yêu cầu đăng nhập admin
- [ ] Verify admin token trước mỗi request
- [ ] Audit log cho mọi hành động
- [ ] Rate limiting
- [ ] Session timeout

---

## 📝 Mock Data

Các trang hiện tại sử dụng mock data cứng. Cần thay thế bằng:
- API calls (`/api/admin/users`, `/api/admin/listings`, etc.)
- Redux/Zustand store cho state management
- React Query cho caching

---

## ✅ Checklist Hoàn tất

- [x] AdminLayout & Sidebar
- [x] Reusable UI Components (StatCard, Table, Modal)
- [x] Dashboard page
- [x] User Management
- [x] Listing Review
- [x] Reports & Disputes
- [x] Categories & Brands management
- [x] Transactions & Fees
- [x] Statistics & Reports
- [x] Routes configuration
- [ ] API Integration
- [ ] Authentication & Authorization
- [ ] Mobile responsiveness test
- [ ] Performance optimization
