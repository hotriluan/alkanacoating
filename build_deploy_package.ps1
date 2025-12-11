# Build and Deploy Package Script for Alkana Coating
# This script automates the process of creating a deployment zip for Mat Bao hosting

$ErrorActionPreference = "Stop"

# Configuration
$DB_NAME = "alkanacoating"
$DB_USER = "root"
$DB_PASS = "" # Default XAMPP password is empty
$MYSQLDUMP_PATH = "C:\xampp\mysql\bin\mysqldump.exe"
$BACKEND_DIR = Join-Path $PSScriptRoot "backend"
$FRONTEND_DIR = Join-Path $PSScriptRoot "frontend"
$OUTPUT_DIR = Join-Path $PSScriptRoot "deploy_temp"
$ZIP_FILE = Join-Path $PSScriptRoot "alkana-coating.zip"

Write-Host "Starting deployment package creation..." -ForegroundColor Green

# 1. Database Export
Write-Host "1. Exporting database..." -ForegroundColor Cyan
if (Test-Path $MYSQLDUMP_PATH) {
    $SQL_FILE = Join-Path $BACKEND_DIR "alkanacoating_production.sql"
    & $MYSQLDUMP_PATH -u $DB_USER $DB_NAME > $SQL_FILE
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database exported successfully to $SQL_FILE" -ForegroundColor Green
    } else {
        Write-Error "Database export failed!"
    }
} else {
    Write-Warning "mysqldump not found at $MYSQLDUMP_PATH. Skipping database export. Please export manually."
}

# 2. Frontend Build
Write-Host "2. Building frontend..." -ForegroundColor Cyan
Push-Location $FRONTEND_DIR
try {
    Write-Host "Installing frontend dependencies..."
    npm install
    Write-Host "Building frontend..."
    npm run build
} finally {
    Pop-Location
}

# 3. Prepare Backend & Integrate Frontend
Write-Host "3. Preparing files..." -ForegroundColor Cyan
if (Test-Path $OUTPUT_DIR) { Remove-Item $OUTPUT_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null

# Copy backend
$BackendDest = Join-Path $OUTPUT_DIR "backend"
New-Item -ItemType Directory -Path $BackendDest | Out-Null

Write-Host "Copying backend files..."
# Copy all files except excluded ones (keep vendor for production)
$excludeItems = @("node_modules", ".git", ".env", "storage", "laravel.log")
Get-ChildItem $BACKEND_DIR | Where-Object { $excludeItems -notcontains $_.Name } | ForEach-Object {
    Write-Host "  Copying: $($_.Name)"
    Copy-Item $_.FullName -Destination $BackendDest -Recurse -Force
}

# Verify public directory was copied
$publicDest = Join-Path $BackendDest "public"
if (Test-Path $publicDest) {
    Write-Host "[OK] Public directory copied" -ForegroundColor Green
    $uploadsDest = Join-Path $publicDest "uploads"
    if (Test-Path $uploadsDest) {
        Write-Host "[OK] Uploads directory exists" -ForegroundColor Green
        $subDirs = Get-ChildItem $uploadsDest -Directory | Select-Object -ExpandProperty Name
        Write-Host "      Subdirectories: $($subDirs -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "[WARN] Uploads directory NOT found!" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Public directory NOT copied!" -ForegroundColor Red
}

# Create storage structure
Write-Host "Creating storage directories..."
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/app/public") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/app/backups") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/framework/cache") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/framework/sessions") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/framework/views") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackendDest "storage/logs") -Force | Out-Null

# Copy storage/app/public contents (Sliders, Menus, etc.)
$StoragePublicSource = Join-Path $BACKEND_DIR "storage/app/public"
if (Test-Path $StoragePublicSource) {
    Write-Host "Copying storage/app/public files..."
    Copy-Item -Path "$StoragePublicSource\*" -Destination (Join-Path $BackendDest "storage/app/public") -Recurse -Force
}

# Ensure public/uploads directories exist
Write-Host "Ensuring public/uploads directories exist..."
$UploadDirs = @(
    "public/uploads",
    "public/uploads/settings",
    "public/uploads/posts",
    "public/uploads/categories",
    "public/uploads/products",
    "public/uploads/projects",
    "public/uploads/sliders",
    "public/uploads/menus"
)
foreach ($dir in $UploadDirs) {
    $fullPath = Join-Path $BackendDest $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Cyan
    } else {
        Write-Host "  Exists: $dir" -ForegroundColor Gray
    }
}

