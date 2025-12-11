# Hướng dẫn quản lý User - Admin Panel

## Tổng quan

Hệ thống quản lý user cho phép admin tạo, sửa, xóa tài khoản đăng nhập vào admin panel với các vai trò và quyền hạn khác nhau.

## Các vai trò (Roles)

### 1. Admin (Quản trị viên)
- **Quyền hạn:** Toàn quyền trên hệ thống
- **Có thể:**
  - Quản lý tất cả nội dung
  - Thêm/sửa/xóa user
  - Thay đổi cài đặt hệ thống
  - Truy cập tất cả tính năng

### 2. Editor (Biên tập viên)
- **Quyền hạn:** Xem và chỉnh sửa nội dung
- **Có thể:**
  - Thêm/sửa/xóa sản phẩm, bài viết, dự án
  - Quản lý danh mục
  - Xem báo cáo

### 3. Viewer (Người xem)
- **Quyền hạn:** Chỉ xem
- **Có thể:**
  - Xem danh sách sản phẩm, bài viết, dự án
  - Xem báo cáo
- **Không thể:**
  - Chỉnh sửa hoặc xóa bất kỳ nội dung nào

## Trạng thái (Status)

- **Active (Hoạt động):** User có thể đăng nhập và sử dụng hệ thống
- **Inactive (Không hoạt động):** User bị vô hiệu hóa, không thể đăng nhập

## Cách sử dụng

### Thêm User mới

1. Vào **Admin Panel** → **👤 Quản lý User**
2. Click nút **➕ Thêm User**
3. Điền thông tin:
   - **Tên:** Tên đầy đủ của user
   - **Email:** Email đăng nhập (phải unique)
   - **Mật khẩu:** Tối thiểu 6 ký tự
   - **Vai trò:** Chọn Admin/Editor/Viewer
   - **Trạng thái:** Active/Inactive
4. Click **➕ Tạo mới**

### Chỉnh sửa User

1. Tìm user trong danh sách
2. Click **✏️ Sửa**
3. Cập nhật thông tin cần thiết
4. **Lưu ý:** 
   - Để trống mật khẩu nếu không muốn thay đổi
   - Email phải unique (không trùng với user khác)
5. Click **💾 Cập nhật**

### Xóa User

1. Click **🗑️ Xóa** ở user cần xóa
2. Xác nhận xóa
3. **Lưu ý:** Không thể xóa tài khoản của chính mình

### Tìm kiếm và Lọc

**Tìm kiếm:**
- Nhập tên hoặc email vào ô tìm kiếm
- Kết quả hiển thị real-time

**Lọc theo Vai trò:**
- Chọn Admin/Editor/Viewer để lọc
- Chọn "Tất cả" để hiển thị tất cả

**Lọc theo Trạng thái:**
- Chọn Hoạt động/Không hoạt động
- Chọn "Tất cả" để hiển thị tất cả

## Thống kê

Dashboard hiển thị:
- **Tổng số user:** Tổng tài khoản trong hệ thống
- **Đang hoạt động:** Số user có status = active
- **Admin:** Số lượng admin
- **Editor:** Số lượng editor
- **Viewer:** Số lượng viewer

## Bảo mật

### Mật khẩu
- Mật khẩu được mã hóa bằng bcrypt
- Tối thiểu 6 ký tự (khuyến nghị 8+ ký tự)
- Nên dùng kết hợp chữ, số, ký tự đặc biệt

### Phân quyền
- Chỉ Admin mới có quyền quản lý user
- User không thể xóa tài khoản của chính mình
- Email phải unique

## Cấu trúc Database

### Bảng: `users`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | ID tự động tăng |
| name | string | Tên user |
| email | string | Email đăng nhập (unique) |
| password | string | Mật khẩu đã mã hóa |
| role | enum | admin, editor, viewer |
| status | enum | active, inactive |
| created_at | timestamp | Ngày tạo |
| updated_at | timestamp | Ngày cập nhật |

