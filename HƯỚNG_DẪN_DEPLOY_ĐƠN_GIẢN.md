# 🚀 HƯỚNG DẪN DEPLOY ĐƠN GIẢN - CHỈ 2 BƯỚC

## 📦 Files cần upload (có sẵn trong thư mục project):

```
C:\dev\alkanacoating\
├── alkana-coating.zip    ← 103MB - Package đầy đủ
└── deploy.php            ← Script tự động deploy
```

---

## ✅ BƯỚC 1: UPLOAD 2 FILES LÊN HOST

### Via FTP (FileZilla, WinSCP):

1. **Kết nối FTP** đến host của bạn
2. **Vào thư mục root** (thường là `/public_html/` hoặc `/hotriluan.xyz/`)
3. **Xóa tất cả files cũ** (nếu có) - Quan trọng!
4. **Upload 2 files:**
   - `alkana-coating.zip` (103MB - có thể mất 5-10 phút)
   - `deploy.php`

### Via cPanel File Manager:

1. **Đăng nhập cPanel** → File Manager
2. **Vào thư mục** `public_html` hoặc `hotriluan.xyz`
3. **Xóa files cũ** (Select All → Delete)
4. **Click Upload** → Chọn 2 files:
   - `alkana-coating.zip`
   - `deploy.php`
5. **Đợi upload hoàn tất** (thanh progress 100%)

### Kết quả sau upload:

```
/hotriluan.xyz/           (hoặc /public_html/)
├── alkana-coating.zip    ✓ Uploaded
└── deploy.php            ✓ Uploaded
```

**⚠️ QUAN TRỌNG:**
- **KHÔNG giải nén file zip thủ công!**
- **KHÔNG click "Extract" trong File Manager!**
- Deploy.php sẽ tự động làm mọi thứ

---

## ✅ BƯỚC 2: CHẠY DEPLOY.PHP

### Truy cập URL:

```
https://hotriluan.xyz/deploy.php
```

### Wizard sẽ hướng dẫn qua các bước:

#### **Bước 1: Upload/Detect Zip**
- ✓ Script tự động phát hiện `alkana-coating.zip`
- Click "Next" để tiếp tục

#### **Bước 2: Extract**
- ✓ Script tự động giải nén toàn bộ nội dung
- ✓ Tạo cấu trúc thư mục
- Click "Next"

#### **Bước 3: Publish**
- ✓ Move frontend files ra root
- ✓ Giữ backend trong thư mục backend/
- ✓ **GIỮ uploads trong backend/public/uploads**
- Click "Next"

#### **Bước 4: Database Config**
Điền thông tin database:
- **Database Host:** `localhost` (thường là vậy)
- **Database Name:** `alkanacoating` (hoặc tên bạn đã tạo)
- **Database User:** username từ cPanel
- **Database Password:** password từ cPanel
- Click "Test Connection" → Nếu OK → "Next"

#### **Bước 5: Site Config**
- **Site URL:** `https://hotriluan.xyz`
- **Admin Email:** email@cuaban.com
- **Admin Password:** tạo password mạnh
- ✓ **Check:** Import sample data (khuyến nghị)
- Click "Save"

#### **Bước 6: Migrate**
- Click "Bắt đầu cài đặt"
- Đợi import database và chạy migrations

#### **Bước 7: Complete!**
- ✓ Website đã sẵn sàng!

---

## 🔧 SAU KHI DEPLOY XONG

### 1. Fix Upload Permissions (Quan trọng!)

**Via SSH hoặc cPanel Terminal:**
```bash
cd /path/to/hotriluan.xyz
php backend/scripts/fix_upload_permissions.php
```

**Output mong đợi:**
```
=== Fixing Upload Directory Permissions ===

✓ Exists: uploads
✓ Writable
✓ Exists: uploads/settings
✓ Writable
...
✓ Done!
```

**Hoặc via File Manager:**
- Chuột phải `backend/public/uploads` → Change Permissions → 755
- Check "Apply to subdirectories"

### 2. Tạo file .env (nếu chưa có)

**Via File Manager:**
```
backend/.env
```

**Nội dung tối thiểu:**
```env
APP_NAME=AlkanaCoating
APP_ENV=production
APP_KEY=base64:xxxxx  # Deploy.php đã tạo
APP_DEBUG=false
APP_URL=https://hotriluan.xyz

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=alkanacoating
DB_USERNAME=your_username
DB_PASSWORD=your_password

FILESYSTEM_DISK=local
LOG_LEVEL=error
```

### 3. Clear Cache (nếu cần)

**Via Terminal:**
```bash
cd backend
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### 4. Xóa files deploy (bảo mật)

**Sau khi mọi thứ hoạt động OK:**
```bash
rm deploy.php
rm alkana-coating.zip  # Nếu còn
```

---

## ✅ KIỂM TRA THÀNH CÔNG

### Test các URL sau:

1. **Frontend:** `https://hotriluan.xyz`
   - ✓ Trang chủ hiển thị
   - ✓ Menu hoạt động
   - ✓ Hình ảnh load được

2. **API:** `https://hotriluan.xyz/api/categories`
   - ✓ Trả về JSON data
   - ✓ Không có lỗi 500

3. **Admin:** `https://hotriluan.xyz/admin`
   - ✓ Trang login hiển thị
   - ✓ Đăng nhập với email/password đã tạo
   - ✓ Dashboard hiển thị

4. **Upload Test:** Admin → Cài đặt → Upload logo
   - ✓ Chọn file → Upload thành công
   - ✓ Hình ảnh hiển thị

---

## 🆘 NẾU CÓ VẤN ĐỀ

### Lỗi: "File alkana-coating.zip not found"
**Nguyên nhân:** Upload chưa xong hoặc sai thư mục
**Fix:** Kiểm tra file có trong cùng thư mục với deploy.php

### Lỗi: "Failed to extract"
**Nguyên nhân:** Permissions hoặc PHP ZipArchive không enable
**Fix:** 
```bash
chmod 755 alkana-coating.zip
```
Hoặc enable ZipArchive trong cPanel → Select PHP Version

### Lỗi: "Database connection failed"
**Nguyên nhân:** Thông tin DB sai
**Fix:** 
1. Kiểm tra lại username/password
2. Đảm bảo database đã tạo trong cPanel → MySQL Databases
3. User đã được assign vào database

### Lỗi 500 sau deploy
**Nguyên nhân:** Thiếu file .env hoặc vendor
**Fix:** 
1. Xem logs: `backend/storage/logs/laravel.log`
2. Đảm bảo folder `backend/vendor` tồn tại (đã có trong zip)
3. Tạo file `.env` (xem mục 2 ở trên)

### Upload hình ảnh bị lỗi
**Nguyên nhân:** Permissions
**Fix:** 
```bash
php backend/scripts/fix_upload_permissions.php
chmod -R 755 backend/public/uploads
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, cung cấp:
1. Screenshot lỗi từ browser (F12 → Console)
2. Laravel log: `backend/storage/logs/laravel.log` (50 dòng cuối)
3. URL đang test
4. Output của: `ls -la` trong thư mục root

---

## 🎉 TỔNG KẾT

**QUY TRÌNH ĐƠN GIẢN:**

1. ✅ Upload 2 files: `alkana-coating.zip` + `deploy.php`
2. ✅ Truy cập: `https://hotriluan.xyz/deploy.php`
3. ✅ Làm theo wizard
4. ✅ Fix permissions
5. ✅ Test website
6. ✅ Xong! 🎊

**THỜI GIAN:** 10-15 phút (phụ thuộc vào tốc độ upload)

**NO MANUAL EXTRACT NEEDED!** 🚀
