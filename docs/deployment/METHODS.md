# 🚀 HƯỚNG DẪN TRIỂN KHAI CHUYÊN NGHIỆP - ALKANA COATING

## 📋 Tổng quan

Tài liệu này cung cấp **3 phương pháp triển khai** từ đơn giản đến chuyên nghiệp, phù hợp với nhiều cấp độ kỹ năng và yêu cầu khác nhau.

---

## 🎯 So sánh các phương pháp

| Tiêu chí | Method 1<br>Manual Upload | Method 2<br>One-Command Deploy | Method 3<br>CI/CD Auto Deploy |
|----------|---------------------------|-------------------------------|------------------------------|
| **Độ khó** | ⭐ Dễ | ⭐⭐ Trung bình | ⭐⭐⭐ Nâng cao |
| **Thời gian setup** | 5 phút | 15 phút | 30 phút |
| **Thời gian deploy** | 20-30 phút | 5 phút | 2 phút (tự động) |
| **Tự động hóa** | ❌ Không | ✅ Một phần | ✅ Hoàn toàn |
| **Rollback** | ❌ Khó | ✅ Dễ dàng | ✅ Tự động |
| **Zero downtime** | ❌ Không | ✅ Có | ✅ Có |
| **Phù hợp cho** | Shared hosting | VPS/Dedicated | Production enterprise |
| **Yêu cầu kỹ thuật** | Cơ bản | SSH access | Git, GitHub, SSH |

---

## 📦 METHOD 1: Manual Upload (Đơn giản nhất)

### ✅ Khi nào dùng:
- Hosting chia sẻ (shared hosting)
- Không có quyền SSH
- Chỉ cần deploy 1-2 lần/tháng

### 🛠️ Cách triển khai:

#### Bước 1: Build package trên máy local

**Windows:**
```bash
build-package.bat
```

**Linux/Mac:**
```bash
chmod +x build-package.sh
./build-package.sh
```

**Kết quả:** File `alkana-coating.zip` được tạo.

#### Bước 2: Upload lên hosting

**Via File Manager (cPanel/DirectAdmin):**
1. Đăng nhập cPanel
2. Mở File Manager
3. Navigate đến `public_html/`
4. Upload 2 files:
   - `alkana-coating.zip`
   - `deploy.php`

**Via FTP (FileZilla/WinSCP):**
```
Host: ftp.yourdomain.com
Username: your_ftp_user
Password: your_ftp_password
Port: 21

Upload to: /public_html/
```

#### Bước 3: Chạy installer wizard

1. Truy cập: `http://yourdomain.com/deploy.php`
2. Làm theo 6 bước wizard:
   - **Step 1:** Upload/verify ZIP file
   - **Step 2:** Extract files
   - **Step 3:** Configure database
   - **Step 4:** Configure website
   - **Step 5:** Run migrations
   - **Step 6:** Complete!

#### Bước 4: Bảo mật

```bash
# Xóa installer (quan trọng!)
rm deploy.php alkana-coating.zip
```

### ⚡ Ưu điểm:
- ✅ Đơn giản, dễ thực hiện
- ✅ Không cần kiến thức command line
- ✅ Hoạt động trên mọi hosting

### ⚠️ Nhược điểm:
- ❌ Mất thời gian (20-30 phút)
- ❌ Dễ sai sót khi làm thủ công
- ❌ Không tự động hóa
- ❌ Khó rollback khi có lỗi

---

## ⚙️ METHOD 2: One-Command Deploy (Khuyến nghị)

### ✅ Khi nào dùng:
- VPS hoặc dedicated server
- Có quyền SSH
- Deploy thường xuyên (1-2 lần/tuần)

### 🛠️ Cách triển khai:

#### Setup lần đầu (one-time):

**1. Cài đặt requirements trên server:**
```bash
# SSH vào server
ssh user@your-server.com

# Install PHP 8.1+
sudo apt update
sudo apt install php8.1-cli php8.1-fpm php8.1-mysql php8.1-gd \
                 php8.1-mbstring php8.1-xml php8.1-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Setup deployment directory
sudo mkdir -p /var/www/alkana-coating
sudo chown $USER:$USER /var/www/alkana-coating
```

**2. Configure SSH key (passwordless login):**
```bash
# Trên máy local
ssh-keygen -t ed25519 -C "alkana-deploy"
ssh-copy-id user@your-server.com

# Test
ssh user@your-server.com "echo 'SSH OK'"
```

**3. Configure deployment scripts:**

