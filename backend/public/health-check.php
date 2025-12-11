<?php
/**
 * HEALTH CHECK SCRIPT
 * 
 * Upload file này vào backend/public/health-check.php
 * Truy cập: https://hotriluan.xyz/health-check.php
 * 
 * Script này kiểm tra:
 * - PHP version
 * - Database connection
 * - File permissions
 * - Required extensions
 * - Storage và cache directories
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
    <title>Alkana Coating - Health Check</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .check { margin: 15px 0; padding: 10px; border-radius: 5px; }
        .pass { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .fail { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .warn { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .status { font-weight: bold; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🏥 Alkana Coating Health Check</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

    <?php
    $basePath = dirname(__DIR__);
    $checks = [];

    // Check 1: PHP Version
    $phpVersion = PHP_VERSION;
    $minPhpVersion = '8.0.0';
    $checks[] = [
        'name' => 'PHP Version',
        'status' => version_compare($phpVersion, $minPhpVersion, '>='),
        'message' => "PHP $phpVersion (Required: >= $minPhpVersion)"
    ];

    // Check 2: Required PHP Extensions
    $requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'openssl', 'json', 'tokenizer', 'gd'];
    foreach ($requiredExtensions as $ext) {
        $checks[] = [
            'name' => "Extension: $ext",
            'status' => extension_loaded($ext),
            'message' => extension_loaded($ext) ? 'Loaded' : 'Not loaded'
        ];
    }

    // Check 3: .env file exists
    $envPath = $basePath . '/.env';
    $checks[] = [
        'name' => '.env File',
        'status' => file_exists($envPath),
        'message' => file_exists($envPath) ? 'Found at ' . $envPath : 'Not found! Copy from .env.example'
    ];

    // Check 4: Database Connection
    if (file_exists($envPath)) {
        $env = parse_ini_file($envPath);
        $dbHost = $env['DB_HOST'] ?? 'localhost';
        $dbName = $env['DB_DATABASE'] ?? '';
        $dbUser = $env['DB_USERNAME'] ?? '';
        $dbPass = $env['DB_PASSWORD'] ?? '';

        try {
            $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            $checks[] = [
                'name' => 'Database Connection',
                'status' => true,
                'message' => "Connected to $dbName on $dbHost"
            ];

            // Check tables exist
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $requiredTables = ['users', 'categories', 'products', 'sliders', 'posts', 'projects', 'settings'];
            $missingTables = array_diff($requiredTables, $tables);
            
            $checks[] = [
                'name' => 'Database Tables',
                'status' => empty($missingTables),
                'message' => empty($missingTables) 
                    ? count($tables) . ' tables found' 
                    : 'Missing: ' . implode(', ', $missingTables)
            ];

        } catch (PDOException $e) {
            $checks[] = [
                'name' => 'Database Connection',
                'status' => false,
                'message' => 'Failed: ' . $e->getMessage()
            ];
        }
    }

    // Check 5: APP_KEY
    if (file_exists($envPath)) {
        $env = parse_ini_file($envPath);
        $appKey = $env['APP_KEY'] ?? '';
        $checks[] = [
            'name' => 'APP_KEY',
            'status' => !empty($appKey) && strlen($appKey) > 10,
            'message' => !empty($appKey) ? 'Set (' . substr($appKey, 0, 20) . '...)' : 'Not set! Run: php artisan key:generate'
        ];
    }

    // Check 6: Storage Permissions
    $storageChecks = [
        'storage' => $basePath . '/storage',
        'storage/app' => $basePath . '/storage/app',
        'storage/framework' => $basePath . '/storage/framework',
        'storage/logs' => $basePath . '/storage/logs',
        'bootstrap/cache' => $basePath . '/bootstrap/cache',
    ];

    foreach ($storageChecks as $name => $path) {
        $writable = is_writable($path);
        $perms = $writable ? substr(sprintf('%o', fileperms($path)), -4) : 'N/A';
        $checks[] = [
            'name' => "Writable: $name",
            'status' => $writable,
            'message' => $writable ? "Permissions: $perms" : "Not writable! Set to 775"
        ];
    }

    // Check 7: Storage Symlink
    $publicStorage = dirname(__DIR__) . '/public/storage';
    $symlinkExists = is_link($publicStorage) || is_dir($publicStorage);
    $checks[] = [
        'name' => 'Storage Symlink',
        'status' => $symlinkExists,
        'message' => $symlinkExists 
            ? 'Created at public/storage' 
            : 'Not found! Run: php artisan storage:link'
    ];

    // Check 8: Log file
    $logFile = $basePath . '/storage/logs/laravel.log';
    if (file_exists($logFile)) {
        $logSize = filesize($logFile);
        $logSizeMB = round($logSize / 1024 / 1024, 2);
        $checks[] = [
            'name' => 'Log File',
            'status' => $logSize < 10485760, // < 10MB
            'message' => "Size: {$logSizeMB}MB" . ($logSize > 10485760 ? ' (Consider clearing)' : '')
        ];
    }

    // Display Results
    echo "<h2>📋 Check Results</h2>";
    $passCount = 0;
    $failCount = 0;
    $warnCount = 0;

    foreach ($checks as $check) {
        $class = $check['status'] ? 'pass' : 'fail';
        $icon = $check['status'] ? '✅' : '❌';
        
        if ($check['status']) {
            $passCount++;
        } else {
            $failCount++;
        }

        echo "<div class='check $class'>";
        echo "<span class='status'>$icon {$check['name']}</span><br>";
        echo "<small>{$check['message']}</small>";
        echo "</div>";
    }

    // Summary
    echo "<h2>📊 Summary</h2>";
    echo "<div class='check " . ($failCount === 0 ? 'pass' : 'warn') . "'>";
    echo "<strong>Total Checks:</strong> " . count($checks) . "<br>";
    echo "<strong>✅ Passed:</strong> $passCount<br>";
    echo "<strong>❌ Failed:</strong> $failCount<br>";
    
    if ($failCount === 0) {
        echo "<p style='margin-top: 15px;'><strong>🎉 All checks passed! System is healthy.</strong></p>";
    } else {
        echo "<p style='margin-top: 15px;'><strong>⚠️ Please fix the failed checks above.</strong></p>";
    }
    echo "</div>";

    // Server Info
    echo "<h2>ℹ️ Server Information</h2>";
    echo "<pre>";
    echo "PHP Version: " . PHP_VERSION . "\n";
    echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
    echo "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "\n";
    echo "Script Path: " . __FILE__ . "\n";
    echo "Base Path: " . $basePath . "\n";
    echo "Memory Limit: " . ini_get('memory_limit') . "\n";
    echo "Max Execution Time: " . ini_get('max_execution_time') . "s\n";
    echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "\n";
    echo "</pre>";

    // Recent Logs (if exists)
    if (file_exists($logFile)) {
        echo "<h2>📝 Recent Logs (Last 20 lines)</h2>";
        $lines = file($logFile);
        $recentLines = array_slice($lines, -20);
        echo "<pre style='max-height: 300px; overflow-y: auto;'>";
        echo htmlspecialchars(implode('', $recentLines));
        echo "</pre>";
    }

    echo "<hr>";
    echo "<p><small><strong>⚠️ Security Note:</strong> Delete this file after checking! (<code>rm backend/public/health-check.php</code>)</small></p>";
    ?>
</body>
</html>
