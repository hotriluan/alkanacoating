# 🚀 HƯỚNG DẪN TRIỂN KHAI ALKANA COATING LÊN MẮT BÃO HOSTING

## 📋 Checklist Chuẩn Bị

### ✅ Files đã chuẩn bị:

- [x] React production build (trong `/public`)
- [x] Laravel backend code
- [x] Environment config (`.env.production`)
- [x] Security headers (`.htaccess`)
- [x] Database migrations & seeders

---

## 🖥️ BƯỚC 1: CHUẨN BỊ HOSTING MẮT BÃO

### 1.1 Đăng nhập cPanel Mắt Bão

- Truy cập: `https://cpanel.yourdomain.matbao.net`
- Đăng nhập bằng thông tin hosting

### 1.2 Tạo Database MySQL

1. Vào **MySQL Databases** trong cPanel
2. Tạo database mới: `alkanacoating_db`
3. Tạo user database: `alkanacoating_user`
4. Gán quyền **ALL PRIVILEGES** cho user
5. **LƯU LẠI**: database name, username, password

---

## 📁 BƯỚC 2: UPLOAD FILES

### 2.1 Cấu trúc thư mục trên hosting:

```
public_html/                    ← Document Root
├── index.html                  ← React App
├── assets/                     ← CSS, JS files
├── api/                        ← Laravel API
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── vendor/
│   ├── .env
│   └── index.php
└── .htaccess
```

### 2.2 Upload qua File Manager hoặc FTP:

#### Via File Manager (Khuyến nghị):

1. Vào **File Manager** trong cPanel
2. Navigate đến `public_html/`
3. Upload các files:
   - Copy toàn bộ từ `D:\improvement\alkanacoating\backend\public\*` → `public_html/`
   - Tạo folder `api/` trong `public_html/`
   - Upload toàn bộ Laravel code (trừ `public/`) → `public_html/api/`

#### Via FTP (Alternative):

```bash
# Connect bằng FTP client (FileZilla, WinSCP)
Host: ftp.yourdomain.matbao.net
Username: your_ftp_username
Password: your_ftp_password
Port: 21
```

---

## ⚙️ BƯỚC 3: CẤU HÌNH PRODUCTION

### 3.1 Cấu hình Environment

1. Rename `.env.production` → `.env` trong `public_html/api/`
2. Sửa thông tin database:

```env
DB_DATABASE=alkanacoating_db
DB_USERNAME=alkanacoating_user
DB_PASSWORD=your_password_here
APP_URL=https://yourdomain.matbao.net
```

### 3.2 Generate Application Key

Chạy trong **Terminal** của cPanel:

```bash
cd public_html/api
php artisan key:generate
```

### 3.3 Set Permissions

```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

---

## 🗄️ BƯỚC 4: SETUP DATABASE

### 4.1 Chạy Migrations

```bash
cd public_html/api
php artisan migrate --force
```

### 4.2 Seed Sample Data

```bash
php artisan db:seed --force
php artisan db:seed --class=AdminUserSeeder --force
```

---

## 🌐 BƯỚC 5: CẤU HÌNH API ROUTES

### 5.1 Tạo API Routing

Trong `public_html/.htaccess`, thêm:

```apache
# API Routes
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ /api/public/index.php [L,QSA]
```

### 5.2 Update Frontend API Base URL

Trong React code, update API base URL thành:

```javascript
// frontend/src/services/api.js
const API_BASE_URL = "https://yourdomain.matbao.net/api";
```

---

## 🔧 BƯỚC 6: KIỂM TRA & DEBUG

### 6.1 Test API Endpoints

```bash
curl https://yourdomain.matbao.net/api/health
curl https://yourdomain.matbao.net/api/products
```

### 6.2 Check Laravel Logs

```bash
tail -f public_html/api/storage/logs/laravel.log
```

### 6.3 Common Issues & Solutions:

#### ❌ 500 Internal Server Error

- Check file permissions: `chmod -R 755 storage/ bootstrap/cache/`
- Check `.env` file configuration
- Enable error reporting temporarily: `APP_DEBUG=true`

#### ❌ Database Connection Error

- Verify database credentials in `.env`
- Check if database exists
- Test connection: `php artisan tinker` → `DB::connection()->getPdo()`

#### ❌ CORS Issues

- Update `config/cors.php`
- Set correct domain in `SANCTUM_STATEFUL_DOMAINS`

---

## 🎯 BƯỚC 7: FINAL CHECKLIST

### ✅ Verification Steps:

- [ ] Website loads: `https://yourdomain.matbao.net`
- [ ] API health check: `https://yourdomain.matbao.net/api/health`
- [ ] Products page displays data
- [ ] Admin login works: `https://yourdomain.matbao.net/admin/login`
- [ ] Admin credentials: `admin@alkanacoating.com` / `admin123`

---

## 📞 HỖ TRỢ MẮT BÃO

Nếu gặp vấn đề:

- **Hotline**: 1900 6680
- **Live Chat**: matbao.net
- **Ticket Support**: qua cPanel

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **Backup trước khi deploy**: Sao lưu code & database
2. **SSL Certificate**: Mắt Bão thường tự động cấp Let's Encrypt
3. **PHP Version**: Đảm bảo hosting dùng PHP 8.0+
4. **Memory Limit**: Laravel cần ít nhất 256MB RAM
5. **Security**: Không upload `.env` file với sensitive data

---

## 📈 SAU KHI DEPLOY THÀNH CÔNG

Bạn sẽ có:

- ✅ Website hoạt động: https://yourdomain.matbao.net
- ✅ Admin panel: https://yourdomain.matbao.net/admin/login
- ✅ API endpoints: https://yourdomain.matbao.net/api/*
- ✅ Database với sample data
- ✅ SSL certificate (HTTPS)

🎉 **Chúc mừng! Website Alkana Coating đã live trên internet!**