Edit `scripts/deploy-advanced.sh` hoặc `scripts/zero-downtime-deploy.sh`:
```bash
# Sửa các biến:
DEPLOY_USER="your_ssh_user"
DEPLOY_HOST="your_server_ip"
DEPLOY_PATH="/var/www/alkana-coating"
```

#### Deploy (mỗi lần):

**Deployment đơn giản:**
```bash
# Trên máy local
bash scripts/deploy-advanced.sh production v1.0.0
```

**Zero-downtime deployment:**
```bash
bash scripts/zero-downtime-deploy.sh
```

#### Rollback nếu cần:

```bash
# Rollback về version trước
bash scripts/rollback.sh

# Rollback về version cụ thể
bash scripts/rollback.sh 20250106_143022
```

### ⚡ Ưu điểm:
- ✅ Nhanh chóng (5 phút)
- ✅ Tự động hóa build + deploy
- ✅ Hỗ trợ rollback dễ dàng
- ✅ Zero downtime deployment
- ✅ Kiểm tra lỗi tự động

### ⚠️ Nhược điểm:
- ❌ Cần quyền SSH
- ❌ Cần kiến thức Linux cơ bản
- ❌ Setup ban đầu mất thời gian

---

## 🤖 METHOD 3: CI/CD Auto Deploy (Chuyên nghiệp nhất)

### ✅ Khi nào dùng:
- Dự án production lớn
- Team có nhiều developers
- Deploy nhiều lần/ngày
- Cần automation hoàn toàn

### 🛠️ Cách triển khai:

#### Setup lần đầu:

**1. Push code lên GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/alkana-coating.git
git push -u origin main
```

**2. Configure GitHub Secrets:**

Vào repository → Settings → Secrets and variables → Actions → New secret:

```
FTP_SERVER=ftp.yourdomain.com
FTP_USERNAME=your_ftp_user
FTP_PASSWORD=your_ftp_password

SSH_HOST=your_server_ip
SSH_USERNAME=your_ssh_user
SSH_PASSWORD=your_ssh_password (hoặc dùng SSH key)
DEPLOY_PATH=/var/www/alkana-coating
```

**3. Workflows đã được tạo:**

Các file đã có sẵn trong `.github/workflows/`:
- `deploy.yml` - Auto deploy khi push code
- `build-only.yml` - Chỉ build package (cho testing)

#### Sử dụng:

**Auto deployment:**
```bash
# Làm việc bình thường
git add .
git commit -m "Update feature X"
git push origin main

# GitHub Actions sẽ tự động:
# 1. Build frontend
# 2. Install backend dependencies
# 3. Run tests
# 4. Create package
# 5. Deploy to server
# 6. Run migrations
# 7. Optimize caches
```

**Manual trigger:**
1. Vào GitHub repository
2. Actions tab
3. Chọn workflow "Deploy Alkana Coating"
4. Click "Run workflow"
5. Chọn branch và click "Run workflow"

**Monitor deployment:**
- Vào Actions tab trên GitHub
- Xem real-time logs của deployment
- Nhận thông báo qua email nếu thất bại

#### Rollback:

**Method 1: Revert commit**
```bash
git revert HEAD
git push origin main
# Auto deploy version cũ
```

**Method 2: Deploy specific commit**
```bash
git checkout abc123  # commit cũ
git push origin main --force
```

### ⚡ Ưu điểm:
- ✅ Hoàn toàn tự động
- ✅ Nhanh nhất (2 phút)
- ✅ Kiểm tra lỗi tự động (tests)
- ✅ Lưu lịch sử deployment
- ✅ Dễ dàng rollback
- ✅ Cả team cùng dùng
- ✅ Artifact archiving

### ⚠️ Nhược điểm:
- ❌ Setup phức tạp
- ❌ Cần hiểu Git/GitHub
- ❌ Cần SSH/FTP access

---

## 🔧 Cấu hình Web Server

### Nginx (VPS/Cloud)

**Frontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/alkana-coating/current/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Backend API:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/alkana-coating/current/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Apache (.htaccess) - Shared Hosting

Files `.htaccess` đã được tạo tự động trong deployment package.

**Frontend `.htaccess`:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

**Backend `.htaccess`:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## 🔐 Bảo mật

### 1. File Permissions

```bash
# Backend
find backend -type f -exec chmod 644 {} \;
find backend -type d -exec chmod 755 {} \;
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
chmod -R 775 backend/public/uploads

# Frontend
find frontend -type f -exec chmod 644 {} \;
find frontend -type d -exec chmod 755 {} \;
```

### 2. Xóa files nhạy cảm

```bash
# Sau khi deploy
rm deploy.php
rm alkana-coating.zip
rm -rf .git  # Nếu upload nhầm
```

### 3. Environment file

```bash
# Đảm bảo .env không public
chmod 600 backend/.env

