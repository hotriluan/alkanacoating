<?php
/**
 * OPTIMIZE SCRIPT
 * 
 * Upload file này vào backend/public/optimize.php
 * Truy cập: https://hotriluan.xyz/optimize.php
 * 
 * Script này chạy:
 * - php artisan config:clear
 * - php artisan cache:clear
 * - php artisan route:clear
 * - php artisan view:clear
 * - php artisan optimize
 * 
 * Sau khi chạy xong, NHỚ XÓA FILE NÀY!
 */

// Prevent running in production for security
$allowedIPs = ['127.0.0.1', '::1']; // Add your IP if needed
// if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', $allowedIPs)) {
//     http_response_code(403);
//     die('Access denied');
// }

?>
<!DOCTYPE html>
<html>
<head>
    <title>Alkana Coating - Optimize</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .output { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>⚙️ Alkana Coating Optimization</h1>

    <?php
    if (isset($_POST['run_optimize'])) {
        // Load Laravel
        require __DIR__.'/../vendor/autoload.php';
        $app = require_once __DIR__.'/../bootstrap/app.php';
        
        echo "<h2>🚀 Running Optimization Commands...</h2>";
        
        $commands = [
            'config:clear' => 'Clearing configuration cache',
            'cache:clear' => 'Clearing application cache',
            'route:clear' => 'Clearing route cache',
            'view:clear' => 'Clearing compiled views',
            'optimize' => 'Optimizing application'
        ];
        
        $results = [];
        
        foreach ($commands as $command => $description) {
            echo "<div class='output'>";
            echo "<strong>$description...</strong><br>";
            
            try {
                ob_start();
                \Illuminate\Support\Facades\Artisan::call($command);
                $output = ob_get_clean();
                
                echo "<pre>" . htmlspecialchars(\Illuminate\Support\Facades\Artisan::output()) . "</pre>";
                $results[$command] = true;
                echo "<span style='color: green;'>✅ Success</span>";
            } catch (Exception $e) {
                ob_end_clean();
                echo "<pre style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</pre>";
                $results[$command] = false;
                echo "<span style='color: red;'>❌ Failed</span>";
            }
            
            echo "</div>";
        }
        
        // Summary
        $successCount = count(array_filter($results));
        $totalCount = count($results);
        
        if ($successCount === $totalCount) {
            echo "<div class='success'>";
            echo "<strong>🎉 Optimization Complete!</strong><br>";
            echo "All $totalCount commands executed successfully.";
            echo "</div>";
        } else {
            echo "<div class='error'>";
            echo "<strong>⚠️ Optimization Completed with Errors</strong><br>";
            echo "$successCount out of $totalCount commands succeeded.";
            echo "</div>";
        }
        
        echo "<div class='warning'>";
        echo "<strong>⚠️ IMPORTANT:</strong> For security, please delete this file now!<br>";
        echo "Run in File Manager or SSH: <code>rm backend/public/optimize.php</code>";
        echo "</div>";
        
    } else {
        // Show form
        ?>
        <div class="warning">
            <strong>⚠️ Warning:</strong> This script will clear all cached data. 
            Your application may be slower on the next request while caches rebuild.
        </div>
        
        <h2>What will be cleared:</h2>
        <ul>
            <li>Configuration cache</li>
            <li>Application cache</li>
            <li>Route cache</li>
            <li>Compiled view files</li>
        </ul>
        
        <h2>What will be optimized:</h2>
        <ul>
            <li>Config files</li>
            <li>Routes</li>
            <li>Events</li>
        </ul>
        
        <form method="POST">
            <button type="submit" name="run_optimize" style="
                background: #007bff;
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin: 20px 0;
            ">
                🚀 Run Optimization
            </button>
        </form>
        
        <div class="warning" style="margin-top: 30px;">
            <strong>🔒 Security Note:</strong><br>
            This file should only be accessed during deployment/maintenance.<br>
            <strong>Delete this file immediately after use!</strong>
        </div>
        
        <hr>
        <h2>Alternative: Using SSH</h2>
        <p>If you have SSH access, you can run these commands manually:</p>
        <pre>cd /var/www/vhosts/.../hotriluan.xyz/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize</pre>
        <?php
    }
    ?>
</body>
</html>
