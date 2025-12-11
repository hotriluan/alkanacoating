<?php
/**
 * Script to fix upload directory permissions for production
 * Run this after deployment: php scripts/fix_upload_permissions.php
 */

$publicPath = dirname(__DIR__) . '/public';
$uploadDirs = [
    'uploads',
    'uploads/settings',
    'uploads/posts',
    'uploads/categories',
    'uploads/products',
    'uploads/projects',
    'uploads/sliders',
    'uploads/menus',
];

echo "=== Fixing Upload Directory Permissions ===\n\n";

foreach ($uploadDirs as $dir) {
    $fullPath = $publicPath . '/' . $dir;
    
    // Create directory if it doesn't exist
    if (!is_dir($fullPath)) {
        if (mkdir($fullPath, 0755, true)) {
            echo "✓ Created: {$dir}\n";
        } else {
            echo "✗ Failed to create: {$dir}\n";
            continue;
        }
    } else {
        echo "✓ Exists: {$dir}\n";
    }
    
    // Check if writable
    if (!is_writable($fullPath)) {
        // Try to fix permissions
        if (chmod($fullPath, 0755)) {
            echo "  → Fixed permissions (0755)\n";
        } else {
            echo "  → Warning: Could not set permissions. Please run: chmod 755 {$fullPath}\n";
        }
    } else {
        echo "  → Writable\n";
    }
}

echo "\n=== Checking Web Server User ===\n";
$currentUser = posix_getpwuid(posix_geteuid());
echo "Current user: " . $currentUser['name'] . "\n";
echo "User ID: " . posix_geteuid() . "\n";
echo "Group ID: " . posix_getegid() . "\n";

echo "\n=== Summary ===\n";
echo "If uploads still fail on production:\n";
echo "1. Run as web server user: sudo -u www-data php scripts/fix_upload_permissions.php\n";
echo "2. Or set ownership: sudo chown -R www-data:www-data public/uploads\n";
echo "3. Ensure .htaccess allows file access\n";
echo "4. Check disk space: df -h\n";
echo "5. Check SELinux/AppArmor if enabled\n";

echo "\n✓ Done!\n";
