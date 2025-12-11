# Upload Directory Setup and Troubleshooting Guide

## Production Upload Issues - Fixed

### Changes Made

#### 1. Enhanced SettingsController Upload (`backend/app/Http/Controllers/Api/SettingsController.php`)

**Improvements:**
- ✅ Check and create directory if not exists
- ✅ Verify directory is writable before upload
- ✅ Return full URL with `url()` helper (includes APP_URL)
- ✅ Return both `url` and `path` in response
- ✅ Comprehensive error logging
- ✅ Better exception handling

**Before:**
```php
$url = "/uploads/{$folder}/{$filename}"; // Relative URL
```

**After:**
```php
$url = url("uploads/{$folder}/{$filename}"); // Full URL: https://domain.com/uploads/...
```

#### 2. Enhanced PostController Upload (`backend/app/Http/Controllers/Api/PostController.php`)

**Improvements:**
- ✅ Proper error handling for directory creation
- ✅ Check directory write permissions
- ✅ Return error response instead of silent failure
- ✅ Same improvements for both `store()` and `update()` methods

#### 3. Created Production Setup Scripts

**Script 1: `backend/scripts/fix_upload_permissions.php`**
```bash
php backend/scripts/fix_upload_permissions.php
```
- Creates all required upload directories
- Sets correct permissions (0755)
- Checks web server user
- Provides troubleshooting tips

**Script 2: `scripts/setup-uploads.sh`** (Linux/Production)
```bash
bash scripts/setup-uploads.sh
```
- Creates upload directories
- Sets ownership to www-data (configurable)
- Creates .htaccess for uploads
- Checks system configuration

---

## Deployment Checklist

### On Production Server:

1. **Run setup script:**
   ```bash
   cd /path/to/alkanacoating
   bash scripts/setup-uploads.sh
   ```

2. **Or manually create directories:**
   ```bash
   cd backend
   mkdir -p public/uploads/{settings,posts,categories,products,projects,sliders,menus}
   chmod -R 755 public/uploads
   sudo chown -R www-data:www-data public/uploads
   ```

3. **Check .env configuration:**
   ```env
   APP_URL=https://yourdomain.com
   FILESYSTEM_DISK=local
   ```

4. **Verify PHP upload settings:**
   ```ini
   upload_max_filesize = 16M
   post_max_size = 16M
   max_execution_time = 60
   memory_limit = 256M
   ```

5. **Test upload endpoint:**
   ```bash
   curl -X POST https://yourdomain.com/api/admin/upload-image \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@test.jpg" \
     -F "folder=settings"
   ```

---

## Common Issues & Solutions

### Issue 1: "Failed to create upload directory"
**Cause:** No write permission on `public/` folder

**Solution:**
```bash
sudo chown -R www-data:www-data backend/public
chmod 755 backend/public
```

### Issue 2: "Upload directory is not writable"
**Cause:** Wrong directory permissions

**Solution:**
```bash
chmod -R 755 backend/public/uploads
```

### Issue 3: Images upload but can't be loaded
**Cause:** Wrong APP_URL or .htaccess blocking access

**Solution:**
1. Check `.env`: `APP_URL=https://yourdomain.com`
2. Create `public/uploads/.htaccess`:
   ```apache
   <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
       Order Allow,Deny
       Allow from all
   </FilesMatch>
   ```

### Issue 4: SELinux blocking writes (CentOS/RHEL)
**Solution:**
```bash
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/path/to/backend/public/uploads(/.*)?"
sudo restorecon -Rv /path/to/backend/public/uploads
```

### Issue 5: Disk space full
**Check:**
```bash
df -h
du -sh backend/public/uploads/*
```

---

## Testing on Development

1. **Test Settings upload:**
   - Go to Admin → Settings → Website Info
   - Try uploading images for company info sections

2. **Test Post upload:**
   - Go to Admin → Posts → Create New
   - Upload thumbnail and featured images
   - Upload images within CKEditor content

3. **Check logs:**
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

---

## API Response Format

### Success:
```json
{
  "success": true,
  "url": "https://domain.com/uploads/settings/1733900000_abc123.jpg",
  "path": "uploads/settings/1733900000_abc123.jpg",
  "message": "Image uploaded successfully"
}
```

### Error:
```json
{
  "success": false,
  "message": "Failed to upload image: Upload directory is not writable"
}
```

---

## File Size Limits

- **Development:** 16MB (with auto-resize for images > 8MB)
- **Production:** Same, but check PHP ini settings
- **Validation:** Images only (jpeg, png, jpg, gif, webp)

---

## Frontend Changes Needed (Optional)

If frontend still shows relative URLs, update `ImageUploader.jsx`:

```javascript
// Use the full URL from API response
const imageUrl = response.data.url; // Already includes domain
onChange(imageUrl);
```

---

## Maintenance

### Clean unused images:
```bash
php artisan image:cleanup
```

### Check storage analytics:
```bash
curl https://yourdomain.com/api/admin/storage/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Quick Fix Summary

✅ **Controllers updated** - Better error handling + full URLs
✅ **Scripts created** - Automated directory setup
✅ **Documentation added** - Complete troubleshooting guide

**Next steps for production:**
1. Deploy updated code
2. Run `bash scripts/setup-uploads.sh`
3. Test upload functionality
4. Monitor logs for any issues
