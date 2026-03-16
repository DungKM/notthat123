# Hệ thống Routing - Cấu trúc Toàn diện

## 📁 Cấu trúc Routes Mới

Hiện tại hệ thống được chia làm 2 khu vực chính:
1.  **Public Showcase (`/`)**: Giao diện trưng bày cho khách hàng.
2.  **Admin Area (`/admin`)**: Khu vực quản lý nội bộ cho tất cả các role.

### File cấu hình
- `src/routes.ts` - Định nghĩa constants cho tất cả các đường dẫn.
- `src/app/router/router.tsx` - Cấu hình React Router với cấu trúc lồng nhau (Nested Routes).
- `src/components/guards/` - Chứa các logic bảo vệ route (`AuthGuard`, `RoleGuard`).

## 🛣️ Danh sách Routes

| Khu vực | Path | Quyền truy cập | Mô tả |
|-------|------|----------------|-------|
| **Public** | `/` | Tự do | Trang chủ trưng bày |
| **Public** | `/products` | Tự do | Danh sách sản phẩm |
| **Auth** | `/login` | Tự do | Đăng nhập hệ thống |
| **Admin** | `/admin/dashboard` | `DIRECTOR` | Bảng điều khiển admin |
| **Admin** | `/admin/projects` | `DIRECTOR` | Quản lý dự án tổng quát |
| **Admin** | `/admin/accounting/*`| `ACCOUNTANT` | Toàn bộ trang kế toán |
| **Admin** | `/admin/sales/*` | `SALES` | Toàn bộ trang kinh doanh |
| **Admin** | `/admin/staff/*` | `STAFF` | Khu vực nhân viên |
| **Admin** | `/admin/site/*` | `SITE_MANAGER` | Quản lý tại công trình |

## 🔐 Logic Phân quyền

Hệ thống sử dụng Nested Routes kết hợp với Guards:

```tsx
<Route path="/admin" element={<AuthGuard><Outlet /></AuthGuard>}>
  <Route path="accounting/*" element={<RoleGuard roles={[Role.ACCOUNTANT]}><AccountingLayout>...</AccountingLayout></RoleGuard>} />
  {/* ... các role khác */}
</Route>
```

## 🚀 Lợi ích
1.  **Phân tách rõ ràng**: Tách biệt hoàn toàn giao diện bán hàng bên ngoài và quản lý bên trong.
2.  **Tổ chức theo Prefix**: Mọi trang nội bộ đều bắt đầu bằng `/admin`, dễ dàng quản lý cookie, auth và tracking.
3.  **Dễ mở rộng**: Thêm role mới hoặc trang public mới chỉ cần thêm vào config mà không phá vỡ cấu trúc cũ.
