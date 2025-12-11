# Create installer.php with all fixes integrated
$installerContent = @'
<?php
/**
 * ALKANA COATING - WordPress-Style Installer v2.0
 * Complete automated deployment for XAMPP subdirectory installations
 * Includes all critical fixes for authentication and routing
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration - installer is now in backend/public/
define('INSTALL_DIR', dirname(__DIR__)); // Go up from public/ to backend/
define('BACKEND_DIR', INSTALL_DIR); // backend/ is the root

session_start();

// Installation steps
$steps = [
    1 => 'System Check',
    2 => 'Database Configuration',
    3 => 'Application Setup',
    4 => 'Database Import',
    5 => 'Complete'
];

$currentStep = isset($_GET['step']) ? (int)$_GET['step'] : 1;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($currentStep === 2) {
        // Save database configuration
    $_SESSION['db_host'] = $_POST['db_host'] ?? 'localhost';
    $_SESSION['db_port'] = $_POST['db_port'] ?? '3306';
    $_SESSION['db_name'] = $_POST['db_name'] ?? 'alk71747_hotriluan';
    $_SESSION['db_user'] = $_POST['db_user'] ?? 'alk71747_hotriluan';
    $_SESSION['db_pass'] = $_POST['db_pass'] ?? 'alkana123';
    $_SESSION['app_url'] = $_POST['app_url'] ?? 'https://hotriluan.xyz';
        
        // Test database connection
        try {
            $dsn = "mysql:host={$_SESSION['db_host']};port={$_SESSION['db_port']}";
            $pdo = new PDO($dsn, $_SESSION['db_user'], $_SESSION['db_pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$_SESSION['db_name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            header('Location: ?step=3');
            exit;
        } catch (PDOException $e) {
            $error = "Database connection failed: " . $e->getMessage();
        }
    } elseif ($currentStep === 3) {
        // Create .env file
        $envContent = "APP_NAME=\"Alkana Coating\"
APP_ENV=production
APP_KEY=base64:" . base64_encode(random_bytes(32)) . "
APP_DEBUG=false
APP_URL={$_SESSION['app_url']}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST={$_SESSION['db_host']}
DB_PORT={$_SESSION['db_port']}
DB_DATABASE={$_SESSION['db_name']}
DB_USERNAME={$_SESSION['db_user']}
DB_PASSWORD={$_SESSION['db_pass']}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=hotriluan.xyz,https://hotriluan.xyz,localhost,127.0.0.1

VITE_API_URL={$_SESSION['app_url']}/api
";
        
        file_put_contents(BACKEND_DIR . '/.env', $envContent);
        
        // Set proper permissions
        chmod(BACKEND_DIR . '/storage', 0775);
        chmod(BACKEND_DIR . '/bootstrap/cache', 0775);
        
        // Apply critical fixes to config/auth.php (add sanctum guard)
        $authConfigPath = BACKEND_DIR . '/config/auth.php';
        $authConfig = file_get_contents($authConfigPath);
        
        // Check if sanctum guard exists
        if (strpos($authConfig, "'sanctum' =>") === false) {
            // Add sanctum guard after web guard
            $authConfig = preg_replace(
                "/'web' => \[[\s\S]*?\],/",
                "$0\n\n        'sanctum' => [\n            'driver' => 'sanctum',\n            'provider' => null,\n        ],",
                $authConfig,
                1
            );
            file_put_contents($authConfigPath, $authConfig);
        }
        
        header('Location: ?step=4');
        exit;
    } elseif ($currentStep === 4) {
        // Import database
        try {
            $dsn = "mysql:host={$_SESSION['db_host']};port={$_SESSION['db_port']};dbname={$_SESSION['db_name']}";
            $pdo = new PDO($dsn, $_SESSION['db_user'], $_SESSION['db_pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $sqlFile = BACKEND_DIR . '/alkanacoating_production.sql';
            if (file_exists($sqlFile)) {
                // Use mysql command line for reliable import
                $cmd = sprintf(
                    'mysql -h%s -P%s -u%s %s %s < %s 2>&1',
                    escapeshellarg($_SESSION['db_host']),
                    escapeshellarg($_SESSION['db_port']),
                    escapeshellarg($_SESSION['db_user']),
                    !empty($_SESSION['db_pass']) ? '-p' . escapeshellarg($_SESSION['db_pass']) : '',
                    escapeshellarg($_SESSION['db_name']),
                    escapeshellarg($sqlFile)
                );
                
                $output = [];
                $return_var = 0;
                exec($cmd, $output, $return_var);
                
                if ($return_var !== 0) {
                    throw new Exception("MySQL import failed: " . implode("\n", $output));
                }
            }
            
            // Run Laravel commands
            $phpPath = PHP_BINARY;
            $artisan = BACKEND_DIR . '/artisan';
            
            // Clear caches
            exec("cd " . escapeshellarg(BACKEND_DIR) . " && $phpPath artisan config:clear");
            exec("cd " . escapeshellarg(BACKEND_DIR) . " && $phpPath artisan route:clear");
            exec("cd " . escapeshellarg(BACKEND_DIR) . " && $phpPath artisan cache:clear");
            
            // Create storage link
            exec("cd " . escapeshellarg(BACKEND_DIR) . " && $phpPath artisan storage:link");
            
            $_SESSION['install_complete'] = true;
            header('Location: ?step=5');
            exit;
        } catch (Exception $e) {
            $error = "Database import failed: " . $e->getMessage();
        }
    }
}

?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alkana Coating - Installer v2.0</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .progress {
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        .progress-step {
            flex: 1;
            text-align: center;
            position: relative;
            font-size: 12px;
            color: #6c757d;
        }
        .progress-step.active { color: #667eea; font-weight: 600; }
        .progress-step.completed { color: #28a745; }
        .progress-step::before {
            content: attr(data-step);
            display: block;
            width: 30px;
            height: 30px;
            margin: 0 auto 5px;
            background: #e9ecef;
            border-radius: 50%;
            line-height: 30px;
            font-weight: bold;
        }
        .progress-step.active::before { background: #667eea; color: white; }
        .progress-step.completed::before { background: #28a745; color: white; content: "✓"; }
        .content {
            padding: 40px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-group small {
            display: block;
            margin-top: 5px;
            color: #6c757d;
            font-size: 12px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            text-decoration: none;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn:active { transform: translateY(0); }
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .alert-danger {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        .check-list {
            list-style: none;
            padding: 0;
        }
        .check-list li {
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 6px;
            display: flex;
            align-items: center;
        }
        .check-list li.success::before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            margin-right: 10px;
        }
        .check-list li.error::before {
            content: "✗";
            color: #dc3545;
            font-weight: bold;
            margin-right: 10px;
        }
        .success-box {
            text-align: center;
            padding: 40px;
        }
        .success-box .icon {
            font-size: 64px;
            color: #28a745;
            margin-bottom: 20px;
        }
        .success-box h2 {
            color: #333;
            margin-bottom: 10px;
        }
        .success-box p {
            color: #6c757d;
            margin-bottom: 20px;
        }
        .credentials {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: left;
        }
        .credentials h3 {
            margin-bottom: 15px;
            color: #333;
        }
        .credentials code {
            background: white;
            padding: 4px 8px;
            border-radius: 3px;
            color: #667eea;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ALKANA COATING</h1>
            <p>WordPress-Style Installer v2.0 - Complete Automated Deployment</p>
        </div>
        
        <div class="progress">
            <?php foreach ($steps as $num => $name): ?>
                <div class="progress-step <?php 
                    echo $num < $currentStep ? 'completed' : ($num === $currentStep ? 'active' : ''); 
                ?>" data-step="<?= $num ?>">
                    <?= $name ?>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="content">
            <?php if (isset($error)): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            
            <?php if ($currentStep === 1): ?>
                <h2>System Requirements Check</h2>
                <p style="margin: 20px 0; color: #6c757d;">Checking if your server meets the requirements...</p>
                
                <ul class="check-list">
                    <li class="<?= version_compare(PHP_VERSION, '8.0.0', '>=') ? 'success' : 'error' ?>">
                        PHP Version: <?= PHP_VERSION ?> (Required: 8.0+)
                    </li>
                    <li class="<?= extension_loaded('pdo') ? 'success' : 'error' ?>">
                        PDO Extension
                    </li>
                    <li class="<?= extension_loaded('pdo_mysql') ? 'success' : 'error' ?>">
                        PDO MySQL Extension
                    </li>
                    <li class="<?= extension_loaded('mbstring') ? 'success' : 'error' ?>">
                        Mbstring Extension
                    </li>
                    <li class="<?= extension_loaded('openssl') ? 'success' : 'error' ?>">
                        OpenSSL Extension
                    </li>
                    <li class="<?= extension_loaded('fileinfo') ? 'success' : 'error' ?>">
                        Fileinfo Extension
                    </li>
                    <li class="<?= is_writable(BACKEND_DIR . '/storage') ? 'success' : 'error' ?>">
                        Storage Directory Writable
                    </li>
                    <li class="<?= is_writable(BACKEND_DIR . '/bootstrap/cache') ? 'success' : 'error' ?>">
                        Bootstrap Cache Writable
                    </li>
                </ul>
                
                <div style="margin-top: 30px;">
                    <a href="?step=2" class="btn">Continue to Database Setup →</a>
                </div>
                
            <?php elseif ($currentStep === 2): ?>
                <h2>Database Configuration</h2>
                <p style="margin: 20px 0; color: #6c757d;">Enter your database connection details</p>
                
                <form method="POST">
                    <div class="form-group">
                        <label>Database Host</label>
                        <input type="text" name="db_host" value="127.0.0.1" required>
                        <small>Usually 127.0.0.1 or localhost</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Port</label>
                        <input type="text" name="db_port" value="3306" required>
                        <small>Default MySQL port is 3306</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Name</label>
                        <input type="text" name="db_name" value="alkanacoating" required>
                        <small>Will be created if it doesn't exist</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Username</label>
                        <input type="text" name="db_user" value="root" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Password</label>
                        <input type="password" name="db_pass" placeholder="Leave empty if no password">
                    </div>
                    
                    <div class="form-group">
                        <label>Application URL</label>
                        <input type="text" name="app_url" value="https://hotriluan.xyz" required>
                        <small>The full URL where your application will be accessible</small>
                    </div>
                    
                    <button type="submit" class="btn">Test Connection & Continue →</button>
                </form>
                
            <?php elseif ($currentStep === 3): ?>
                <h2>Application Setup</h2>
                <p style="margin: 20px 0; color: #6c757d;">Configuring your application...</p>
                
                <div class="alert alert-success">
                    ✓ Environment file will be created<br>
                    ✓ Application key will be generated<br>
                    ✓ Sanctum authentication configured<br>
                    ✓ Storage permissions set
                </div>
                
                <form method="POST">
                    <button type="submit" class="btn">Create Configuration →</button>
                </form>
                
            <?php elseif ($currentStep === 4): ?>
                <h2>Database Import</h2>
                <p style="margin: 20px 0; color: #6c757d;">Importing database structure and sample data...</p>
                
                <div class="alert alert-warning">
                    <strong>Note:</strong> This will import the complete database including admin user and sample data.
                </div>
                
                <form method="POST">
                    <button type="submit" class="btn">Import Database →</button>
                </form>
                
            <?php elseif ($currentStep === 5): ?>
                <div class="success-box">
                    <div class="icon">🎉</div>
                    <h2>Installation Complete!</h2>
                    <p>Your Alkana Coating application has been successfully installed.</p>
                    
                    <div class="credentials">
                        <h3>Admin Credentials</h3>
                        <p><strong>URL:</strong> <code><?= $_SESSION['app_url'] ?>/admin/login</code></p>
                        <p><strong>Email:</strong> <code>admin@alkanacoating.com</code></p>
                        <p><strong>Password:</strong> <code>admin123</code></p>
                    </div>
                    
                    <div class="alert alert-warning">
                        <strong>Important Security Steps:</strong><br>
                        1. Delete installer.php from your server<br>
                        2. Change the admin password after first login<br>
                        3. Review .env file for production settings
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <a href="<?= $_SESSION['app_url'] ?>" class="btn" style="margin-right: 10px;">Visit Website</a>
                        <a href="<?= $_SESSION['app_url'] ?>/admin/login" class="btn">Admin Login</a>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
'@

# Save to backend/public/ instead of root
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$targetPath = Join-Path $scriptDir "build-v2\backend\public\installer.php"
$targetDir = Split-Path $targetPath -Parent

# Ensure directory exists
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$installerContent | Out-File -FilePath $targetPath -Encoding UTF8 -NoNewline
Write-Host "Installer created: build-v2\backend\public\installer.php" -ForegroundColor Green