# .env phải chứa:
APP_ENV=production
APP_DEBUG=false
```

### 4. SSL Certificate

**Let's Encrypt (Free):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📊 Monitoring & Logging

### Health Check Endpoint

```bash
# Test API
curl https://api.yourdomain.com/api/health

# Expected response:
{"status":"ok","timestamp":"2025-01-06T10:30:00Z"}
```

### Logs Location

```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PHP-FPM logs
tail -f /var/log/php8.1-fpm.log
```

### Uptime Monitoring

Sử dụng services như:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🆘 Troubleshooting

### Lỗi 500 Internal Server Error

```bash
# 1. Kiểm tra logs
tail -100 backend/storage/logs/laravel.log

# 2. Kiểm tra permissions
chmod -R 775 backend/storage backend/bootstrap/cache

# 3. Clear cache
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Lỗi Database Connection

```bash
# Test connection
cd backend
php artisan tinker
>>> DB::connection()->getPdo();

# Kiểm tra credentials trong .env
cat .env | grep DB_
```

### Frontend không load API

```bash
# 1. Kiểm tra CORS
cd backend
php artisan config:clear

# 2. Verify API URL trong frontend
cat frontend/src/config/auto-config.js

# 3. Test API directly
curl -I https://api.yourdomain.com/api/health
```

### Zero downtime deployment failed

```bash
# Rollback ngay lập tức
bash scripts/rollback.sh

# Kiểm tra logs
ssh user@server "tail -100 /var/www/alkana-coating/releases/LATEST/backend/storage/logs/laravel.log"
```

---

## 📈 Performance Optimization

### 1. Backend Optimization

```bash
cd backend

# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# OPcache (add to php.ini)
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
```

### 2. Frontend Optimization

```javascript
// vite.config.js - Đã optimize sẵn
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
}
```

### 3. Database Optimization

```sql
-- Add indexes
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_slug (slug);
ALTER TABLE posts ADD INDEX idx_published (is_published, published_at);

-- Optimize tables
OPTIMIZE TABLE products, posts, categories;
```

---

## 📋 Deployment Checklist

### Trước khi deploy:

- [ ] Code đã được test đầy đủ
- [ ] Database backup đã tạo
- [ ] .env.production đã configure đúng
- [ ] Đã test trên staging environment
- [ ] Team đã được thông báo

### Trong quá trình deploy:

- [ ] Monitor deployment logs
- [ ] Verify health checks pass
- [ ] Test critical features
- [ ] Check error logs

### Sau khi deploy:

- [ ] Xóa files deploy.php, .zip
- [ ] Verify SSL certificate
- [ ] Test user flows
- [ ] Monitor for 24h
- [ ] Thông báo team deployment hoàn tất

---

## 🎯 Khuyến nghị theo loại dự án

### 🏠 Website cá nhân / SME
👉 **Dùng METHOD 1** (Manual Upload)
- Đơn giản, đủ dùng
- Chi phí thấp (shared hosting)

### 🏢 Website doanh nghiệp / Startup
👉 **Dùng METHOD 2** (One-Command Deploy)
- Cân bằng giữa đơn giản và hiệu quả
- Phù hợp VPS/Cloud server

### 🏭 Enterprise / SaaS Platform
👉 **Dùng METHOD 3** (CI/CD)
- Tự động hóa hoàn toàn
- Scalable cho team lớn
- Best practices

---

## 📞 Hỗ trợ

### Documentation
- API Documentation: `/docs/api-contract.md`
- Database Schema: `/docs/schema.sql`
- Sample Data: `/docs/sample-data.sql`

### Issues
Nếu gặp vấn đề, kiểm tra:
1. Logs (Laravel, Nginx, PHP-FPM)
2. Health check endpoint
3. Permissions
4. Environment configuration

---

## 🎉 Tổng kết

Với **3 phương pháp deployment** này, bạn có thể:

✅ **Triển khai nhanh** - Từ 2 đến 30 phút
✅ **Tự động hóa** - Từ thủ công đến hoàn toàn tự động
✅ **Rollback dễ dàng** - Khi có sự cố
✅ **Zero downtime** - Không ảnh hưởng người dùng
✅ **Chuyên nghiệp** - Theo best practices

**Lựa chọn phương pháp phù hợp với quy mô và kỹ năng của bạn!**

---

**Made with ❤️ for Alkana Coating Team**
