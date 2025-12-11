#!/bin/bash

# Production Upload Setup Script
# This script ensures all upload directories exist with correct permissions

echo "=== Setting up upload directories for production ==="

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Create upload directories
UPLOAD_DIRS=(
    "public/uploads"
    "public/uploads/settings"
    "public/uploads/posts"
    "public/uploads/categories"
    "public/uploads/products"
    "public/uploads/projects"
    "public/uploads/sliders"
    "public/uploads/menus"
)

for dir in "${UPLOAD_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "✓ Created: $dir"
    else
        echo "✓ Exists: $dir"
    fi
    
    # Set permissions
    chmod 755 "$dir"
    echo "  → Set permissions (0755)"
done

# Check if running as root and set ownership
if [ "$EUID" -eq 0 ]; then
    WEB_USER=${WEB_USER:-www-data}
    echo ""
    echo "Running as root. Setting ownership to $WEB_USER..."
    chown -R "$WEB_USER":"$WEB_USER" public/uploads
    echo "✓ Ownership set to $WEB_USER:$WEB_USER"
else
    echo ""
    echo "⚠ Not running as root. If uploads fail, run:"
    echo "   sudo chown -R www-data:www-data backend/public/uploads"
fi

# Check .htaccess
HTACCESS="public/uploads/.htaccess"
if [ ! -f "$HTACCESS" ]; then
    cat > "$HTACCESS" << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine Off
</IfModule>

<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|pdf)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
EOF
    echo ""
    echo "✓ Created .htaccess for uploads directory"
fi

echo ""
echo "=== Setup Complete ==="
echo "All upload directories are ready!"
echo ""
echo "If uploads still fail, check:"
echo "1. Disk space: df -h"
echo "2. SELinux: sudo setenforce 0 (temporary)"
echo "3. PHP max_upload_size and post_max_size in php.ini"
echo "4. Web server error logs"
