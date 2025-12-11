# Image Path Fixes for Production Deployment

## Problem
When deploying to production with the structure where frontend is at root and backend is in `backend/` folder, all image URLs were returning incorrect paths like `uploads/products/...` instead of `backend/public/uploads/products/...`, causing 404 errors.

## Solution
Updated ALL controllers that handle image uploads to use the correct production path format: `backend/public/uploads/{folder}/`

## Files Modified

### 1. SettingsController.php
**Path:** `backend/app/Http/Controllers/Api/SettingsController.php`
- **Method:** `uploadImage()`
- **Change:** Returns `url("backend/public/uploads/{$folder}/{$filename}")`

### 2. PostController.php
**Path:** `backend/app/Http/Controllers/Api/PostController.php`
- **Method:** `store()` - Line ~190
- **Method:** `update()` - Line ~285
- **Change:** All image fields now use `'backend/public/uploads/posts/' . $name`

### 3. ProjectController.php
**Path:** `backend/app/Http/Controllers/Api/ProjectController.php`
- **Method:** `store()` - Line ~105 (thumbnail)
- **Method:** `update()` - Line ~209 (thumbnail)
- **Method:** `update()` - Line ~288 (project_images gallery)
- **Change:** All paths now use `'backend/public/uploads/projects/' . $imageName`

### 4. CategoryController.php
**Path:** `backend/app/Http/Controllers/Admin/CategoryController.php`
- **Method:** `store()` - Line ~72
- **Method:** `update()` - Line ~167
- **Change:** All paths now use `'backend/public/uploads/categories/' . $imageName`

### 5. AdminProductController.php
**Path:** `backend/app/Http/Controllers/Api/AdminProductController.php`
- **Method:** `store()` - Line ~89 (thumbnail)
- **Method:** `store()` - Line ~103 (gallery images)
- **Method:** `update()` - Line ~191 (thumbnail)
- **Method:** `update()` - Line ~207 (gallery images)
- **Change:** All paths now use `'backend/public/uploads/products/' . $imageName`

### 6. ProductController.php
**Path:** `backend/app/Http/Controllers/Admin/ProductController.php`
- **Method:** `store()` - Line ~118
- **Method:** `update()` - Line ~255
- **Change:** Thumbnails now use `'backend/public/' . $path . '/' . $filename`

### 7. SliderController.php
**Path:** `backend/app/Http/Controllers/Api/SliderController.php`
- **Method:** `index()` - Line ~26
- **Method:** `adminIndex()` - Line ~41
- **Change:** URL transformations now use `url('backend/api/uploads/sliders/' . basename($slider->image))`

**Note:** Sliders use a different storage pattern - they're stored in `storage/app/public/sliders/` and served via API routes.

## Upload Directory Structure

After deployment, images are stored at:
```
backend/
  public/
    uploads/
      categories/
        thumbs/
      posts/
      products/
      projects/
      settings/
      sliders/    (symlink to storage/app/public/sliders)
      menus/
```

## API Routes

Image serving routes in `backend/routes/api.php` are correct:
- `/api/uploads/products/{filename}` → serves from `public/uploads/products/`
- `/api/uploads/posts/{filename}` → serves from `public/uploads/posts/`
- `/api/uploads/sliders/{filename}` → serves from `storage/app/public/sliders/`

## Build Script Updates

`build_deploy_package.ps1` was also updated to:
1. Include vendor folder (removed from exclude list)
2. Create all upload subdirectories with proper structure
3. Copy deploy.php to project root automatically
4. Show clear deployment instructions

## Deploy Script Updates

`deploy.php` was updated to:
1. NOT move uploads directory to root (keep in backend/public/)
2. Ensure all upload subdirectories exist with proper permissions
3. Preserve existing uploads during deployment

## Testing Checklist

Before deploying to production, test locally:
- [ ] Upload images in Settings
- [ ] Upload post thumbnails
- [ ] Upload product images (both thumbnail and gallery)
- [ ] Upload category images
- [ ] Upload project images
- [ ] Upload slider images
- [ ] Verify all image URLs start with `backend/public/uploads/` or `backend/api/uploads/`
- [ ] Check that images display correctly in frontend

## Deployment Steps

1. Upload both files to hosting root:
   - `alkana-coating.zip`
   - `deploy.php`

2. Access `https://hotriluan.xyz/deploy.php`

3. After deployment completes, run:
   ```bash
   php backend/scripts/fix_upload_permissions.php
   ```

4. Test image uploads on production

## Verification

After deployment, check:
```bash
# Verify directory structure
ls -la backend/public/uploads/

# Check permissions
ls -la backend/public/uploads/*/

# Test upload by uploading an image via admin panel
# Then check the database record has correct path:
# Should be: backend/public/uploads/{folder}/{filename}
```

## Date: 2025-01-XX
## Status: COMPLETED ✅
