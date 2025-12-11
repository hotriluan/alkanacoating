# Hướng dẫn kiểm tra sau khi deploy lên host

## Bước 1: Sau khi chạy deploy.php thành công

Kiểm tra cấu trúc thư mục trên host (qua FTP/File Manager):

```
/hotriluan.xyz/
├── backend/
│   ├── app/
│   ├── public/
│   │   └── uploads/          ← PHẢI CÓ THƯ MỤC NÀY!
│   │       ├── .htaccess
│   │       ├── settings/
│   │       ├── posts/
│   │       ├── categories/
│   │       ├── products/
│   │       ├── projects/
│   │       ├── sliders/
│   │       └── menus/
│   ├── storage/
│   └── ...
├── index.php                 ← Frontend entry
├── assets/                   ← Frontend assets
└── ...
```

## Bước 2: Kiểm tra quyền thư mục

### Via SSH:
```bash
cd /path/to/hotriluan.xyz
ls -la backend/public/uploads/

# Nên thấy output giống:
# drwxr-xr-x 9 www-data www-data 4096 Dec 11 10:00 uploads
```

### Via cPanel File Manager:
1. Vào `backend/public/uploads`
2. Chuột phải → Change Permissions
3. Đảm bảo: 755 (rwxr-xr-x)
4. Check "Apply to subdirectories"

## Bước 3: Chạy script fix permissions

### Via SSH:
```bash
cd /path/to/hotriluan.xyz
php backend/scripts/fix_upload_permissions.php
```

### Via cPanel Terminal:
```bash
php ~/public_html/backend/scripts/fix_upload_permissions.php
```

## Bước 4: Test upload

1. Đăng nhập admin: `https://hotriluan.xyz/admin`
2. Vào **Cài đặt** → **Thông tin website**
3. Thử upload hình ảnh cho logo hoặc giới thiệu
4. Nếu thành công → OK!
5. Nếu thất bại → Xem logs bên dưới

## Bước 5: Kiểm tra logs nếu upload fail

### Via SSH:
```bash
tail -50 /path/to/hotriluan.xyz/backend/storage/logs/laravel.log
```

### Via cPanel File Manager:
1. Vào `backend/storage/logs/laravel.log`
2. Xem dòng cuối cùng
3. Tìm error message liên quan đến upload

## Các lỗi thường gặp và cách fix:

### Lỗi 1: "Failed to create upload directory"
**Nguyên nhân:** Backend không có quyền tạo thư mục

**Fix:**
```bash
chmod 755 /path/to/hotriluan.xyz/backend/public
chmod 755 /path/to/hotriluan.xyz/backend/public/uploads
```

### Lỗi 2: "Upload directory is not writable"
**Nguyên nhân:** Thư mục tồn tại nhưng không có quyền ghi

**Fix:**
```bash
chown -R www-data:www-data /path/to/hotriluan.xyz/backend/public/uploads
chmod -R 755 /path/to/hotriluan.xyz/backend/public/uploads
```

### Lỗi 3: "File uploaded but can't load image"
**Nguyên nhân:** .htaccess blocking hoặc APP_URL sai

**Fix:**
1. Kiểm tra `.env`: `APP_URL=https://hotriluan.xyz`
2. Kiểm tra `backend/public/uploads/.htaccess` tồn tại
3. Nội dung .htaccess:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine Off
</IfModule>

<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|pdf)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
```

### Lỗi 4: Thư mục uploads không tồn tại sau deploy
**Nguyên nhân:** Phiên bản deploy.php cũ đã move uploads ra root

**Fix:** Re-deploy với package mới đã update!

## Debug Command Nhanh:

```bash
# Kiểm tra cấu trúc
find backend/public/uploads -type d

# Kiểm tra quyền
ls -laR backend/public/uploads

# Kiểm tra disk space
df -h

# Test tạo file
touch backend/public/uploads/test.txt && rm backend/public/uploads/test.txt && echo "OK: Can write" || echo "ERROR: Cannot write"

# Xem PHP settings
php -i | grep -i upload

# Xem Laravel logs realtime
tail -f backend/storage/logs/laravel.log
```

## API Endpoint để test trực tiếp:

```bash
# Test upload via curl
curl -X POST https://hotriluan.xyz/api/admin/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg" \
  -F "folder=settings"

# Expected response:
# {"success":true,"url":"https://hotriluan.xyz/uploads/settings/1234567890_abc.jpg","path":"uploads/settings/1234567890_abc.jpg"}
```

## Checklist cuối cùng:

- [ ] Thư mục `backend/public/uploads` tồn tại
- [ ] Tất cả subdirectories tồn tại (settings, posts, etc.)
- [ ] Permissions 755 cho tất cả thư mục
- [ ] File `.htaccess` trong uploads/
- [ ] `.env` có APP_URL đúng
- [ ] Đã chạy `php backend/scripts/fix_upload_permissions.php`
- [ ] Test upload thành công từ admin panel

## Nếu vẫn không được:

1. Screenshot lỗi từ browser console (F12)
2. Copy Laravel log: `backend/storage/logs/laravel.log`
3. Chụp output của: `ls -la backend/public/`
4. Gửi cho developer để hỗ trợ
