# HƯỚNG DẪN FIX LỖI 500 - TRIỂN KHAI LẠI

## ⚠️ LỖI HIỆN TẠI
- API trả về 500 Internal Server Error
- Tất cả endpoints đều fail (/api/categories, /api/sliders, etc.)

## 🔍 NGUYÊN NHÂN
1. ✅ **Thiếu vendor** - ĐÃ FIX (package mới đã include vendor)
2. ❓ File `.env` chưa config đúng
3. ❓ Database chưa có dữ liệu
4. ❓ PHP extensions thiếu
5. ❓ Permissions không đúng

## 🚀 GIẢI PHÁP - TRIỂN KHAI LẠI

### Bước 1: Backup dữ liệu hiện tại (nếu có)

**Via cPanel → phpMyAdmin:**
1. Select database `alkanacoating`
2. Export → SQL format → Download

**Via SSH:**
```bash
mysqldump -u username -p alkanacoating > backup_$(date +%Y%m%d).sql
```

### Bước 2: Xóa toàn bộ files cũ

**Via cPanel File Manager:**
1. Vào `/hotriluan.xyz/` hoặc `/public_html/`
2. Xóa hết tất cả files (trừ `.htaccess` nếu cần giữ)
3. Đặc biệt xóa:
   - `backend/` folder cũ
   - `index.php` cũ
   - `assets/` cũ

**Via SSH:**
```bash
cd /path/to/hotriluan.xyz
rm -rf backend/ index.php assets/ storage/
# Giữ lại: .htaccess, .well-known
```

### Bước 3: Upload package MỚI

**File cần upload:** 
- `alkana-coating.zip` (103MB) 
- `deploy.php` (từ trong zip hoặc từ project root)

**Via FTP/cPanel File Manager:**
1. Xóa toàn bộ files cũ trong `/hotriluan.xyz/` (hoặc `/public_html/`)
2. Upload `alkana-coating.zip` vào thư mục root
3. Upload `deploy.php` vào thư mục root (cùng cấp với zip)

**Cấu trúc sau khi upload:**
```
/hotriluan.xyz/
├── alkana-coating.zip    ← File zip
└── deploy.php            ← Script deploy
```

**⚠️ QUAN TRỌNG:** 
- Chỉ upload 2 files này, KHÔNG extract thủ công!
- Deploy.php sẽ tự động extract zip file

### Bước 4: Chạy deploy.php (Tự động extract)

**Truy cập:** `https://hotriluan.xyz/deploy.php`

Deploy.php sẽ tự động:
1. ✅ Phát hiện file `alkana-coating.zip`
2. ✅ Extract toàn bộ nội dung
3. ✅ Move files vào đúng vị trí
4. ✅ Setup backend và frontend

**Điền thông tin:**
- Database Host: `localhost` (hoặc host từ cPanel)
- Database Name: `alkanacoating` (hoặc tên khác)
- Database User: `username từ cPanel`
- Database Pass: `password từ cPanel`
- Site URL: `https://hotriluan.xyz`
- Admin Email: email của bạn
- Admin Password: tạo password mạnh
- ✅ Check: Import sample data (khuyến nghị)

**Click:** "Bắt đầu cài đặt"

### Bước 5: Tạo file .env

**Via SSH hoặc File Manager:**

```bash
cd /path/to/hotriluan.xyz/backend
cp .env.example .env
nano .env
```

**Nội dung .env cần thiết:**
```env
APP_NAME=AlkanaCoating
APP_ENV=production
APP_KEY=base64:XXXXX  # Deploy.php sẽ tự generate
APP_DEBUG=false
APP_URL=https://hotriluan.xyz

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=alkanacoating
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_pass

LOG_CHANNEL=stack
LOG_LEVEL=error

FILESYSTEM_DISK=local

# Email settings (optional)
MAIL_MAILER=smtp
MAIL_HOST=mail.hotriluan.xyz
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=info@hotriluan.xyz
```

### Bước 6: Set Permissions

**Via SSH:**
```bash
cd /path/to/hotriluan.xyz

# Backend permissions
chmod -R 755 backend/
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
chmod -R 755 backend/public/uploads

# Set ownership
chown -R www-data:www-data backend/
# Hoặc trên shared hosting:
chown -R username:username backend/
```

**Via cPanel File Manager:**
1. Click chuột phải `backend/storage` → Permissions → 775
2. Click chuột phải `backend/bootstrap/cache` → Permissions → 775
3. Click chuột phải `backend/public/uploads` → Permissions → 755
4. Check "Apply to subdirectories"

### Bước 7: Fix Upload Permissions

**Via SSH:**
```bash
cd /path/to/hotriluan.xyz
php backend/scripts/fix_upload_permissions.php
```

