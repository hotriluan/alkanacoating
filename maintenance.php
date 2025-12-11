<?php
/**
 * Maintenance & Update Tool
 * Công cụ bảo trì và cập nhật cho Alkana Coating
 */

session_start();
define('TOOL_VERSION', '1.0.0');

// Simple auth
$ADMIN_PASSWORD = 'alkana2025'; // Đổi password này!

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        if (isset($_POST['password']) && $_POST['password'] === $ADMIN_PASSWORD) {
            $_SESSION['authenticated'] = true;
        } else {
            die(json_encode(['success' => false, 'message' => 'Wrong password']));
        }
    }
    
    handleAction($_POST['action']);
}

function handleAction($action) {
    switch ($action) {
        case 'clear_cache':
            clearCache();
            break;
        case 'optimize':
            optimizeApp();
            break;
        case 'storage_link':
            createStorageLink();
            break;
        case 'migrate':
            runMigrations();
            break;
        case 'check_health':
            checkHealth();
            break;
        case 'backup_db':
            backupDatabase();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
    }
    exit;
}

function clearCache() {
    $commands = [
        'cache:clear',
        'config:clear',
        'route:clear',
        'view:clear'
    ];
    
    $results = [];
    foreach ($commands as $cmd) {
        $output = runArtisan($cmd);
        $results[] = "$cmd: " . ($output ? 'OK' : 'Failed');
    }
    
    echo json_encode(['success' => true, 'message' => implode("\n", $results)]);
}

function optimizeApp() {
    $commands = [
        'config:cache',
        'route:cache',
        'view:cache',
        'optimize'
    ];
    
    $results = [];
    foreach ($commands as $cmd) {
        $output = runArtisan($cmd);
        $results[] = "$cmd: OK";
    }
    
    echo json_encode(['success' => true, 'message' => implode("\n", $results)]);
}

function createStorageLink() {
    $output = runArtisan('storage:link');
    echo json_encode(['success' => true, 'message' => 'Storage link created']);
}

function runMigrations() {
    $output = runArtisan('migrate --force');
    echo json_encode(['success' => true, 'message' => 'Migrations completed']);
}

function checkHealth() {
    $checks = [
        'PHP Version' => version_compare(PHP_VERSION, '8.1.0', '>='),
        'Backend Exists' => is_dir('backend'),
        'Frontend Exists' => is_dir('frontend'),
        '.env Exists' => file_exists('backend/.env'),
        'Storage Writable' => is_writable('backend/storage'),
        'Uploads Writable' => is_writable('backend/public/uploads'),
    ];
    
    $html = '<ul>';
    foreach ($checks as $check => $status) {
        $icon = $status ? '✅' : '❌';
        $html .= "<li>$icon $check</li>";
    }
    $html .= '</ul>';
    
    echo json_encode(['success' => true, 'message' => $html]);
}

