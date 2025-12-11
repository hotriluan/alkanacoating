<?php
/**
 * Auto Deployment Script for Alkana Coating
 * Similar to WordPress/Joomla Kickstart
 * 
 * Upload this file + alkana-coating.zip to hosting root
 * Access: http://yourdomain.com/deploy.php
 * Follow the wizard to auto-install
 */

define('VERSION', '1.0.0');
define('SCRIPT_NAME', 'Alkana Coating Installer');

// Check PHP version
if (version_compare(PHP_VERSION, '8.1.0', '<')) {
    die('Error: PHP 8.1 or higher required. Current: ' . PHP_VERSION);
}

session_start();

// Main installer class
class AlkanaInstaller {
    private $steps = ['upload', 'extract', 'database', 'configure', 'migrate', 'complete'];
    private $currentStep = 0;
    private $errors = [];
    private $zipFile = 'alkana-coating.zip';
    
    public function __construct() {
        $this->currentStep = isset($_GET['step']) ? (int)$_GET['step'] : 0;
    }
    
    public function run() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->handlePost();
        }
        
        $this->renderPage();
    }
    
    private function handlePost() {
        switch ($this->currentStep) {
            case 0: // Upload
                $this->handleUpload();
                break;
            case 1: // Extract
                $this->handleExtract();
                break;
            case 2: // Database
                $this->handleDatabase();
                break;
            case 3: // Configure
                $this->handleConfigure();
                break;
            case 4: // Migrate
                $this->handleMigrate();
                break;
        }
    }
    
    private function handleUpload() {
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
    
    private function handleExtract() {
        if (!class_exists('ZipArchive')) {
            $this->errors[] = 'ZipArchive extension not available';
            return;
        }
        
        $zip = new ZipArchive;
        if ($zip->open($this->zipFile) === TRUE) {
            // Extract to current directory
            $zip->extractTo('./');
            $zip->close();
            
            $_SESSION['extract_success'] = true;
            header('Location: ?step=2');
            exit;
        } else {
            $this->errors[] = 'Failed to extract ZIP file';
        }
    }
    
    private function handleDatabase() {
        $host = $_POST['db_host'] ?? '';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_pass'] ?? '';
        
        // Test connection
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$name", $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Save to session
            $_SESSION['db_config'] = [
                'host' => $host,
                'name' => $name,
                'user' => $user,
                'pass' => $pass
            ];
            
            header('Location: ?step=3');
            exit;
        } catch (PDOException $e) {
            $this->errors[] = 'Database connection failed: ' . $e->getMessage();
        }
    }
    
    private function handleConfigure() {
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
        
        header('Location: ?step=4');
        exit;
    }
    
    private function handleMigrate() {
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

            // Optional override: user-supplied SQL (file upload or pasted text)
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
                // Import user-provided SQL content first if available
                if ($mysqli->multi_query($uploadedSql)) {
                    do {
                        if ($result = $mysqli->store_result()) { $result->free(); }
                    } while ($mysqli->more_results() && $mysqli->next_result());
                }
                if ($mysqli->error) { error_log("SQL Import Warning (uploaded/pasted): " . $mysqli->error); }
            } elseif ($sqlFile && file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                
                // Execute multi-query to import entire database
                if ($mysqli->multi_query($sql)) {
                    do {
                        if ($result = $mysqli->store_result()) {
                            $result->free();
                        }
                    } while ($mysqli->more_results() && $mysqli->next_result());
                }
                
                if ($mysqli->error) {
                    error_log("SQL Import Warning: " . $mysqli->error);
                }
            } else {
                // Fallback: read SQL directly from the deployment ZIP so we don't depend on extraction
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
                            if ($mysqli->error) {
                                error_log("SQL Import Warning (from ZIP): " . $mysqli->error);
                            }
                        } else {
                            throw new Exception(
                                "Database file not found. Checked: " . implode(', ', $possiblePaths) .
                                "; Also not found inside ZIP (" . implode(', ', $candidates) . ") at: " . $zipPath
                            );
                        }
                    } else {
                        throw new Exception("Could not open deployment ZIP at: " . $zipPath);
                    }
                } else {
                    throw new Exception(
                        "Database file not found. Checked: " . implode(', ', $possiblePaths) .
                        "; ZIP unavailable at: " . $zipPath
                    );
                }
            }
            
            // Now use PDO for prepared statements
            $pdo = new PDO(
                "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']}", 
                $dbConfig['user'], 
                $dbConfig['pass']
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Step 2: Create storage symlink manually (create directory if not exists)
            $storagePublic = __DIR__ . '/backend/storage/app/public';
            $publicStorage = __DIR__ . '/backend/public/storage';
            if (!file_exists($publicStorage)) {
                if (is_dir($storagePublic)) {
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
            // Database already has full data from production dump
            // Just update the admin user with user's credentials
            if ($importSampleData) {
                // Update settings with user's email
                $this->importSampleSettings($pdo, $config);
            }
            
            $mysqli->close();
            
            $_SESSION['install_complete'] = true;
            header('Location: ?step=5');
            exit;
        } catch (Exception $e) {
            $this->errors[] = 'Migration failed: ' . $e->getMessage();
        }
    }
    
    private function importSampleData($pdo) {
        // Import categories
        $this->importSampleCategories($pdo);
        
        // Import products
        $this->importSampleProducts($pdo);
        
        // Import sliders
        $this->importSampleSliders($pdo);
        
        // Import posts
        $this->importSamplePosts($pdo);
        
        // Import projects
        $this->importSampleProjects($pdo);
    }
    
    private function importSampleCategories($pdo) {
        $categories = [
            ['name' => 'Sơn Nước', 'slug' => 'son-nuoc', 'icon' => '🎨', 'description' => 'Các loại sơn nước chất lượng cao'],
            ['name' => 'Sơn Dầu', 'slug' => 'son-dau', 'icon' => '🖌️', 'description' => 'Sơn dầu công nghiệp và dân dụng'],
            ['name' => 'Sơn Epoxy', 'slug' => 'son-epoxy', 'icon' => '⚡', 'description' => 'Sơn epoxy chống thấm, chống ăn mòn'],
            ['name' => 'Sơn Chống Thấm', 'slug' => 'son-chong-tham', 'icon' => '💧', 'description' => 'Giải pháp chống thấm hiệu quả'],
        ];
        
        foreach ($categories as $i => $cat) {
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug, icon, description, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([$cat['name'], $cat['slug'], $cat['icon'], $cat['description'], $i]);
        }
    }
    
    private function importSampleProducts($pdo) {
        $products = [
            [
                'name' => 'Sơn Nước Nội Thất Alkana Premium',
                'slug' => 'son-nuoc-noi-that-premium',
                'excerpt' => 'Sơn nước nội thất cao cấp, thân thiện môi trường',
                'content' => 'Sơn nước Alkana Premium là dòng sản phẩm cao cấp dành cho nội thất, với công nghệ tiên tiến giúp bảo vệ tường nhà tốt nhất.',
                'features' => 'Không mùi, Dễ thi công, Bền màu',
                'is_active' => 1,
                'is_featured' => 1,
            ],
            [
                'name' => 'Sơn Ngoại Thất Alkana Weather Shield',
                'slug' => 'son-ngoai-that-weather-shield',
                'excerpt' => 'Bảo vệ bề mặt ngoại thất khỏi thời tiết khắc nghiệt',
                'content' => 'Weather Shield với công nghệ chống thấm ưu việt, giúp bảo vệ ngôi nhà khỏi mưa nắng, ẩm mốc.',
                'features' => 'Chống thấm, Chống bám bẩn, Bền màu 10 năm',
                'is_active' => 1,
                'is_featured' => 1,
            ],
            [
                'name' => 'Sơn Epoxy Tự Phẳng Alkana Floor',
                'slug' => 'son-epoxy-tu-phang',
                'excerpt' => 'Sơn epoxy tự phẳng cho sàn nhà xưởng',
                'content' => 'Alkana Floor là giải pháp hoàn hảo cho sàn nhà xưởng, showroom với bề mặt bóng đẹp, chống trơn trượt.',
                'features' => 'Tự phẳng, Chống hóa chất, Dễ vệ sinh',
                'is_active' => 1,
                'is_featured' => 0,
            ],
        ];
        
        foreach ($products as $product) {
            $stmt = $pdo->prepare("INSERT INTO products (name, slug, excerpt, content, features, is_active, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([
                $product['name'],
                $product['slug'],
                $product['excerpt'],
                $product['content'],
                $product['features'],
                $product['is_active'],
                $product['is_featured']
            ]);
        }
    }
    
    private function importSampleSliders($pdo) {
        $sliders = [
            [
                'title' => 'Chào mừng đến với Alkana Coating',
                'subtitle' => 'Giải pháp sơn chuyên nghiệp',
                'description' => 'Chất lượng vượt trội - Giá cả hợp lý',
                'button_text' => 'Xem sản phẩm',
                'link' => '/products',
                'order' => 0,
            ],
            [
                'title' => 'Sơn Nội Thất Cao Cấp',
                'subtitle' => 'Tạo không gian sống hoàn hảo',
                'description' => 'An toàn - Thân thiện môi trường',
                'button_text' => 'Tìm hiểu thêm',
                'link' => '/products/son-nuoc',
                'order' => 1,
            ],
        ];
        
        foreach ($sliders as $slider) {
            $stmt = $pdo->prepare("INSERT INTO sliders (title, subtitle, description, button_text, link, `order`, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())");
            $stmt->execute([
                $slider['title'],
                $slider['subtitle'],
                $slider['description'],
                $slider['button_text'],
                $slider['link'],
                $slider['order']
            ]);
        }
    }
    
    private function importSamplePosts($pdo) {
        $posts = [
            [
                'title' => 'Hướng dẫn chọn sơn nội thất phù hợp',
                'slug' => 'huong-dan-chon-son-noi-that',
                'excerpt' => 'Những lưu ý quan trọng khi chọn sơn cho ngôi nhà của bạn',
                'content' => 'Chọn sơn nội thất là một quyết định quan trọng ảnh hưởng đến không gian sống của gia đình. Bài viết này sẽ hướng dẫn bạn những điều cần biết...',
                'is_published' => 1,
                'is_featured' => 1,
            ],
            [
                'title' => '5 xu hướng màu sơn 2025',
                'slug' => '5-xu-huong-mau-son-2025',
                'excerpt' => 'Cập nhật những xu hướng màu sắc mới nhất trong năm',
                'content' => 'Năm 2025 đánh dấu sự trở lại của những tông màu tự nhiên, ấm áp kết hợp với công nghệ sơn hiện đại...',
                'is_published' => 1,
                'is_featured' => 1,
            ],
        ];
        
        foreach ($posts as $post) {
            $stmt = $pdo->prepare("INSERT INTO posts (title, slug, excerpt, content, status, is_published, is_featured, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'published', ?, ?, NOW(), NOW(), NOW())");
            $stmt->execute([
                $post['title'],
                $post['slug'],
                $post['excerpt'],
                $post['content'],
                $post['is_published'],
                $post['is_featured']
            ]);
        }
    }
    
    private function importSampleProjects($pdo) {
        $projects = [
            [
                'title' => 'Dự án Sơn Nhà Xưởng ABC',
                'slug' => 'du-an-nha-xuong-abc',
                'excerpt' => 'Thi công sơn epoxy cho nhà xưởng 5000m²',
                'content' => 'Dự án thi công sơn epoxy tự phẳng cho nhà xưởng sản xuất với diện tích 5000m²',
                'client' => 'Công ty ABC',
                'location' => 'Bình Dương',
                'project_type' => 'Nhà xưởng',
                'is_published' => 1,
            ],
            [
                'title' => 'Sơn Biệt Thự Vinhomes',
                'slug' => 'son-biet-thu-vinhomes',
                'excerpt' => 'Thi công sơn nội ngoại thất biệt thự cao cấp',
                'content' => 'Dự án sơn hoàn thiện biệt thự cao cấp tại Vinhomes với diện tích 500m²',
                'client' => 'Gia đình Nguyễn',
                'location' => 'TP. Hồ Chí Minh',
                'project_type' => 'Biệt thự',
                'is_published' => 1,
            ],
        ];
        
        foreach ($projects as $project) {
            $stmt = $pdo->prepare("INSERT INTO projects (title, slug, excerpt, content, client, location, project_type, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([
                $project['title'],
                $project['slug'],
                $project['excerpt'],
                $project['content'],
                $project['client'],
                $project['location'],
                $project['project_type'],
                $project['is_published']
            ]);
        }
    }
    
    private function createDatabaseTables($mysqli) {
        // Drop existing tables first to ensure clean state
        $dropTables = [
            "SET FOREIGN_KEY_CHECKS = 0",
            "DROP TABLE IF EXISTS `users`",
            "DROP TABLE IF EXISTS `categories`",
            "DROP TABLE IF EXISTS `products`",
            "DROP TABLE IF EXISTS `sliders`",
            "DROP TABLE IF EXISTS `posts`",
            "DROP TABLE IF EXISTS `projects`",
            "DROP TABLE IF EXISTS `settings`",
            "DROP TABLE IF EXISTS `menus`",
            "DROP TABLE IF EXISTS `contacts`",
            "SET FOREIGN_KEY_CHECKS = 1"
        ];
        
        foreach ($dropTables as $sql) {
            $mysqli->query($sql);
        }
        
        // Create essential tables for Alkana Coating
        $tables = [
            // Users table
            "CREATE TABLE IF NOT EXISTS `users` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `email` varchar(255) NOT NULL,
                `password` varchar(255) NOT NULL,
                `role` enum('admin','user') DEFAULT 'user',
                `status` enum('active','inactive') DEFAULT 'active',
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `users_email_unique` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Categories table
            "CREATE TABLE IF NOT EXISTS `categories` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `slug` varchar(255) NOT NULL,
                `icon` varchar(50) DEFAULT NULL,
                `description` text DEFAULT NULL,
                `image` varchar(255) DEFAULT NULL,
                `order` int(11) DEFAULT 0,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `categories_slug_unique` (`slug`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Products table
            "CREATE TABLE IF NOT EXISTS `products` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `category_id` bigint(20) unsigned DEFAULT NULL,
                `name` varchar(255) NOT NULL,
                `slug` varchar(255) NOT NULL,
                `excerpt` text DEFAULT NULL,
                `content` longtext DEFAULT NULL,
                `features` text DEFAULT NULL,
                `image` varchar(255) DEFAULT NULL,
                `price` decimal(10,2) DEFAULT NULL,
                `is_active` tinyint(1) DEFAULT 1,
                `is_featured` tinyint(1) DEFAULT 0,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `products_slug_unique` (`slug`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Sliders table
            "CREATE TABLE IF NOT EXISTS `sliders` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `title` varchar(255) NOT NULL,
                `subtitle` varchar(255) DEFAULT NULL,
                `image` varchar(255) NOT NULL,
                `link` varchar(255) DEFAULT NULL,
                `order` int(11) DEFAULT 0,
                `is_active` tinyint(1) DEFAULT 1,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Posts table
            "CREATE TABLE IF NOT EXISTS `posts` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `title` varchar(255) NOT NULL,
                `slug` varchar(255) NOT NULL,
                `excerpt` text DEFAULT NULL,
                `content` longtext DEFAULT NULL,
                `image` varchar(255) DEFAULT NULL,
                `author` varchar(255) DEFAULT NULL,
                `is_published` tinyint(1) DEFAULT 1,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `posts_slug_unique` (`slug`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Projects table
            "CREATE TABLE IF NOT EXISTS `projects` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `title` varchar(255) NOT NULL,
                `slug` varchar(255) NOT NULL,
                `excerpt` text DEFAULT NULL,
                `content` longtext DEFAULT NULL,
                `image` varchar(255) DEFAULT NULL,
                `client` varchar(255) DEFAULT NULL,
                `location` varchar(255) DEFAULT NULL,
                `project_type` varchar(100) DEFAULT NULL,
                `is_published` tinyint(1) DEFAULT 1,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `projects_slug_unique` (`slug`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Settings table
            "CREATE TABLE IF NOT EXISTS `settings` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `key` varchar(255) NOT NULL,
                `value` text DEFAULT NULL,
                `type` varchar(50) DEFAULT 'text',
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `settings_key_unique` (`key`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Menus table
            "CREATE TABLE IF NOT EXISTS `menus` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `parent_id` bigint(20) unsigned DEFAULT NULL,
                `title` varchar(255) NOT NULL,
                `url` varchar(255) DEFAULT NULL,
                `order` int(11) DEFAULT 0,
                `is_active` tinyint(1) DEFAULT 1,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Contacts table
            "CREATE TABLE IF NOT EXISTS `contacts` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `email` varchar(255) NOT NULL,
                `phone` varchar(50) DEFAULT NULL,
                `subject` varchar(255) DEFAULT NULL,
                `message` text DEFAULT NULL,
                `status` enum('new','read','replied') DEFAULT 'new',
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        ];
        
        foreach ($tables as $sql) {
            if (!$mysqli->query($sql)) {
                error_log("Table creation error: " . $mysqli->error);
            }
        }
    }
    
    private function importSampleSettings($pdo, $config) {
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
    
    private function createEnvFile($siteUrl, $adminEmail, $adminPassword) {
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
    
    private function createFrontendConfig($siteUrl) {
        $config = <<<JS
// Auto-generated by installer
export const API_URL = '{$siteUrl}/api';
export const SITE_URL = '{$siteUrl}';
JS;
        
        @mkdir('frontend/src/config', 0755, true);
        file_put_contents('frontend/src/config/auto-config.js', $config);
    }
    
    private function runArtisanCommand($command) {
        $phpPath = PHP_BINARY;
        $artisanPath = __DIR__ . '/backend/artisan';
        
        if (file_exists($artisanPath)) {
            $output = shell_exec("cd backend && $phpPath artisan $command 2>&1");
            return $output;
        }
        return null;
    }
    
    private function renderPage() {
        ?>
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><?php echo SCRIPT_NAME; ?> - v<?php echo VERSION; ?></title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
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
                .header p { opacity: 0.9; }
                .progress {
                    display: flex;
                    padding: 20px 30px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }
                .progress-step {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    position: relative;
                    font-size: 12px;
                    color: #999;
                }
                .progress-step.active { color: #667eea; font-weight: 600; }
                .progress-step.completed { color: #28a745; }
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
                .progress-step.active::before { background: #667eea; }
                .progress-step.completed::before { background: #28a745; }
                .content { padding: 40px; }
                .form-group { margin-bottom: 20px; }
                .form-group label { 
                    display: block; 
                    margin-bottom: 8px; 
                    font-weight: 600;
                    color: #333;
                }
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s;
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
                    transition: transform 0.2s;
                    text-decoration: none;
                }
                .btn:hover { transform: translateY(-2px); }
                .btn-success { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }
                .alert {
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                .alert-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .alert-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
                .file-upload {
                    border: 2px dashed #667eea;
                    border-radius: 6px;
                    padding: 40px;
                    text-align: center;
                    background: #f8f9fa;
                }
                .requirements { margin-top: 30px; }
                .requirements h3 { margin-bottom: 15px; color: #333; }
                .req-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }
                .req-item .icon { margin-right: 10px; font-size: 20px; }
                .req-item.success .icon { color: #28a745; }
                .req-item.error .icon { color: #dc3545; }
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
    
    private function renderStep() {
        switch ($this->currentStep) {
            case 0:
                $this->renderUploadStep();
                break;
            case 1:
                $this->renderExtractStep();
                break;
            case 2:
                $this->renderDatabaseStep();
                break;
            case 3:
                $this->renderConfigureStep();
                break;
            case 4:
                $this->renderMigrateStep();
                break;
            case 5:
                $this->renderCompleteStep();
                break;
        }
    }
    
    private function renderUploadStep() {
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
    
    private function renderExtractStep() {
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
    
    private function renderDatabaseStep() {
        ?>
        <h2>🗄️ Bước 3: Cấu hình Database</h2>
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
    
    private function renderConfigureStep() {
        ?>
        <h2>⚙️ Bước 4: Cấu hình Website</h2>
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
                    <input type="checkbox" name="import_sample_data" value="1" checked style="width: auto; margin-right: 10px; cursor: pointer;">
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
    
    private function renderMigrateStep() {
        $config = $_SESSION['config'];
        $importSampleData = $config['import_sample_data'] ?? false;
        ?>
        <h2>🚀 Bước 5: Cài đặt Database</h2>
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
                    <small style="color:#666;display:block;margin-top:6px;">Giới hạn upload phụ thuộc host (thường 2–64MB). Nếu file lớn, hãy dùng phpMyAdmin.</small>
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label>Dán nội dung SQL (tùy chọn):</label>
                    <textarea name="sql_text" rows="6" placeholder="-- Dán lệnh SQL của bạn tại đây" style="width:100%;"></textarea>
                </div>
            </div>
        </form>
        <?php
    }
    
    private function renderCompleteStep() {
        $config = $_SESSION['config'];
        ?>
        <h2>✅ Hoàn thành!</h2>
        
        <div class="alert alert-success">
            <strong>🎉 Chúc mừng!</strong><br>
            Website Alkana Coating đã được cài đặt thành công!
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>📋 Thông tin đăng nhập:</h3>
            <p><strong>Admin URL:</strong> <a href="<?php echo $config['site_url']; ?>/admin" target="_blank"><?php echo $config['site_url']; ?>/admin</a></p>
            <p><strong>Email:</strong> <?php echo $config['admin_email']; ?></p>
            <p><strong>Password:</strong> (đã thiết lập ở bước trước)</p>
        </div>
        
        <div class="alert alert-info">
            <strong>📝 Bước tiếp theo:</strong><br>
            1. Xóa file <code>deploy.php</code> và <code>alkana-coating.zip</code> để bảo mật<br>
            2. Build frontend: <code>cd frontend && npm install && npm run build</code><br>
            3. Cấu hình web server trỏ đến <code>frontend/dist</code> cho frontend<br>
            4. Cấu hình API trỏ đến <code>backend/public</code><br>
            5. Đăng nhập admin panel và bắt đầu quản lý nội dung
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
            <pre style="background: #fff; padding: 10px; margin-top: 10px; border-radius: 4px;">rm deploy.php alkana-coating.zip</pre>
        </div>
        <?php
    }
    
    private function checkRequirements() {
        $requirements = [
            'PHP >= 8.1' => version_compare(PHP_VERSION, '8.1.0', '>='),
            'ZipArchive Extension' => class_exists('ZipArchive'),
            'PDO Extension' => extension_loaded('pdo'),
            'PDO MySQL' => extension_loaded('pdo_mysql'),
            'GD or Imagick' => extension_loaded('gd') || extension_loaded('imagick'),
            'Fileinfo Extension' => extension_loaded('fileinfo'),
            'Writable Directory' => is_writable(__DIR__),
        ];
        
        foreach ($requirements as $req => $status) {
            $class = $status ? 'success' : 'error';
            $icon = $status ? '✅' : '❌';
            echo "<div class='req-item $class'><span class='icon'>$icon</span> $req</div>";
        }
    }
}

// Run installer
$installer = new AlkanaInstaller();
$installer->run();