**Output mong đợi:**
```
=== Fixing Upload Directory Permissions ===

✓ Created: uploads/settings
✓ Created: uploads/posts
...
✓ Done!
```

### Bước 8: Kiểm tra PHP Requirements

**Via SSH:**
```bash
php -m | grep -E "pdo|mysql|mbstring|xml|curl|zip|gd"
```

**Cần có:**
- PDO
- pdo_mysql
- mbstring
- xml
- curl
- zip
- gd (hoặc imagick)
- fileinfo

**Nếu thiếu, enable via cPanel → Select PHP Version**

### Bước 9: Clear Cache & Optimize

**Via SSH:**
```bash
cd /path/to/hotriluan.xyz/backend

# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Bước 10: Test API

**Via Browser Console:**
```javascript
// Open https://hotriluan.xyz
// Press F12 → Console
fetch('/api/categories').then(r => r.json()).then(console.log)
```

**Expected output:**
```json
{
  "categories": [...]
}
```

**Via curl:**
```bash
curl https://hotriluan.xyz/api/categories
```

## 🔧 DEBUG NẾU VẪN LỖI 500

### 1. Kiểm tra Laravel logs

**Via SSH:**
```bash
tail -100 /path/to/hotriluan.xyz/backend/storage/logs/laravel.log
```

**Via File Manager:**
Mở `backend/storage/logs/laravel.log` → Xem dòng cuối

**Các lỗi thường gặp:**

#### Lỗi: "No application encryption key"
```bash
cd backend
php artisan key:generate
```

#### Lỗi: "SQLSTATE[HY000] [1045] Access denied"
→ Check lại database credentials trong `.env`

#### Lỗi: "Class 'XXX' not found"
→ Vendor bị lỗi, run:
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

#### Lỗi: "Permission denied"
→ Fix permissions (xem Bước 6)

### 2. Enable Debug Mode (TEMPORARY)

**Edit `.env`:**
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Reload trang → Xem error message chi tiết**

**⚠️ QUAN TRỌNG:** Tắt debug mode sau khi fix:
```env
APP_DEBUG=false
LOG_LEVEL=error
```

### 3. Check PHP Error Logs

**Via cPanel → Error Logs**
**Via SSH:**
```bash
tail -50 /var/log/php_errors.log
# Hoặc
tail -50 ~/logs/error_log
```

### 4. Verify Database Connection

**Via SSH:**
```bash
cd backend
php artisan tinker
# Inside tinker:
DB::connection()->getPdo();
# Should output: PDO object
exit
```

### 5. Check Web Server Logs

**Apache/Nginx error logs:**
```bash
tail -50 /var/log/apache2/error.log
# Hoặc
tail -50 /var/log/nginx/error.log
```

## ✅ CHECKLIST HOÀN THÀNH

Sau khi làm xong các bước trên, check:

- [ ] Package mới đã upload (có vendor folder)
- [ ] Deploy.php chạy thành công
- [ ] File `.env` đã tạo với config đúng
- [ ] Database đã có dữ liệu (check phpMyAdmin)
- [ ] Permissions đã set đúng (755/775)
- [ ] Upload directories tồn tại
- [ ] PHP extensions đầy đủ
- [ ] Cache đã clear
- [ ] API test thành công: `curl https://hotriluan.xyz/api/categories`
- [ ] Frontend load được: `https://hotriluan.xyz`
- [ ] Admin panel accessible: `https://hotriluan.xyz/admin`
- [ ] Upload hình ảnh thành công

## 📝 LƯU Ý QUAN TRỌNG

1. **File .env** là file quan trọng nhất - phải config đúng
2. **Permissions** phải đúng: 755 cho files, 775 cho storage
3. **Vendor folder** phải có trong package (đã fix)
4. **Database** phải có dữ liệu (deploy.php sẽ import)
5. **APP_URL** phải đúng domain: `https://hotriluan.xyz`

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

Gửi cho developer:

1. **Laravel log:** `backend/storage/logs/laravel.log` (50 dòng cuối)
2. **PHP info:** Tạo file `info.php` với nội dung `<?php phpinfo();` → Truy cập → Screenshot
3. **Directory listing:** Output của `ls -laR backend/`
4. **Permissions:** Output của `ls -la backend/storage`
5. **Database status:** Screenshot phpMyAdmin với tables list
6. **Browser Console:** Screenshot lỗi F12 → Console

---

**Package mới đã sẵn sàng tại:** `C:\dev\alkanacoating\alkana-coating.zip`
**Size:** ~100-150MB (bao gồm vendor)

**TRIỂN KHAI LẠI NGAY!** 🚀
