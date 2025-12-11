<?php
/**
 * Alkana Coating Debug Script
 * Upload this to your hosting root (same level as index.php)
 * Access: http://yourdomain.com/debug_server.php
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>🛠️ Alkana Coating Debugger</h1>";

// 1. Check File Structure
echo "<h2>1. File Structure Check</h2>";
$files = [
    'index.php',
    'backend/vendor/autoload.php',
    'backend/bootstrap/app.php',
    'backend/.env',
    'backend/storage',
    'backend/storage/logs/laravel.log'
];

foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "<div style='color:green'>✅ Found: $file</div>";
        if (is_dir($path)) {
            $perms = substr(sprintf('%o', fileperms($path)), -4);
            echo "Permissions: $perms (Should be 0755 or 0777)<br>";
            if (!is_writable($path)) {
                echo "<div style='color:red'>❌ Error: $file is not writable!</div>";
            }
        }
    } else {
        echo "<div style='color:red'>❌ Missing: $file</div>";
    }
}

// 2. Check Environment
echo "<h2>2. Environment Check</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Current Dir: " . __DIR__ . "<br>";

// 3. Check Database Connection
echo "<h2>3. Database Connection Check</h2>";
if (file_exists(__DIR__ . '/backend/.env')) {
    $env = file_get_contents(__DIR__ . '/backend/.env');
    preg_match('/DB_HOST=(.*)/', $env, $host);
    preg_match('/DB_DATABASE=(.*)/', $env, $db);
    preg_match('/DB_USERNAME=(.*)/', $env, $user);
    preg_match('/DB_PASSWORD=(.*)/', $env, $pass);

    $host = trim($host[1] ?? '');
    $db = trim($db[1] ?? '');
    $user = trim($user[1] ?? '');
    $pass = trim($pass[1] ?? '');

    echo "Attempting connection to Host: $host, DB: $db, User: $user...<br>";

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
        echo "<div style='color:green'>✅ Database connection successful!</div>";
    } catch (PDOException $e) {
        echo "<div style='color:red'>❌ Database connection failed: " . $e->getMessage() . "</div>";
    }
} else {
    echo "Skipping DB check (.env not found)";
}

// 4. Laravel Log (Last 50 lines)
echo "<h2>4. Laravel Log (Last 50 lines)</h2>";
$logFile = __DIR__ . '/backend/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -50);
    echo "<pre style='background:#f8f9fa; padding:10px; border:1px solid #ddd; overflow:auto;'>";
    foreach ($lastLines as $line) {
        echo htmlspecialchars($line);
    }
    echo "</pre>";
} else {
    echo "Log file not found.";
}

// 5. Test Laravel Bootstrap
echo "<h2>5. Laravel Bootstrap Test</h2>";
try {
    require __DIR__ . '/backend/vendor/autoload.php';
    $app = require_once __DIR__ . '/backend/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "<div style='color:green'>✅ Laravel bootstrapped successfully!</div>";
} catch (Throwable $e) {
    echo "<div style='color:red'>❌ Laravel Bootstrap Failed: " . $e->getMessage() . "</div>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
