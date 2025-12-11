# Deployment Guide - Alkana Coating

Complete deployment documentation for the Alkana Coating project. This guide consolidates all deployment methods and best practices.

## Quick Links

- **Quick Start**: [5-minute deployment](#quick-start-5-minutes)
- **Development Setup**: [Local development](#development-environment)
- **Production Deployment**: [Production guide](#production-deployment)
- **Troubleshooting**: [Common issues](#troubleshooting)

---

## Development Environment

### Prerequisites

- **PHP**: 8.0 or higher
- **Composer**: Latest version
- **Node.js**: 18 LTS or higher
- **MySQL**: 8.0 or higher
- **Web Server**: Apache (XAMPP) or Nginx

### Option A: XAMPP (Windows - Recommended)

**Step 1: Install XAMPP**
- Download from [https://www.apachefriends.org](https://www.apachefriends.org)
- Install to `C:\xampp`
- Start Apache and MySQL services

**Step 2: Add PHP to PATH**
```powershell
# Add C:\xampp\php to system PATH
# Restart terminal after adding
```

**Step 3: Install Composer**
- Download from [https://getcomposer.org](https://getcomposer.org)
- Run installer

**Step 4: Setup Backend**
```powershell
cd C:\dev\alkanacoating\backend

# Install dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate app key
php artisan key:generate

# Create database (via phpMyAdmin: http://localhost/phpmyadmin)
# Database name: alkanacoating

# Run migrations and seeders
php artisan migrate --seed

# Start Laravel server
php artisan serve --host=127.0.0.1 --port=8000
```

**Step 5: Setup Frontend**
```powershell
cd C:\dev\alkanacoating\frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access**:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Admin: http://localhost:5173/admin

### Option B: Docker

```bash
# Start all services
docker compose up -d --build

# Access
# Backend: http://localhost:8080
# Frontend: http://localhost:5173 (run separately)
```

---

## Quick Start (5 Minutes)

### Method 1: Shared Hosting (Easiest)

**Build Package**:
```bash
# Windows
build-package.bat

# Linux/Mac
./build-package.sh
```

**Upload Files**:
1. Upload `alkana-coating.zip` and `deploy.php` to hosting
2. Visit `http://yourdomain.com/deploy.php`
3. Follow 6-step wizard
4. Delete installer: `rm deploy.php alkana-coating.zip`

⏱️ **20 minutes** | 💪 **Easy**

### Method 2: VPS/Cloud (Recommended)

**One-time Setup**:
```bash
# Configure deployment script
vim scripts/deploy-advanced.sh
# Set: DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH
```

**Deploy**:
```bash
bash scripts/deploy-advanced.sh production v1.0.0
```

**Rollback if needed**:
```bash
bash scripts/rollback.sh
```

⏱️ **5 minutes** | 💪 **Medium**

### Method 3: CI/CD (Professional)

**Setup**:
1. Push code to GitHub
2. Add secrets in GitHub Settings → Secrets
3. Workflows already configured in `.github/workflows/`

**Deploy**:
```bash
git push origin main
# Auto-deploy triggered!
```

⏱️ **2 minutes** | 💪 **Advanced**

---

## Production Deployment

### Server Requirements

**Minimum**:
- PHP 8.0+ with extensions: `mbstring`, `xml`, `gd`, `mysql`, `zip`
- MySQL 8.0+
- Apache 2.4+ or Nginx 1.18+
- 512MB RAM minimum
- 1GB disk space

**Recommended**:
- PHP 8.1+
- MySQL 8.0+
- 2GB RAM
- 5GB disk space
- SSL certificate

### Environment Configuration

**Backend `.env`**:
```env
APP_NAME="Alkana Coating"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alkanacoating
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Generate with: php artisan key:generate
APP_KEY=base64:...

# CORS for frontend
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

**Frontend `.env`**:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME="Alkana Coating"
```

### Web Server Configuration

#### Apache (.htaccess)

**Backend** (`backend/public/.htaccess`):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

**Frontend** (`.htaccess`):
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

#### Nginx

**Backend**:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/alkana-coating/backend/public;
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
}
```

**Frontend**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/alkana-coating/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### File Permissions

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

### Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong `APP_KEY`
- [ ] Secure database credentials
- [ ] Install SSL certificate
- [ ] Set proper file permissions
- [ ] Delete `deploy.php` after installation
- [ ] Protect `.env` file (chmod 600)
- [ ] Enable firewall
- [ ] Regular security updates

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Database Management

### Migrations

```bash
cd backend

# Run migrations
php artisan migrate

# Run with seeders
php artisan migrate --seed

# Rollback last migration
php artisan migrate:rollback

# Reset database
php artisan migrate:fresh --seed
```

### Backup & Restore

**Via Admin Panel**:
1. Login to `/admin`
2. Go to Backup Management
3. Create Data Backup or Full Backup
4. Download backup file

**Via Command Line**:
```bash
# Manual database backup
mysqldump -u username -p alkanacoating > backup.sql

# Restore
mysql -u username -p alkanacoating < backup.sql
```

---

## Build Process

### Frontend Build

```bash
cd frontend

# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Output**: `frontend/dist/` directory

### Backend Optimization

```bash
cd backend

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

---

## Monitoring & Maintenance

### Health Check

```bash
# Test API
curl https://yourdomain.com/api/health

# Expected response
{"status":"ok","timestamp":"2025-11-30T..."}
```

### Logs

```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Performance Optimization

**Backend**:
```bash
# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000

# Database indexes
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_slug (slug);
```

**Frontend**:
- Already optimized in `vite.config.js`
- Code splitting enabled
- Minification enabled
- Gzip compression recommended

---

## Troubleshooting

### 500 Internal Server Error

```bash
# Check Laravel logs
tail -100 backend/storage/logs/laravel.log

# Check permissions
chmod -R 775 backend/storage backend/bootstrap/cache

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Database Connection Error

```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();

# Verify credentials
cat backend/.env | grep DB_
```

### Frontend Not Loading

```bash
# Check API URL
cat frontend/.env

# Test CORS
curl -I https://yourdomain.com/api/health

# Rebuild frontend
cd frontend
npm run build
```

### Permission Denied

```bash
# Fix storage permissions
chmod -R 775 backend/storage
chown -R www-data:www-data backend/storage

# Fix upload permissions
chmod -R 775 backend/public/uploads
chown -R www-data:www-data backend/public/uploads
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code tested locally
- [ ] Database backup created
- [ ] `.env` configured for production
- [ ] SSL certificate ready
- [ ] DNS configured

### During Deployment

- [ ] Monitor deployment logs
- [ ] Verify health checks
- [ ] Test critical features
- [ ] Check error logs

### Post-Deployment

- [ ] Delete installer files
- [ ] Verify SSL certificate
- [ ] Test user flows
- [ ] Monitor for 24 hours
- [ ] Notify team

---

## Additional Resources

- **API Documentation**: [api-contract.md](file:///c:/dev/alkanacoating/docs/api-contract.md)
- **Database Schema**: [schema.sql](file:///c:/dev/alkanacoating/docs/schema.sql)
- **Quick Start**: [QUICK_START.md](file:///c:/dev/alkanacoating/docs/deployment/QUICK_START.md)
- **Detailed Methods**: [METHODS.md](file:///c:/dev/alkanacoating/docs/deployment/METHODS.md)
- **GitHub Actions**: [GITHUB_ACTIONS.md](file:///c:/dev/alkanacoating/docs/deployment/GITHUB_ACTIONS.md)

---

**Last Updated**: 2025-11-30  
**Document Owner**: Development Team
