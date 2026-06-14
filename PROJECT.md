# 🏨 Hotel Booking Web — Mô tả dự án

> Assignment môn **FER (Front-End with React)** — Mã sinh viên: **HE180712**

Ứng dụng web đặt phòng khách sạn xây dựng bằng **React 19 + Vite**, sử dụng **json-server** đọc dữ liệu từ `database.json` làm fake REST API. Hệ thống hỗ trợ **3 vai trò người dùng** với phân quyền rõ ràng.

---

## 1. 🎯 Mục tiêu

Xây dựng một nền tảng đặt phòng khách sạn nhiều chi nhánh (multi-hotel), nơi:
- **Khách hàng** tìm kiếm, xem và đặt phòng kèm dịch vụ.
- **Quản lý khách sạn (manager)** tự quản lý khách sạn, phòng và dịch vụ của mình.
- **Quản trị viên (admin)** giám sát và điều hành toàn bộ hệ thống.

---

## 2. 👥 Vai trò & phân quyền

| Vai trò | Quyền hạn |
|---------|-----------|
| **Admin** | Quản lý **tài khoản** (users/managers) & **khách sạn** toàn hệ thống. Khóa/mở tài khoản. Xem biểu đồ tổng quan (người dùng, khách sạn). *Phòng / dịch vụ / booking do manager phụ trách.* |
| **Manager** | CRUD **phòng & dịch vụ** của hotel mình sở hữu (`ownerId`), xem & duyệt **booking** (khách theo từng phòng), theo dõi **doanh thu** (biểu đồ theo tháng & tuần). |
| **User** | Duyệt hotel/phòng, tìm kiếm & lọc, đặt phòng kèm dịch vụ, xem & hủy booking của bản thân. |

> ⚠️ json-server không kiểm tra phân quyền ở backend. Việc chặn quyền được thực hiện ở **phía React** (`ProtectedRoute` + lọc dữ liệu theo `ownerId` / `userId`).

### 🔑 Tài khoản mẫu

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `manager1` | `manager123` | manager (sở hữu Hotel #1, #2) |
| `manager2` | `manager123` | manager (sở hữu Hotel #3) |
| `user` | `user123` | user |
| `tranthib` | `123456` | user |

---

## 3. ⚙️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19 + Vite |
| Fake backend | json-server (`database.json`) |
| Gọi API | axios |
| Định tuyến | react-router-dom v6 |
| Giao diện | react-bootstrap + bootstrap |
| Quản lý đăng nhập | Context API + localStorage |
| Thông báo | react-toastify |

---

## 4. 🗄️ Mô hình dữ liệu (`db/database.json`)

```jsonc
{
  "users":    [{ id, username, password, fullName, email, phone, role, status }],
  "hotels":   [{ id, name, ownerId, address, city, image, description, rating, status }],
  "rooms":    [{ id, hotelId, name, type, price, image, description,
                 capacity, bedType, size, available, amenities[] }],
  "services": [{ id, hotelId, name, price, image, description, available }],
  "bookings": [{ id, userId, hotelId, roomId, serviceIds[], checkIn, checkOut,
                 guests, nights, totalPrice, status, createdAt }]
}
```

**Quan hệ:**
- `hotels.ownerId` → `users.id` (manager sở hữu hotel)
- `rooms.hotelId` / `services.hotelId` → `hotels.id`
- `bookings.userId` → `users.id`, `bookings.roomId` → `rooms.id`, `bookings.serviceIds[]` → `services.id`

**Trạng thái booking:** `pending` → `confirmed` → `checked_in` → `checked_out`
- `pending` → `rejected` (manager từ chối) · `pending`/`confirmed` → `cancelled` (hủy / hoàn tiền)
- Yêu cầu hoàn tiền: `booking.cancelRequest` + `booking.refundStatus` (`requested` → `refunded` / `denied`)

---

## 5. 🧩 Chức năng chính

### Khách hàng (User)
- 🏠 Trang chủ: danh sách hotel & phòng nổi bật
- 🔍 Tìm kiếm theo thành phố/tên, lọc theo loại phòng & khoảng giá
- 🛏️ Xem chi tiết phòng (tiện nghi, dịch vụ kèm theo)
- 📅 Đặt phòng: chọn ngày nhận/trả, số khách, dịch vụ → tự tính tổng tiền
- 📜 Lịch sử booking: xem và hủy đặt phòng
- 🔐 Đăng ký / Đăng nhập

### Manager
- 🛏️ CRUD phòng theo hotel mình sở hữu
- 🛎️ CRUD dịch vụ theo hotel
- 📋 Xem & duyệt (confirm/cancel) booking — khách theo từng phòng
- 📊 Doanh thu: biểu đồ theo **tháng** & theo **tuần**, doanh thu theo từng khách sạn

### Admin
- 👤 CRUD tài khoản (thêm/sửa/xóa), khóa/mở, phân vai trò
- 🏨 Quản lý toàn bộ khách sạn (CRUD, gán chủ sở hữu)
- 📊 Tổng quan hệ thống: biểu đồ **người dùng theo vai trò** & **khách sạn theo thành phố**

---

## 6. 📁 Cấu trúc thư mục (dự kiến)

Cấu trúc phẳng, đơn giản — gom theo loại file:

```
src/
├── services/         # axiosClient + authService, hotelService, roomService...
├── context/          # AuthContext.jsx (đăng nhập/đăng xuất, lưu user + role)
├── components/        # Navbar, Footer, ProtectedRoute, Reveal (+ .css đi kèm)
├── pages/            # HomePage, LoginPage, RegisterPage... (+ Home.css, Auth.css)
├── utils/            # format.js (tiện ích, vd định dạng tiền VND)
├── App.jsx           # khai báo toàn bộ route
└── main.jsx          # BrowserRouter + AuthProvider + ToastContainer
```

---

## 7. 🚀 Cài đặt & chạy

```bash
# 1. Cài dependencies
npm install

# 2. Chạy fake backend (json-server) — cổng 9999
npm run server

# 3. Chạy frontend (Vite) — cổng 5173
npm run dev
```

| Dịch vụ | Địa chỉ |
|---------|---------|
| Frontend (Vite) | http://localhost:5173 |
| API (json-server) | http://localhost:9999 |

**Một số endpoint:**
- `GET /hotels`, `GET /rooms?hotelId=1`, `GET /services?hotelId=1`
- `GET /bookings?userId=4`, `POST /bookings`, `PATCH /bookings/1`
- `GET /users?username=admin&password=admin123` (đăng nhập)

---

## 8. ✅ Trạng thái tiến độ

- [x] Thiết kế `database.json` (3 role, hotels, rooms, services, bookings)
- [x] Tài liệu mô tả dự án
- [x] Cài đặt dependencies & script json-server (`npm run server`)
- [x] Setup axios, router, react-bootstrap, AuthContext
- [x] Đăng nhập / Đăng ký (giao diện Hotel Luxury + nối API json-server)
- [ ] Chức năng User (duyệt, đặt phòng)
- [x] Trang Manager (phòng, dịch vụ, booking, doanh thu — biểu đồ tháng/tuần, phạm vi hotel sở hữu)
- [x] Trang Admin (tài khoản, khách sạn + biểu đồ người dùng & khách sạn)
