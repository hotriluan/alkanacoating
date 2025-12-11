#!/bin/bash

###############################################################################
# Alkana Coating - One-Command Deployment Script
# Usage: ./deploy.sh [environment] [version]
# Example: ./deploy.sh production v1.2.3
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-$(date +%Y%m%d_%H%M%S)}
PROJECT_NAME="alkana-coating"
BUILD_DIR="build"
RELEASES_DIR="releases"
CURRENT_LINK="current"
SHARED_DIR="shared"
KEEP_RELEASES=5

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Alkana Coating Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Version: ${GREEN}$VERSION${NC}"
echo ""

# Function to print step
step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Check prerequisites
step "Step 1: Checking prerequisites..."
command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { error "npm is required but not installed."; exit 1; }
command -v php >/dev/null 2>&1 || { error "PHP is required but not installed."; exit 1; }
command -v composer >/dev/null 2>&1 || { error "Composer is required but not installed."; exit 1; }
success "All prerequisites met"

# Step 2: Clean build directory
step "Step 2: Cleaning build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
success "Build directory ready"

# Step 3: Build frontend
step "Step 3: Building frontend..."
cd frontend
npm ci --silent
npm run build
cd ..
success "Frontend built successfully"

# Step 4: Install backend dependencies
step "Step 4: Installing backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader --quiet
cd ..
success "Backend dependencies installed"

# Step 5: Copy files
step "Step 5: Copying files to build directory..."

# Backend
rsync -a --exclude='node_modules' --exclude='.git' --exclude='tests' \
      --exclude='storage/logs/*' --exclude='storage/framework/cache/*' \
      --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' \
      backend/ "$BUILD_DIR/backend/"

# Frontend
cp -r frontend/dist "$BUILD_DIR/frontend"

# Deployment files
cp deploy.php "$BUILD_DIR/"
cp README.md "$BUILD_DIR/" 2>/dev/null || true
cp DEPLOYMENT_GUIDE.md "$BUILD_DIR/" 2>/dev/null || true

success "Files copied"

# Step 6: Create .htaccess files
step "Step 6: Creating .htaccess files..."

# Backend .htaccess
cat > "$BUILD_DIR/backend/public/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF

# Frontend .htaccess
cat > "$BUILD_DIR/frontend/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
EOF

success ".htaccess files created"

# Step 7: Create environment file template
step "Step 7: Creating environment template..."
cat > "$BUILD_DIR/backend/.env.example" << 'EOF'
APP_NAME="Alkana Coating"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alkana_coating
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com
EOF

success "Environment template created"

# Step 8: Create deployment info
step "Step 8: Creating deployment info..."
cat > "$BUILD_DIR/DEPLOYMENT_INFO.txt" << EOF
═══════════════════════════════════════════════════
  ALKANA COATING - DEPLOYMENT PACKAGE
═══════════════════════════════════════════════════

Version: $VERSION
Environment: $ENVIRONMENT
Build Date: $(date)
Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")

═══════════════════════════════════════════════════
  QUICK START
═══════════════════════════════════════════════════

1. Upload all files to your hosting
2. Visit: http://yourdomain.com/deploy.php
3. Follow the installation wizard
4. Delete deploy.php after installation

═══════════════════════════════════════════════════
  MANUAL DEPLOYMENT (Advanced)
═══════════════════════════════════════════════════

1. Configure backend/.env with your database credentials
2. Run: php artisan migrate --force
3. Run: php artisan db:seed --force
4. Set permissions:
   chmod -R 755 storage/
   chmod -R 755 bootstrap/cache/
5. Point web server to frontend/ for web and backend/public/ for API

═══════════════════════════════════════════════════

For detailed instructions, see DEPLOYMENT_GUIDE.md
EOF

success "Deployment info created"

# Step 9: Create archive
step "Step 9: Creating deployment package..."
PACKAGE_NAME="${PROJECT_NAME}-${VERSION}.zip"
cd "$BUILD_DIR"
zip -r -q "../$PACKAGE_NAME" .
cd ..

# Also create a 'latest' symlink
cp "$PACKAGE_NAME" "${PROJECT_NAME}-latest.zip"

success "Package created: $PACKAGE_NAME"

# Step 10: Calculate checksums
step "Step 10: Calculating checksums..."
if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$PACKAGE_NAME" > "$PACKAGE_NAME.sha256"
    success "SHA256: $(cat $PACKAGE_NAME.sha256)"
elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$PACKAGE_NAME" > "$PACKAGE_NAME.sha256"
    success "SHA256: $(cat $PACKAGE_NAME.sha256)"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Package Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📦 Package: ${BLUE}$PACKAGE_NAME${NC}"
echo -e "📊 Size: ${BLUE}$(du -h $PACKAGE_NAME | cut -f1)${NC}"
echo -e "🔐 SHA256: ${BLUE}$(cat $PACKAGE_NAME.sha256 2>/dev/null | cut -d' ' -f1)${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Upload $PACKAGE_NAME to your hosting"
echo -e "  2. Upload deploy.php to hosting root"
echo -e "  3. Visit http://yourdomain.com/deploy.php"
echo -e "  4. Follow the installation wizard"
echo ""
echo -e "${GREEN}🎉 Happy Deploying!${NC}"
echo ""