function backupDatabase() {
    if (!file_exists('backend/.env')) {
        echo json_encode(['success' => false, 'message' => '.env not found']);
        return;
    }
    
    // Read DB config from .env
    $env = parse_ini_file('backend/.env');
    $host = $env['DB_HOST'] ?? 'localhost';
    $db = $env['DB_DATABASE'] ?? '';
    $user = $env['DB_USERNAME'] ?? '';
    $pass = $env['DB_PASSWORD'] ?? '';
    
    if (empty($db)) {
        echo json_encode(['success' => false, 'message' => 'DB config not found']);
        return;
    }
    
    $filename = 'backup_' . date('Y-m-d_His') . '.sql';
    $filepath = 'backend/storage/app/backups/' . $filename;
    
    @mkdir('backend/storage/app/backups', 0755, true);
    
    $command = "mysqldump -h $host -u $user";
    if (!empty($pass)) $command .= " -p$pass";
    $command .= " $db > $filepath 2>&1";
    
    exec($command, $output, $returnCode);
    
    if ($returnCode === 0 && file_exists($filepath)) {
        $size = filesize($filepath);
        echo json_encode([
            'success' => true, 
            'message' => "Backup created: $filename (" . round($size/1024/1024, 2) . " MB)"
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Backup failed: ' . implode("\n", $output)]);
    }
}

function runArtisan($command) {
    $php = PHP_BINARY;
    $artisan = __DIR__ . '/backend/artisan';
    
    if (!file_exists($artisan)) {
        return false;
    }
    
    $fullCommand = "cd backend && $php artisan $command 2>&1";
    $output = shell_exec($fullCommand);
    
    return $output;
}

?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance Tool - Alkana Coating</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content { padding: 30px; }
        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .tool-card {
            padding: 25px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
        }
        .tool-card:hover {
            border-color: #667eea;
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        .tool-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .tool-card h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .tool-card p {
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn:hover { background: #5568d3; }
        .result {
            margin-top: 20px;
            padding: 20px;
            border-radius: 8px;
            display: none;
        }
        .result.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .result.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .auth-form {
            max-width: 400px;
            margin: 50px auto;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .auth-form input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 14px;
        }
        .auth-form button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <?php if (!isset($_SESSION['authenticated'])): ?>
        <div class="auth-form">
            <h2 style="text-align: center; margin-bottom: 20px;">🔒 Authentication</h2>
            <form method="POST">
                <input type="password" name="password" placeholder="Enter password" required>
                <input type="hidden" name="action" value="auth">
                <button type="submit">Login</button>
            </form>
        </div>
    <?php else: ?>
        <div class="container">
            <div class="header">
                <h1>🛠️ Maintenance Tool</h1>
                <p>Version <?php echo TOOL_VERSION; ?></p>
            </div>
            
            <div class="content">
                <div class="tool-grid">
                    <div class="tool-card" onclick="runTool('clear_cache')">
                        <div class="tool-icon">🗑️</div>
                        <h3>Clear Cache</h3>
                        <p>Xóa cache, config, routes, views</p>
                    </div>
                    
                    <div class="tool-card" onclick="runTool('optimize')">
                        <div class="tool-icon">⚡</div>
                        <h3>Optimize</h3>
                        <p>Cache config, routes, views để tăng tốc</p>
                    </div>
                    
                    <div class="tool-card" onclick="runTool('storage_link')">
                        <div class="tool-icon">🔗</div>
                        <h3>Storage Link</h3>
                        <p>Tạo symlink cho storage</p>
                    </div>
                    
                    <div class="tool-card" onclick="runTool('migrate')">
                        <div class="tool-icon">🗄️</div>
                        <h3>Run Migrations</h3>
                        <p>Chạy database migrations</p>
                    </div>
                    
                    <div class="tool-card" onclick="runTool('check_health')">
                        <div class="tool-icon">❤️</div>
                        <h3>Health Check</h3>
                        <p>Kiểm tra tình trạng hệ thống</p>
                    </div>
                    
                    <div class="tool-card" onclick="runTool('backup_db')">
                        <div class="tool-icon">💾</div>
                        <h3>Backup Database</h3>
                        <p>Sao lưu database</p>
                    </div>
                </div>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p style="margin-top: 15px;">Processing...</p>
                </div>
                
                <div class="result" id="result"></div>
            </div>
        </div>
    <?php endif; ?>
    
    <script>
        function runTool(action) {
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            
            loading.style.display = 'block';
            result.style.display = 'none';
            
            const formData = new FormData();
            formData.append('action', action);
            
            fetch('', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                loading.style.display = 'none';
                result.style.display = 'block';
                result.className = 'result ' + (data.success ? 'success' : 'error');
                result.innerHTML = '<strong>' + (data.success ? '✅ Success' : '❌ Error') + '</strong><br>' + data.message.replace(/\n/g, '<br>');
            })
            .catch(error => {
                loading.style.display = 'none';
                result.style.display = 'block';
                result.className = 'result error';
                result.innerHTML = '<strong>❌ Error</strong><br>' + error.message;
            });
        }
    </script>
</body>
</html>
