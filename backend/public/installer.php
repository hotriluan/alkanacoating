<?php
// Public wrapper for installer.php. The repo layout on the host may vary.
// Start searching from the parent of public (so we don't accidentally match this wrapper file),
// and walk up a few levels. If not found, display helpful diagnostics (paths tried and
// open_basedir) so you can debug on the host.

$startDir = dirname(__DIR__); // parent of public
$searchDir = $startDir;
$found = false;
$tried = [];
// Search up to 6 levels above parent
for ($i = 0; $i <= 6; $i++) {
    $candidate = $searchDir . DIRECTORY_SEPARATOR . 'installer.php';
    $tried[] = $candidate;
    // avoid including this wrapper itself
    if (file_exists($candidate) && realpath($candidate) !== realpath(__FILE__)) {
        require_once $candidate;
        $found = true;
        break;
    }
    $parent = dirname($searchDir);
    if ($parent === false || $parent === $searchDir) break;
    $searchDir = $parent;
}

if (!$found) {
    header('HTTP/1.1 404 Not Found');
    echo "Installer not found.\n";
    echo "Tried these paths:\n";
    foreach ($tried as $t) {
        echo htmlspecialchars($t, ENT_QUOTES | ENT_SUBSTITUTE) . "\n";
    }
    echo "\nopen_basedir: " . ini_get('open_basedir') . "\n";
    echo "\nIf open_basedir is set or the web user cannot read parent directories, copy the root 'installer.php' into the public folder or adjust hosting settings.\n";
    exit;
}

// EOF
?>
