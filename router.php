<?php
// Simple router for PHP's built-in server so WordPress works locally
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false; // Let built-in server serve the file
}
require __DIR__ . '/index.php';
