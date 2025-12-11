<?php
/**
 * Auto Deployment Script for Alkana Coating
 * Similar to WordPress/Joomla Kickstart
 * 
 * Upload this file + alkana-coating.zip to hosting root
 * Access: http://yourdomain.com/deploy.php
 * Follow the wizard to auto-install
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('VERSION', '1.0.2');
define('SCRIPT_NAME', 'Alkana Coating Installer');

// Check PHP version
if (version_compare(PHP_VERSION, '8.1.0', '<')) {
    die('Error: PHP 8.1 or higher required. Current: ' . PHP_VERSION);
}

session_start();

// Main installer class
class AlkanaInstaller
{
    private $steps = ['upload', 'extract', 'publish', 'database', 'configure', 'migrate', 'complete'];
    private $currentStep = 0;
    private $errors = [];
    private $zipFile = 'alkana-coating.zip';

    public function __construct()
    {
        $this->currentStep = isset($_GET['step']) ? (int) $_GET['step'] : 0;
    }

    public function run()
    {
        try {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->handlePost();
            }

            $this->renderPage();
        } catch (Throwable $e) {
            $this->renderError($e);
        }
    }

    private function renderError($e)
    {
        ?>
        <!DOCTYPE html>
        <html>

        <head>
            <title>Installer Error</title>
            <style>
                body {
                    font-family: sans-serif;
                    padding: 40px;
                    background: #f8d7da;
                    color: #721c24;
                }

                .error-box {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    margin-top: 0;
                }

                pre {
                    background: #f8f9fa;
                    padding: 15px;
                    overflow-x: auto;
                    border-radius: 4px;
                }
            </style>
        </head>

        <body>
            <div class="error-box">
                <h1>⚠️ Fatal Error</h1>
                <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
                <pre><?php echo htmlspecialchars($e->getTraceAsString()); ?></pre>
            </div>
        </body>

        </html>
        <?php
    }

    private function handlePost()
    {
        switch ($this->currentStep) {
            case 0: // Upload
                $this->handleUpload();
                break;
            case 1: // Extract
                $this->handleExtract();
                break;
            case 2: // Publish
                $this->handlePublish();
                break;
            case 3: // Database
                $this->handleDatabase();
                break;
            case 4: // Configure
                $this->handleConfigure();
                break;
            case 5: // Migrate
                $this->handleMigrate();
                break;
        }
    }

    private function handleUpload()
    {
        if (isset($_FILES['zipfile']) && $_FILES['zipfile']['error'] === UPLOAD_ERR_OK) {
            if (move_uploaded_file($_FILES['zipfile']['tmp_name'], $this->zipFile)) {
                $_SESSION['upload_success'] = true;
                header('Location: ?step=1');
                exit;
            } else {
                $this->errors[] = 'Failed to save uploaded file';
            }
        } elseif (file_exists($this->zipFile)) {
            $_SESSION['upload_success'] = true;
            header('Location: ?step=1');
            exit;
        } else {
            $this->errors[] = 'Please upload alkana-coating.zip file';
        }
    }

    private function handleExtract()
    {
        if (!class_exists('ZipArchive')) {
            $this->errors[] = 'ZipArchive extension not available';
            return;
        }

        $zip = new ZipArchive;
        if ($zip->open($this->zipFile) === TRUE) {
            // Check the structure of the ZIP file
            $hasRootFolder = false;
            $rootFolderName = null;

            // Analyze first few entries to determine structure
            for ($i = 0; $i < min($zip->numFiles, 10); $i++) {
                $filename = $zip->getNameIndex($i);

                // Skip macOS metadata files
                if (strpos($filename, '__MACOSX') !== false || strpos($filename, '.DS_Store') !== false) {
                    continue;
                }

                // Check if files are in a root folder
                $parts = explode('/', $filename);
                if (count($parts) > 1) {
                    // Has folder structure
                    if ($rootFolderName === null) {
                        $rootFolderName = $parts[0];
                        $hasRootFolder = true;
                    } elseif ($parts[0] !== $rootFolderName) {
                        // Mixed structure or multiple root folders
                        $hasRootFolder = false;
                        break;
                    }
                } else {
                    // Files at root level
                    $hasRootFolder = false;
                    break;
                }
            }

            // Extract to a temporary directory first
            $tempDir = __DIR__ . '/temp_extract_' . time();
            mkdir($tempDir, 0755, true);

            $zip->extractTo($tempDir);
            $zip->close();

            // Now move files to the correct location
            if ($hasRootFolder && $rootFolderName) {
                // Files are wrapped in a root folder, need to move them up
                $sourceDir = $tempDir . '/' . $rootFolderName;

                if (is_dir($sourceDir)) {
                    $this->moveExtractedFiles($sourceDir, __DIR__);

                    // Clean up temp directory
                    $this->recursiveRemoveDirectory($tempDir);
                } else {
                    $this->errors[] = 'Unexpected ZIP structure: root folder not found';
                    $this->recursiveRemoveDirectory($tempDir);
                    return;
                }
            } else {
                // Files are at root level, move directly
                $this->moveExtractedFiles($tempDir, __DIR__);

                // Clean up temp directory
                $this->recursiveRemoveDirectory($tempDir);
            }

            $_SESSION['extract_success'] = true;
            header('Location: ?step=2');
            exit;
        } else {
            $this->errors[] = 'Failed to open ZIP file';
        }
    }

    private function moveExtractedFiles($source, $dest)
    {
        $files = scandir($source);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..')
                continue;

            // Skip macOS metadata
            if ($file === '__MACOSX' || $file === '.DS_Store')
                continue;

            // Skip directory entries (files ending with / or \)
            // These are directory markers in ZIP archives, not actual content
            if (substr($file, -1) === '/' || substr($file, -1) === '\\')
                continue;

            $sourcePath = $source . '/' . $file;

            // Handle backslashes in filenames (common issue when ZIP created on Windows is extracted on Linux)
            // e.g. "backend\gitignore" instead of "backend/gitignore"
            $normalizedFile = str_replace('\\', '/', $file);
            $destPath = $dest . '/' . $normalizedFile;

            if (is_dir($sourcePath)) {
                if (!is_dir($destPath)) {
                    mkdir($destPath, 0755, true);
                }
                $this->moveExtractedFiles($sourcePath, $destPath);
            } else {
                // Ensure destination directory exists (for the case of "backend\file.txt")
                $destDir = dirname($destPath);
                if (!is_dir($destDir)) {
                    mkdir($destDir, 0755, true);
                }

                // Move file
                if (file_exists($destPath) && $file !== 'deploy.php') {
                    unlink($destPath);
                }
                if ($file !== 'deploy.php') {
                    if (!copy($sourcePath, $destPath)) {
                        $this->errors[] = "Failed to copy: $file to $normalizedFile";
                    }
                }
            }
        }
    }

    private function recursiveRemoveDirectory($dir)
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..')
                continue;

            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->recursiveRemoveDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }

    private function ensureUploadDirectories($uploadsPath)
    {
        // Ensure uploads directory and subdirectories exist
        $subdirs = ['settings', 'posts', 'categories', 'products', 'projects', 'sliders', 'menus'];
        
        if (!is_dir($uploadsPath)) {
            @mkdir($uploadsPath, 0755, true);
        }
        
        foreach ($subdirs as $subdir) {
            $path = $uploadsPath . '/' . $subdir;
            if (!is_dir($path)) {
                @mkdir($path, 0755, true);
            }
        }
        
        // Create .htaccess
        $htaccessPath = $uploadsPath . '/.htaccess';
        if (!file_exists($htaccessPath)) {
            $htaccessContent = <<<'HTACCESS'
<IfModule mod_rewrite.c>
    RewriteEngine Off
</IfModule>

<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|pdf)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
HTACCESS;
            @file_put_contents($htaccessPath, $htaccessContent);
        }
        
        // Set permissions
        @chmod($uploadsPath, 0755);
        foreach ($subdirs as $subdir) {
            @chmod($uploadsPath . '/' . $subdir, 0755);
        }
    }

    private function handlePublish()
    {
        // Move contents of backend/public to root (except uploads - keep in backend/public)
        $source = __DIR__ . '/backend/public';
        $dest = __DIR__;

        if (is_dir($source)) {
            $files = scandir($source);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..')
                    continue;

                $sourcePath = $source . '/' . $file;
                $destPath = $dest . '/' . $file;

                if ($file === 'deploy.php')
                    continue;

                // KEEP uploads directory in backend/public - don't move it
                if ($file === 'uploads') {
                    // Ensure uploads directory exists and has proper structure
                    $this->ensureUploadDirectories($sourcePath);
                    continue;
                }

                if (is_dir($sourcePath)) {
                    $this->moveDirectory($sourcePath, $destPath);
                } else {
                    // If file exists, delete it first to ensure clean overwrite
                    if (file_exists($destPath)) {
                        unlink($destPath);
                    }
                    rename($sourcePath, $destPath);
                }
            }

            // Update index.php
            $indexFile = $dest . '/index.php';
            if (file_exists($indexFile)) {
                $content = file_get_contents($indexFile);
                $content = str_replace('/../storage/framework/maintenance.php', '/backend/storage/framework/maintenance.php', $content);
                $content = str_replace('/../vendor/autoload.php', '/backend/vendor/autoload.php', $content);
                $content = str_replace('/../bootstrap/app.php', '/backend/bootstrap/app.php', $content);
                file_put_contents($indexFile, $content);
            }

            // Fix storage symlink
            $publicStorage = $dest . '/storage';
            if (file_exists($publicStorage)) {
                if (is_link($publicStorage)) {
                    unlink($publicStorage);
                } elseif (is_dir($publicStorage)) {
                    // Directory exists, maybe from previous install. Leave it or remove?
                    // Better to remove and re-link
                    // $this->removeDirectory($publicStorage);
                }
            }

            // Create new symlink if supported
            $target = __DIR__ . '/backend/storage/app/public';
            if (function_exists('symlink')) {
                @symlink($target, $publicStorage);
            } else {
                if (!isset($_SESSION['warnings']))
                    $_SESSION['warnings'] = [];
                $_SESSION['warnings'][] = "Function 'symlink' is disabled. The 'storage' link could not be created. Images may not load.";
            }

            // Ensure backend/public/uploads exists with proper structure
            $backendUploadsPath = __DIR__ . '/backend/public/uploads';
            $this->ensureUploadDirectories($backendUploadsPath);

            $_SESSION['publish_success'] = true;
            header('Location: ?step=3');
            exit;
        } else {
            $this->errors[] = 'Source directory not found: ' . $source;
        }
    }

    private function moveDirectory($source, $dest)
    {
        if (!is_dir($dest)) {
            mkdir($dest, 0755, true);
        }
        $files = scandir($source);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..')
                continue;
            $s = $source . '/' . $file;
            $d = $dest . '/' . $file;
            if (is_dir($s)) {
                $this->moveDirectory($s, $d);
                rmdir($s);
            } else {
                if (file_exists($d))
                    unlink($d);
                rename($s, $d);
            }
        }
        rmdir($source);
    }

    private function handleDatabase()
    {
        $host = $_POST['db_host'] ?? '';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_pass'] ?? '';

        // Test connection
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Save to session
            $_SESSION['db_config'] = [
                'host' => $host,
                'name' => $name,
                'user' => $user,
                'pass' => $pass
            ];

            header('Location: ?step=4');
            exit;
        } catch (PDOException $e) {
            $this->errors[] = 'Database connection failed: ' . $e->getMessage();
        }
    }

    private function handleConfigure()
    {
        $siteUrl = rtrim($_POST['site_url'] ?? '', '/');
        $adminEmail = $_POST['admin_email'] ?? '';
        $adminPassword = $_POST['admin_password'] ?? '';
        $importSampleData = isset($_POST['import_sample_data']) && $_POST['import_sample_data'] === '1';

        if (empty($siteUrl) || empty($adminEmail) || empty($adminPassword)) {
            $this->errors[] = 'All fields are required';
            return;
        }

        // Create .env file for backend
        $this->createEnvFile($siteUrl, $adminEmail, $adminPassword);

        // Create frontend config
        $this->createFrontendConfig($siteUrl);

        $_SESSION['config'] = [
            'site_url' => $siteUrl,
            'admin_email' => $adminEmail,
            'admin_password' => $adminPassword,
            'import_sample_data' => $importSampleData
        ];

        header('Location: ?step=5');
        exit;
    }

    private function handleMigrate()
    {
        $dbConfig = $_SESSION['db_config'];
        $config = $_SESSION['config'];
        $importSampleData = $config['import_sample_data'] ?? false;

        // Import database
        try {
            // Use mysqli for multi_query support
            $mysqli = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);

            if ($mysqli->connect_error) {
                throw new Exception("Connection failed: " . $mysqli->connect_error);
            }

            $mysqli->set_charset("utf8mb4");

            // Optional override: user-supplied SQL
            $uploadedSql = null;
            if (!empty($_FILES['sql_upload']) && isset($_FILES['sql_upload']['tmp_name']) && $_FILES['sql_upload']['error'] === UPLOAD_ERR_OK) {
                $uploadedSql = @file_get_contents($_FILES['sql_upload']['tmp_name']);
            }
            if (!$uploadedSql && !empty($_POST['sql_text'])) {
                $uploadedSql = trim($_POST['sql_text']);
            }

            // Step 1: Import production database dump
            $possiblePaths = [
                __DIR__ . '/backend/alkanacoating_production.sql',
                __DIR__ . '/backend/alkanacoating_full.sql',
                './backend/alkanacoating_production.sql',
                'backend/alkanacoating_production.sql',
            ];

            $sqlFile = null;
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    $sqlFile = $path;
                    break;
                }
            }

            if ($uploadedSql) {
                if ($mysqli->multi_query($uploadedSql)) {
                    do {
                        if ($result = $mysqli->store_result()) {
                            $result->free();
                        }
                    } while ($mysqli->more_results() && $mysqli->next_result());
                }
            } elseif ($sqlFile && file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                if ($mysqli->multi_query($sql)) {
                    do {
                        if ($result = $mysqli->store_result()) {
                            $result->free();
                        }
                    } while ($mysqli->more_results() && $mysqli->next_result());
                }
            } else {
                // Fallback: read SQL directly from the deployment ZIP
                $zipPath = __DIR__ . '/' . $this->zipFile;
                if (class_exists('ZipArchive') && file_exists($zipPath)) {
                    $zip = new ZipArchive();
                    if ($zip->open($zipPath) === TRUE) {
                        $candidates = [
                            'backend/alkanacoating_production.sql',
                            'backend/alkanacoating_full.sql'
                        ];
                        $sql = null;
                        foreach ($candidates as $entry) {
                            $data = $zip->getFromName($entry);
                            if ($data !== false) {
                                $sql = $data;
                                break;
                            }
                        }
                        $zip->close();

                        if ($sql) {
                            if ($mysqli->multi_query($sql)) {
                                do {
                                    if ($result = $mysqli->store_result()) {
                                        $result->free();
                                    }
                                } while ($mysqli->more_results() && $mysqli->next_result());
                            }
                        }
                    }
                }
            }

            // Now use PDO for prepared statements
            $pdo = new PDO(
                "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']};charset=utf8mb4",
                $dbConfig['user'],
                $dbConfig['pass'],
                [PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"]
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Step 2: Create storage symlink manually (create directory if not exists)
            // Already handled in Publish step, but good to ensure
            $storagePublic = __DIR__ . '/backend/storage/app/public';
            $publicStorage = __DIR__ . '/storage';
            if (!file_exists($publicStorage)) {
                if (function_exists('symlink')) {
                    @symlink($storagePublic, $publicStorage);
                }
            }

            // Step 3: Generate application key if not exists
            $envFile = __DIR__ . '/backend/.env';
            if (file_exists($envFile)) {
                $envContent = file_get_contents($envFile);
                if (strpos($envContent, 'APP_KEY=base64:') === false) {
                    $key = 'base64:' . base64_encode(random_bytes(32));
                    $envContent = preg_replace('/APP_KEY=.*/', 'APP_KEY=' . $key, $envContent);
                    file_put_contents($envFile, $envContent);
                }
            }

            // Step 4: Create/Update admin user
            $hashedPassword = password_hash($config['admin_password'], PASSWORD_DEFAULT);

            // Check if users table exists first
            $tablesCheck = $pdo->query("SHOW TABLES LIKE 'users'")->fetchAll();
            if (count($tablesCheck) > 0) {
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, 'admin', 'active', NOW(), NOW()) ON DUPLICATE KEY UPDATE password = ?, role = 'admin', status = 'active'");
                $stmt->execute(['Admin', $config['admin_email'], $hashedPassword, $hashedPassword]);
            }

            // Step 5: Update admin email/password if sample data was imported
            if ($importSampleData) {
                $this->importSampleSettings($pdo, $config);
            }

            $mysqli->close();

            $_SESSION['install_complete'] = true;
            header('Location: ?step=6');
            exit;
        } catch (Exception $e) {
            $this->errors[] = 'Migration failed: ' . $e->getMessage();
        }
    }

    private function importSampleSettings($pdo, $config)
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'Alkana Coating', 'type' => 'text'],
            ['key' => 'site_description', 'value' => 'Công ty sơn chuyên nghiệp', 'type' => 'text'],
            ['key' => 'site_keywords', 'value' => 'sơn, sơn nước, sơn epoxy', 'type' => 'text'],
            ['key' => 'contact_email', 'value' => $config['admin_email'], 'type' => 'email'],
            ['key' => 'contact_phone', 'value' => '0123456789', 'type' => 'text'],
            ['key' => 'contact_address', 'value' => 'TP. Hồ Chí Minh', 'type' => 'text'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com', 'type' => 'url'],
            ['key' => 'youtube_url', 'value' => 'https://youtube.com', 'type' => 'url'],
            ['key' => 'zalo_url', 'value' => 'https://zalo.me', 'type' => 'url'],
        ];

        foreach ($settings as $setting) {
            $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`, `type`, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()");
            $stmt->execute([$setting['key'], $setting['value'], $setting['type'], $setting['value']]);
        }
    }

    private function createEnvFile($siteUrl, $adminEmail, $adminPassword)
    {
        $dbConfig = $_SESSION['db_config'];

        $env = <<<ENV
APP_NAME="Alkana Coating"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL={$siteUrl}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST={$dbConfig['host']}
DB_PORT=3306
DB_DATABASE={$dbConfig['name']}
DB_USERNAME={$dbConfig['user']}
DB_PASSWORD={$dbConfig['pass']}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="{$adminEmail}"
MAIL_FROM_NAME="\${APP_NAME}"

SANCTUM_STATEFUL_DOMAINS=localhost:5173,{$siteUrl}
SESSION_DOMAIN=
FRONTEND_URL={$siteUrl}

VITE_APP_NAME="\${APP_NAME}"
ENV;

        file_put_contents('backend/.env', $env);
    }

    private function createFrontendConfig($siteUrl)
    {
        $config = <<<JS
// Auto-generated by installer
export const API_URL = '{$siteUrl}/api';
export const SITE_URL = '{$siteUrl}';
JS;

        @mkdir('frontend/src/config', 0755, true);
        file_put_contents('frontend/src/config/auto-config.js', $config);
    }

    private function renderPage()
    {
        ?>
        <!DOCTYPE html>
        <html lang="vi">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><?php echo SCRIPT_NAME; ?> - v<?php echo VERSION; ?></title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }

                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }

                .header h1 {
                    font-size: 28px;
                    margin-bottom: 5px;
                }

                .header p {
                    opacity: 0.9;
                }

                .progress {
                    display: flex;
                    padding: 20px 30px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    overflow-x: auto;
                }

                .progress-step {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    position: relative;
                    font-size: 12px;
                    color: #999;
                    min-width: 60px;
                }

                .progress-step.active {
                    color: #667eea;
                    font-weight: 600;
                }

                .progress-step.completed {
                    color: #28a745;
                }

                .progress-step::before {
                    content: '';
                    display: block;
                    width: 30px;
                    height: 30px;
                    background: #e9ecef;
                    border-radius: 50%;
                    margin: 0 auto 8px;
                    line-height: 30px;
                }

                .progress-step.active::before {
                    background: #667eea;
                }

                .progress-step.completed::before {
                    background: #28a745;
                }

                .content {
                    padding: 40px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
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
                    text-decoration: none;
                }

                .btn:hover {
                    transform: translateY(-2px);
                }

                .btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-success {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }

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

                .alert-info {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }

                .file-upload {
                    border: 2px dashed #667eea;
                    border-radius: 6px;
                    padding: 40px;
                    text-align: center;
                    background: #f8f9fa;
                }

                .footer {
                    padding: 20px 40px;
                    background: #f8f9fa;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #e9ecef;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <div class="header">
                    <h1>🎨 <?php echo SCRIPT_NAME; ?></h1>
                    <p>Phiên bản <?php echo VERSION; ?> - Triển khai tự động</p>
                </div>

                <div class="progress">
                    <?php foreach ($this->steps as $index => $step): ?>
                        <div class="progress-step <?php
                        echo $index < $this->currentStep ? 'completed' : '';
                        echo $index === $this->currentStep ? 'active' : '';
                        ?>">
                            <?php echo ucfirst($step); ?>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="content">
                    <?php if (!empty($this->errors)): ?>
                        <div class="alert alert-danger">
                            <strong>❌ Lỗi:</strong><br>
                            <?php foreach ($this->errors as $error): ?>
                                • <?php echo htmlspecialchars($error); ?><br>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if (isset($_SESSION['warnings']) && !empty($_SESSION['warnings'])): ?>
                        <div class="alert alert-info" style="background: #fff3cd; color: #856404; border-color: #ffeeba;">
                            <strong>⚠️ Lưu ý:</strong><br>
                            <?php foreach ($_SESSION['warnings'] as $warning): ?>
                                • <?php echo htmlspecialchars($warning); ?><br>
                            <?php endforeach; ?>
                            <?php unset($_SESSION['warnings']); ?>
                        </div>
                    <?php endif; ?>

                    <?php $this->renderStep(); ?>
                </div>

                <div class="footer">
                    © 2025 Alkana Coating. Installer by Auto Deploy System.
                </div>
            </div>
        </body>

        </html>
        <?php
    }

    private function renderStep()
    {
        switch ($this->currentStep) {
            case 0:
                $this->renderUploadStep();
                break;
            case 1:
                $this->renderExtractStep();
                break;
            case 2:
                $this->renderPublishStep();
                break;
            case 3:
                $this->renderDatabaseStep();
                break;
            case 4:
                $this->renderConfigureStep();
                break;
            case 5:
                $this->renderMigrateStep();
                break;
            case 6:
                $this->renderCompleteStep();
                break;
        }
    }

    private function renderUploadStep()
    {
        ?>
        <h2>📦 Bước 1: Upload Package</h2>
        <p>Upload file <strong>alkana-coating.zip</strong> hoặc đảm bảo file đã có sẵn trong thư mục.</p>

        <div class="requirements">
            <h3>Kiểm tra yêu cầu hệ thống:</h3>
            <?php $this->checkRequirements(); ?>
        </div>

        <form method="POST" enctype="multipart/form-data" style="margin-top: 30px;">
            <div class="file-upload">
                <h3>📁 Chọn file ZIP</h3>
                <p style="color: #666; margin: 10px 0;">alkana-coating.zip</p>
                <input type="file" name="zipfile" accept=".zip" style="margin: 20px 0;">
            </div>

            <div style="margin-top: 20px; text-align: right;">
                <button type="submit" class="btn">
                    Tiếp tục →
                </button>
            </div>
        </form>
        <?php
    }

    private function renderExtractStep()
    {
        ?>
        <h2>📂 Bước 2: Giải nén Package</h2>
        <p>Giải nén file ZIP vào thư mục hiện tại.</p>

        <div class="alert alert-info">
            ℹ️ Quá trình này sẽ giải nén tất cả file backend và frontend vào thư mục hosting.
        </div>

        <form method="POST" style="margin-top: 20px;">
            <button type="submit" class="btn">
                Bắt đầu giải nén
            </button>
        </form>
        <?php
    }

    private function renderPublishStep()
    {
        $backendPublic = __DIR__ . '/backend/public';
        $exists = is_dir($backendPublic);
        ?>
        <h2>🚀 Bước 3: Publish Files</h2>
        <p>Di chuyển các file từ thư mục backend/public ra thư mục gốc.</p>

        <?php if ($exists): ?>
            <div class="alert alert-success">
                ✅ Đã tìm thấy thư mục nguồn: <strong><?php echo htmlspecialchars($backendPublic); ?></strong>
            </div>
        <?php else: ?>
            <div class="alert alert-danger">
                ❌ Không tìm thấy thư mục nguồn: <strong><?php echo htmlspecialchars($backendPublic); ?></strong><br>
                Vui lòng kiểm tra lại quá trình giải nén hoặc cấu trúc file ZIP.
            </div>
        <?php endif; ?>

        <div class="alert alert-info">
            ℹ️ Bước này sẽ đưa website ra thư mục chính để truy cập được từ tên miền.
        </div>

        <form method="POST" style="margin-top: 20px;">
            <button type="submit" class="btn" <?php echo !$exists ? 'disabled' : ''; ?>>
                Tiếp tục Publish
            </button>
        </form>
        <?php
    }

    private function renderDatabaseStep()
    {
        ?>
        <h2>🗄️ Bước 4: Cấu hình Database</h2>
        <p>Nhập thông tin kết nối MySQL database.</p>

        <form method="POST" style="margin-top: 20px;">
            <div class="form-group">
                <label>Database Host:</label>
                <input type="text" name="db_host" value="localhost" required>
            </div>

            <div class="form-group">
                <label>Database Name:</label>
                <input type="text" name="db_name" placeholder="alkanacoating_db" required>
            </div>

            <div class="form-group">
                <label>Database Username:</label>
                <input type="text" name="db_user" required>
            </div>

            <div class="form-group">
                <label>Database Password:</label>
                <input type="password" name="db_pass">
            </div>

            <div style="text-align: right;">
                <button type="submit" class="btn">
                    Test & Tiếp tục →
                </button>
            </div>
        </form>
        <?php
    }

    private function renderConfigureStep()
    {
        ?>
        <h2>⚙️ Bước 5: Cấu hình Website</h2>
        <p>Thiết lập thông tin cơ bản cho website.</p>

        <form method="POST" style="margin-top: 20px;">
            <div class="form-group">
                <label>Site URL:</label>
                <input type="url" name="site_url" placeholder="https://yourdomain.com" required>
                <small style="color: #666;">URL đầy đủ của website (không có dấu / cuối)</small>
            </div>

            <div class="form-group">
                <label>Admin Email:</label>
                <input type="email" name="admin_email" placeholder="admin@yourdomain.com" required>
            </div>

            <div class="form-group">
                <label>Admin Password:</label>
                <input type="password" name="admin_password" minlength="6" required>
                <small style="color: #666;">Tối thiểu 6 ký tự</small>
            </div>

            <div class="form-group" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #667eea;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" name="import_sample_data" value="1" checked
                        style="width: auto; margin-right: 10px; cursor: pointer;">
                    <strong>📦 Import dữ liệu mẫu (Khuyến nghị)</strong>
                </label>
                <small style="color: #666; display: block; margin-top: 10px; margin-left: 30px;">
                    ✅ Danh mục sản phẩm (4 categories)<br>
                    ✅ Sản phẩm mẫu (3 products)<br>
                    ✅ Slider trang chủ (2 slides)<br>
                    ✅ Bài viết blog (2 posts)<br>
                    ✅ Dự án (2 projects)<br>
                    ✅ Cài đặt website (Settings)<br>
                    <br>
                    <em>Giúp bạn có website demo ngay lập tức!</em>
                </small>
            </div>

            <div style="text-align: right; margin-top: 20px;">
                <button type="submit" class="btn">
                    Lưu cấu hình →
                </button>
            </div>
        </form>
        <?php
    }

    private function renderMigrateStep()
    {
        $config = $_SESSION['config'];
        $importSampleData = $config['import_sample_data'] ?? false;
        ?>
        <h2>🚀 Bước 6: Cài đặt Database</h2>
        <p>Import database và chạy migrations.</p>

        <div class="alert alert-info">
            ℹ️ Quá trình này sẽ:
            <ul style="margin: 10px 0 0 20px;">
                <li>Import database structure</li>
                <li>Tạo admin user</li>
                <li>Chạy migrations</li>
                <li>Tạo storage symlinks</li>
                <li>Generate application key</li>
                <?php if ($importSampleData): ?>
                    <li><strong>📦 Import dữ liệu mẫu:</strong>
                        <ul style="margin: 5px 0 0 20px;">
                            <li>4 danh mục sản phẩm</li>
                            <li>3 sản phẩm mẫu</li>
                            <li>2 slider trang chủ</li>
                            <li>2 bài viết blog</li>
                            <li>2 dự án</li>
                            <li>Cài đặt website</li>
                        </ul>
                    </li>
                <?php endif; ?>
            </ul>
        </div>

        <form method="POST" enctype="multipart/form-data" style="margin-top: 20px;">
            <button type="submit" class="btn btn-success">
                🚀 Bắt đầu cài đặt
            </button>

            <div style="margin-top:20px;padding:16px;border:1px solid #e9ecef;border-radius:8px;background:#f8f9fa;">
                <strong>🔁 Nếu gặp lỗi không tìm thấy file SQL:</strong>
                <ul style="margin:8px 0 12px 18px;">
                    <li>Tải lên file SQL export từ máy phát triển của bạn (khuyến nghị)</li>
                    <li>Hoặc dán trực tiếp nội dung SQL vào ô bên dưới</li>
                </ul>
                <div class="form-group" style="margin-top:10px;">
                    <label>Upload file .sql:</label>
                    <input type="file" name="sql_upload" accept=".sql" style="width:auto;">
                    <small style="color:#666;display:block;margin-top:6px;">Giới hạn upload phụ thuộc host (thường 2–64MB). Nếu
                        file lớn, hãy dùng phpMyAdmin.</small>
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label>Dán nội dung SQL (tùy chọn):</label>
                    <textarea name="sql_text" rows="6" placeholder="-- Dán lệnh SQL của bạn tại đây"
                        style="width:100%;"></textarea>
                </div>
            </div>
        </form>
        <?php
    }

    private function renderCompleteStep()
    {
        $config = $_SESSION['config'];
        ?>
        <h2>✅ Hoàn thành!</h2>

        <div class="alert alert-success">
            <strong>🎉 Chúc mừng!</strong><br>
            Website Alkana Coating đã được cài đặt thành công!
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>📋 Thông tin đăng nhập:</h3>
            <p><strong>Admin URL:</strong> <a href="<?php echo $config['site_url']; ?>/admin"
                    target="_blank"><?php echo $config['site_url']; ?>/admin</a></p>
            <p><strong>Email:</strong> <?php echo $config['admin_email']; ?></p>
            <p><strong>Password:</strong> (đã thiết lập ở bước trước)</p>
        </div>

        <div class="alert alert-info">
            <strong>📝 Bước tiếp theo:</strong><br>
            1. <strong style="color: #d63384;">Quan trọng - Kiểm tra quyền upload:</strong><br>
            &nbsp;&nbsp;&nbsp;• Chạy: <code>php backend/scripts/fix_upload_permissions.php</code><br>
            &nbsp;&nbsp;&nbsp;• Hoặc chmod 755 cho thư mục <code>backend/public/uploads</code><br>
            &nbsp;&nbsp;&nbsp;• Nếu không, upload hình ảnh sẽ bị lỗi!<br>
            2. Xóa file <code>deploy.php</code> và <code>alkana-coating.zip</code> để bảo mật<br>
            3. Build frontend: <code>cd frontend && npm install && npm run build</code><br>
            4. Cấu hình web server trỏ đến <code>frontend/dist</code> cho frontend<br>
            5. Cấu hình API trỏ đến <code>backend/public</code><br>
            6. Đăng nhập admin panel và bắt đầu quản lý nội dung
        </div>

        <div class="alert" style="background: #fff3cd; border-color: #ffc107; margin: 20px 0;">
            <strong>⚠️ Kiểm tra upload ngay:</strong><br>
            Vào <strong>Admin → Cài đặt → Thông tin website</strong> và thử upload hình ảnh.<br>
            Nếu lỗi, chạy lệnh: <code>php backend/scripts/fix_upload_permissions.php</code>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="<?php echo $config['site_url']; ?>" class="btn btn-success" target="_blank">
                🏠 Xem Website
            </a>
            <a href="<?php echo $config['site_url']; ?>/admin" class="btn" target="_blank">
                👤 Đăng nhập Admin
            </a>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;">
            <strong>⚠️ Quan trọng:</strong><br>
            Chạy lệnh sau để xóa installer:
            <pre
                style="background: #fff; padding: 10px; margin-top: 10px; border-radius: 4px;">rm deploy.php alkana-coating.zip</pre>
        </div>
        <?php
    }

    private function checkRequirements()
    {
        $requirements = [
            'PHP >= 8.1' => version_compare(PHP_VERSION, '8.1.0', '>='),
            'ZipArchive Extension' => class_exists('ZipArchive'),
            'PDO Extension' => extension_loaded('pdo'),
            'PDO MySQL' => extension_loaded('pdo_mysql'),
            'GD or Imagick' => extension_loaded('gd') || extension_loaded('imagick'),
            'Fileinfo Extension' => extension_loaded('fileinfo'),
            'Writable Directory' => is_writable(__DIR__),
            'Symlink Function' => function_exists('symlink'),
        ];

        foreach ($requirements as $req => $status) {
            $class = $status ? 'success' : 'error';
            $icon = $status ? '✅' : '❌';
            if ($req === 'Symlink Function' && !$status) {
                $class = 'warning';
                $icon = '⚠️';
                $req .= ' (Optional - Images may not load)';
            }
            echo "<div class='req-item $class'><span class='icon'>$icon</span> $req</div>";
        }
    }
}

// Run installer
$installer = new AlkanaInstaller();
$installer->run();
