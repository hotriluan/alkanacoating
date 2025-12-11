@echo off
REM ##############################################################################
REM Alkana Coating - Advanced Deployment Script for Windows
REM Usage: deploy-advanced.bat [environment] [version]
REM ##############################################################################

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set VERSION=%2
if "%VERSION%"=="" (
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
        set mydate=%%c%%b%%a
    )
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
        set mytime=%%a%%b
    )
    set VERSION=!mydate!_!mytime!
)

set PROJECT_NAME=alkana-coating
set BUILD_DIR=build
set PACKAGE_NAME=%PROJECT_NAME%-%VERSION%.zip

echo.
echo ========================================
echo 🚀 Alkana Coating Deployment
echo ========================================
echo Environment: %ENVIRONMENT%
echo Version: %VERSION%
echo.

REM Step 1: Check prerequisites
echo [1/10] Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    exit /b 1
)
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    exit /b 1
)
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PHP not found
    exit /b 1
)
echo ✓ Prerequisites OK
echo.

REM Step 2: Clean build directory
echo [2/10] Cleaning build directory...
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%"
echo ✓ Build directory ready
echo.

REM Step 3: Build frontend
echo [3/10] Building frontend...
cd frontend
call npm ci --silent
call npm run build
cd ..
echo ✓ Frontend built
echo.

REM Step 4: Install backend dependencies
echo [4/10] Installing backend dependencies...
cd backend
call composer install --no-dev --optimize-autoloader --quiet
cd ..
echo ✓ Backend dependencies installed
echo.

REM Step 5: Copy files
echo [5/10] Copying files...
xcopy /E /I /Y /Q backend "%BUILD_DIR%\backend" /EXCLUDE:build-exclude.txt
xcopy /E /I /Y /Q frontend\dist "%BUILD_DIR%\frontend"
copy deploy.php "%BUILD_DIR%\" >nul
if exist README.md copy README.md "%BUILD_DIR%\" >nul
if exist DEPLOYMENT_GUIDE.md copy DEPLOYMENT_GUIDE.md "%BUILD_DIR%\" >nul
echo ✓ Files copied
echo.

REM Step 6: Create .htaccess files
echo [6/10] Creating .htaccess files...
(
echo ^<IfModule mod_rewrite.c^>
echo     ^<IfModule mod_negotiation.c^>
echo         Options -MultiViews -Indexes
echo     ^</IfModule^>
echo.
echo     RewriteEngine On
echo.
echo     # Handle Authorization Header
echo     RewriteCond %%{HTTP:Authorization} .
echo     RewriteRule .* - [E=HTTP_AUTHORIZATION:%%{HTTP:Authorization}]
echo.
echo     # Redirect Trailing Slashes...
echo     RewriteCond %%{REQUEST_FILENAME} !-d
echo     RewriteCond %%{REQUEST_URI} ^(.+^)/$
echo     RewriteRule ^ %%1 [L,R=301]
echo.
echo     # Send Requests To Front Controller...
echo     RewriteCond %%{REQUEST_FILENAME} !-d
echo     RewriteCond %%{REQUEST_FILENAME} !-f
echo     RewriteRule ^ index.php [L]
echo ^</IfModule^>
) > "%BUILD_DIR%\backend\public\.htaccess"

(
echo ^<IfModule mod_rewrite.c^>
echo     RewriteEngine On
echo     RewriteBase /
echo     RewriteRule ^index\.html$ - [L]
echo     RewriteCond %%{REQUEST_FILENAME} !-f
echo     RewriteCond %%{REQUEST_FILENAME} !-d
echo     RewriteRule . /index.html [L]
echo ^</IfModule^>
) > "%BUILD_DIR%\frontend\.htaccess"
echo ✓ .htaccess files created
echo.

REM Step 7: Create environment template
echo [7/10] Creating environment template...
(
echo APP_NAME="Alkana Coating"
echo APP_ENV=production
echo APP_KEY=
echo APP_DEBUG=false
echo APP_URL=https://yourdomain.com
echo.
echo DB_CONNECTION=mysql
echo DB_HOST=127.0.0.1
echo DB_PORT=3306
echo DB_DATABASE=alkana_coating
echo DB_USERNAME=root
echo DB_PASSWORD=
echo.
echo CACHE_DRIVER=file
echo SESSION_DRIVER=file
echo QUEUE_CONNECTION=sync
echo.
echo SANCTUM_STATEFUL_DOMAINS=yourdomain.com
echo SESSION_DOMAIN=yourdomain.com
echo FRONTEND_URL=https://yourdomain.com
) > "%BUILD_DIR%\backend\.env.example"
echo ✓ Environment template created
echo.

REM Step 8: Create deployment info
echo [8/10] Creating deployment info...
(
echo ═══════════════════════════════════════════════════
echo   ALKANA COATING - DEPLOYMENT PACKAGE
echo ═══════════════════════════════════════════════════
echo.
echo Version: %VERSION%
echo Environment: %ENVIRONMENT%
echo Build Date: %DATE% %TIME%
echo.
echo ═══════════════════════════════════════════════════
echo   QUICK START
echo ═══════════════════════════════════════════════════
echo.
echo 1. Upload all files to your hosting
echo 2. Visit: http://yourdomain.com/deploy.php
echo 3. Follow the installation wizard
echo 4. Delete deploy.php after installation
echo.
echo ═══════════════════════════════════════════════════
echo   MANUAL DEPLOYMENT ^(Advanced^)
echo ═══════════════════════════════════════════════════
echo.
echo 1. Configure backend/.env with database credentials
echo 2. Run: php artisan migrate --force
echo 3. Run: php artisan db:seed --force
echo 4. Set permissions for storage/ and bootstrap/cache/
echo 5. Point web server to frontend/ and backend/public/
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
) > "%BUILD_DIR%\DEPLOYMENT_INFO.txt"
echo ✓ Deployment info created
echo.

REM Step 9: Create ZIP package
echo [9/10] Creating deployment package...
powershell -command "Compress-Archive -Path '%BUILD_DIR%\*' -DestinationPath '%PACKAGE_NAME%' -Force"
copy "%PACKAGE_NAME%" "%PROJECT_NAME%-latest.zip" >nul
echo ✓ Package created
echo.

REM Step 10: Calculate size
echo [10/10] Finalizing...
for %%A in ("%PACKAGE_NAME%") do set PACKAGE_SIZE=%%~zA
set /a PACKAGE_SIZE_MB=%PACKAGE_SIZE% / 1048576
echo ✓ Done
echo.

REM Summary
echo ========================================
echo ✓ Deployment Package Ready!
echo ========================================
echo.
echo 📦 Package: %PACKAGE_NAME%
echo 📊 Size: %PACKAGE_SIZE_MB% MB
echo.
echo Next Steps:
echo   1. Upload %PACKAGE_NAME% to your hosting
echo   2. Upload deploy.php to hosting root
echo   3. Visit http://yourdomain.com/deploy.php
echo   4. Follow the installation wizard
echo.
echo 🎉 Happy Deploying!
echo.

pause