# Create .htaccess for uploads directory
$HtaccessPath = Join-Path $BackendDest "public/uploads/.htaccess"
if (-not (Test-Path $HtaccessPath)) {
    $HtaccessContent = @"
<IfModule mod_rewrite.c>
    RewriteEngine Off
</IfModule>

<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|pdf)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
"@
    Set-Content -Path $HtaccessPath -Value $HtaccessContent -Force
    Write-Host "  Created .htaccess for uploads" -ForegroundColor Cyan
}

# Copy deploy.php
Copy-Item (Join-Path $PSScriptRoot "deploy.php") -Destination $OUTPUT_DIR

# Copy setup-uploads.sh script for production
$SetupScript = Join-Path $PSScriptRoot "scripts/setup-uploads.sh"
if (Test-Path $SetupScript) {
    Copy-Item $SetupScript -Destination $OUTPUT_DIR
    Write-Host "Copied setup-uploads.sh script"
}

# Create a README for deployment
$ReadmeContent = @"
# Alkana Coating Deployment Package

## Quick Start

1. Upload this entire folder to your hosting
2. Run the deployment script:
   - For cPanel: Access http://yourdomain.com/deploy.php
   - For SSH access: Run the commands below

## After Deployment - Important!

### Fix Upload Permissions (Required for image uploads)

**Option 1: Via SSH**
cd public_html/backend
php scripts/fix_upload_permissions.php

Or:
bash ../setup-uploads.sh

**Option 2: Via cPanel File Manager**
- Set permissions for 'public/uploads' and all subdirectories to 755
- Set ownership to your web server user (usually 'nobody' or your cPanel username)

**Option 3: Via FTP**
- Right-click on 'public/uploads' folder
- Change permissions to 755 (rwxr-xr-x)
- Apply to all subdirectories

### Verify Upload Directories Exist:
- backend/public/uploads/settings
- backend/public/uploads/posts
- backend/public/uploads/categories
- backend/public/uploads/products
- backend/public/uploads/projects
- backend/public/uploads/sliders
- backend/public/uploads/menus

## Troubleshooting

If uploads still fail:
1. Check disk space: df -h
2. Check PHP settings in php.ini:
   - upload_max_filesize = 16M
   - post_max_size = 16M
3. Check .env file has correct APP_URL
4. Check web server error logs

For detailed documentation, see: docs/deployment/UPLOAD_FIX.md
"@
$ReadmePath = Join-Path $OUTPUT_DIR "DEPLOYMENT_README.txt"
Set-Content -Path $ReadmePath -Value $ReadmeContent -Force
Write-Host "Created deployment README"

# 4. Create Zip
Write-Host "4. Creating zip package..." -ForegroundColor Cyan
if (Test-Path $ZIP_FILE) { Remove-Item $ZIP_FILE -Force }
Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath $ZIP_FILE -Force

# Copy deploy.php to same directory as zip (for easy upload)
$DeployPhpDest = Join-Path $PSScriptRoot "deploy.php"
if (Test-Path $DeployPhpDest) {
    Write-Host "deploy.php already exists in project root" -ForegroundColor Gray
} else {
    Copy-Item (Join-Path $OUTPUT_DIR "deploy.php") -Destination $DeployPhpDest -ErrorAction SilentlyContinue
    Write-Host "Copied deploy.php to project root for easy access" -ForegroundColor Cyan
}

# Cleanup
Remove-Item $OUTPUT_DIR -Recurse -Force

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Package created successfully!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files ready for upload:" -ForegroundColor Yellow
Write-Host "  1. alkana-coating.zip"
Write-Host "  2. deploy.php"
Write-Host ""
Write-Host "Deployment Instructions:" -ForegroundColor Cyan
Write-Host "Step 1: Upload BOTH files to your hosting root" -ForegroundColor White
Write-Host "        - alkana-coating.zip"
Write-Host "        - deploy.php"
Write-Host ""
Write-Host "Step 2: Access https://yourdomain.com/deploy.php" -ForegroundColor White
Write-Host "        Script will automatically extract and setup everything"
Write-Host ""
Write-Host "Step 3: After deployment completes:" -ForegroundColor White
Write-Host "        Run: php backend/scripts/fix_upload_permissions.php"
Write-Host "        Test: https://yourdomain.com"
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "  - Upload both files (zip + deploy.php)" -ForegroundColor Yellow
Write-Host "  - Do NOT extract manually - deploy.php will do it" -ForegroundColor Yellow
Write-Host "  - Delete old files first to avoid conflicts" -ForegroundColor Yellow
Write-Host ""
