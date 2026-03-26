# API Documentation

Ngày cập nhật: 2026-03-26
Base URL: Gọi qua `useApi<T>(endpoint)` hook

---

## 🔐 Authentication
### POST `/api/auth/login`
Đăng nhập vào hệ thống
- **Response**: Trả về `User` và `Token`. Token được lưu offline ở `localStorage`.

---

## 👥 Users & CRM
### CRUD `/users`
Quản lý người dùng, nhân sự và tài khoản, phân quyền (Role: Admin, Director, User..).

### CRUD `/partners`
Quản lý danh sách đối tác / công ty.

### CRUD `/contacts`
Người dùng hoặc khách hàng gửi liên hệ.

---

## 🏗 Projects Management
### CRUD `/projects`
Quản lý tổng quan dự án.

### GET, POST `/constructions` và `/constructions/categories`
Quản lý các danh mục và hạng mục thi công.

---

## 🛒 E-commerce & Products
### CRUD `/products`
Thông số, giá cả, và cấu hình sản phẩm.

### CRUD `/categories`
Danh mục sản phẩm.

### CRUD `/orders`
Giao dịch mua bán và theo dõi đơn hàng.

### CRUD `/cart`
Giỏ hàng người dùng.

### CRUD `/reviews`
Đánh giá sản phẩm.

---

## 👔 HR Management
### CRUD `/attendance`
Chấm công nhân viên.

### CRUD `/salary/employees`
Lương và hồ sơ phúc lợi.

### CRUD `/advance-requests`
Yêu cầu cấp phát / tạm ứng phí (Hỗ trợ upload hình có `keepImageIds`).

---

## 🔔 Utilities
### CRUD `/notifications`
Thông báo task (TaskNotification).

### CRUD `/chat/groups`
Hệ thống tin nhắn làm việc nhóm.

### CRUD `/upload`
Upload dữ liệu, media chung.
