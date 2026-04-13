# CycleMart — Frontend

Nền tảng mua bán xe đạp thể thao chuyên biệt tại Việt Nam.  
Stack: **React 18 + TypeScript + Vite + Tailwind CSS**

---

## Yêu cầu hệ thống

| Tool | Phiên bản tối thiểu |
|------|---------------------|
| Node.js | 18.x trở lên |
| npm | 9.x trở lên |
| Git | bất kỳ |

Kiểm tra phiên bản hiện tại:
```bash
node -v
npm -v
```

---

## Hướng dẫn cài đặt & chạy local

### 1. Clone repo

```bash
git clone https://github.com/superteen02092003/cyclemart-fe.git
cd cyclemart-fe
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc (copy từ file mẫu):

```bash
cp .env.example .env.local
```

Sau đó mở `.env.local` và điền URL của BE:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> Nếu chưa có file `.env.example`, tạo file `.env.local` thủ công với nội dung trên.

### 4. Chạy dev server

```bash
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

---

## Các lệnh thường dùng

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server (hot reload) |
| `npm run build` | Build production ra thư mục `dist/` |
| `npm run preview` | Preview bản build production local |

---

## Cấu trúc thư mục

```
src/
├── apis/              # axios instance & API call functions
├── assets/            # hình ảnh, icons tĩnh
├── components/
│   ├── ui/            # Button, Badge, Chip (primitives)
│   └── shared/        # TopNavBar, Footer, SearchBar, BikeCard
├── constants/         # ROUTES, CATEGORIES
├── hooks/             # custom React hooks
├── layouts/           # MainLayout, AuthLayout
├── pages/
│   ├── Home/          # Trang chủ (Hero, Featured, Trust...)
│   ├── Browse/        # Trang danh sách xe
│   ├── BikeDetail/    # Trang chi tiết xe
│   ├── Sell/          # Đăng tin bán xe
│   ├── Inspection/    # Kiểm định
│   ├── Community/     # Cộng đồng
│   └── Auth/          # Login, Register
├── providers/         # Context providers
├── routes.tsx         # React Router v6 config
├── schemas/           # zod validation schemas
├── stores/            # Zustand state stores
├── styles/            # index.css (Tailwind + global)
├── types/             # TypeScript interfaces (Bike, User...)
└── utils/             # cn(), formatPrice()
```

---

## Kết nối với Backend (dành cho team BE)

### Base URL

FE gọi API thông qua biến môi trường `VITE_API_BASE_URL`.  
Mặc định trong `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Nếu BE chạy ở port khác hoặc deploy lên server, đổi URL này là FE tự nhận.

### CORS

BE cần allow origin từ:
- `http://localhost:5173` (dev)
- `http://localhost:5174` (fallback nếu 5173 bị chiếm)

### Các endpoint FE sẽ cần (theo PRD)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/auth/register` | Đăng ký tài khoản |
| `POST` | `/auth/login` | Đăng nhập, trả về JWT |
| `GET` | `/bikes` | Danh sách xe (có filter, pagination) |
| `GET` | `/bikes/:id` | Chi tiết một xe |
| `POST` | `/bikes` | Đăng tin bán xe (Seller) |
| `PUT` | `/bikes/:id` | Cập nhật tin đăng |
| `DELETE` | `/bikes/:id` | Xóa tin đăng |
| `GET` | `/categories` | Danh mục loại xe, hãng |
| `POST` | `/offers` | Gửi offer trả giá |
| `GET` | `/users/me` | Thông tin user đang đăng nhập |

> Danh sách đầy đủ sẽ được bổ sung khi có API docs từ BE.

### Auth — JWT

FE sẽ gửi token trong header:
```
Authorization: Bearer <access_token>
```

---

## Môi trường biến (Environment Variables)

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `VITE_API_BASE_URL` | Có | Base URL của Spring Boot BE |

> Tất cả biến môi trường của Vite phải có prefix `VITE_` thì FE mới đọc được.

---

## Lưu ý khi làm việc nhóm

- **Không commit** file `.env.local` (đã có trong `.gitignore`)
- Trước khi push, chạy `npm run build` để đảm bảo không có lỗi TypeScript
- Branch mặc định: `main`
- Tạo branch riêng cho từng feature: `feature/ten-tinh-nang`

---

## Liên hệ

Mọi thắc mắc về FE liên hệ team Frontend qua GitHub Issues hoặc nhóm chat dự án.