## API Endpoints

### Admin Routes (cần auth)

```
GET    /api/admin/users           # Danh sách users (có search, filter, pagination)
POST   /api/admin/users           # Tạo user mới
GET    /api/admin/users/stats     # Thống kê users
GET    /api/admin/users/{id}      # Chi tiết 1 user
PUT    /api/admin/users/{id}      # Cập nhật user
DELETE /api/admin/users/{id}      # Xóa user
```

### Query Parameters

**GET /api/admin/users:**
- `search`: Tìm theo tên hoặc email
- `role`: Lọc theo vai trò (admin/editor/viewer)
- `status`: Lọc theo trạng thái (active/inactive)
- `sort_by`: Sắp xếp theo field (default: created_at)
- `sort_order`: Thứ tự sắp xếp (asc/desc, default: desc)
- `per_page`: Số items mỗi trang (default: 15)

### Request Body Examples

**POST /api/admin/users:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "role": "editor",
  "status": "active"
}
```

**PUT /api/admin/users/{id}:**
```json
{
  "name": "Nguyễn Văn A Updated",
  "email": "newemail@example.com",
  "password": "newpassword",
  "role": "admin",
  "status": "active"
}
```
*Lưu ý: Có thể gửi chỉ 1 số fields cần update*

## Validation Rules

### Tạo mới:
- `name`: required, string, max 255 ký tự
- `email`: required, email format, unique, max 255 ký tự
- `password`: required, min 6 ký tự
- `role`: required, phải là: admin/editor/viewer
- `status`: required, phải là: active/inactive

### Cập nhật:
- Tương tự như tạo mới nhưng tất cả fields là optional
- `email` phải unique (trừ email của chính user đó)
- `password` có thể bỏ trống (giữ nguyên password cũ)

## Error Responses

### 422 Validation Error:
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

### 403 Forbidden:
```json
{
  "message": "You cannot delete your own account"
}
```

### 404 Not Found:
```json
{
  "message": "User not found"
}
```

### 500 Server Error:
```json
{
  "message": "Error creating user",
  "error": "Database connection failed"
}
```

## Files đã được tạo/sửa

### Backend:
1. **Migration:** `2025_11_04_062542_add_role_and_status_to_users_table.php`
2. **Model:** `app/Models/User.php` - Thêm role, status, methods
3. **Controller:** `app/Http/Controllers/Admin/UserController.php`
4. **Routes:** `routes/api.php` - Thêm user management routes

### Frontend:
1. **Component:** `frontend/src/admin/pages/UserManagement.jsx`
2. **Routes:** `frontend/src/admin/AdminRoutes.jsx`
3. **Sidebar:** `frontend/src/admin/components/AdminSidebar.jsx`

## Best Practices

1. **Đổi mật khẩu định kỳ:** Khuyến khích admin đổi mật khẩu 3-6 tháng/lần
2. **Phân quyền hợp lý:** Chỉ cấp quyền admin cho người thực sự cần
3. **Vô hiệu hóa thay vì xóa:** Nếu tạm thời không dùng, set status = inactive
4. **Email phục hồi:** Đảm bảo email là chính xác để có thể reset password
5. **Kiểm tra log:** Định kỳ xem log đăng nhập để phát hiện bất thường

## Troubleshooting

### Không thể đăng nhập:
- Kiểm tra status phải là "active"
- Kiểm tra email và password có đúng không
- Xóa cache trình duyệt và thử lại

### Lỗi "Email đã tồn tại":
- Email phải unique, chọn email khác
- Hoặc cập nhật user cũ thay vì tạo mới

### Không thấy menu User Management:
- Chỉ user có role = "admin" mới thấy menu này
- Kiểm tra role của user đang đăng nhập

---

**Hoàn thành!** Hệ thống quản lý user đã sẵn sàng sử dụng. 👤✅
