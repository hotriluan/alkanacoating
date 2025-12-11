<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use App\Services\DbDumper;
use ZipArchive;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    private $backupPath;

    public function __construct()
    {
        $this->backupPath = storage_path('app/backups');
        if (!File::exists($this->backupPath)) {
            File::makeDirectory($this->backupPath, 0755, true);
        }
    }

    /**
     * List all backups
     */
    public function index()
    {
        $files = File::files($this->backupPath);
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => $file->getFilename(),
                'size' => $this->formatSize($file->getSize()),
                'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                'type' => str_contains($file->getFilename(), 'full_') ? 'full' : 'data',
            ];
        }

        // Sort by date desc
        usort($backups, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json($backups);
    }

    /**
     * Create Data Backup (DB + Uploads)
     */
    public function createData()
    {
        try {
            $filename = 'data_backup_' . date('Y-m-d_H-i-s') . '.zip';
            $filepath = $this->backupPath . '/' . $filename;

            $zip = new ZipArchive();
            if ($zip->open($filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {

                // 1. Dump Database
                $sql = DbDumper::dump();
                $zip->addFromString('database.sql', $sql);

                // 2. Add Uploads
                $this->addFolderToZip($zip, public_path('uploads'), 'uploads');

                // 3. Add Storage/Public (Sliders, etc)
                $this->addFolderToZip($zip, storage_path('app/public'), 'storage_public');

                $zip->close();

                return response()->json([
                    'success' => true,
                    'message' => 'Data backup created successfully',
                    'filename' => $filename
                ]);
            }

            return response()->json(['success' => false, 'message' => 'Failed to create zip file'], 500);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Create Full Backup (Source + DB)
     */
    public function createFull()
    {
        try {
            // Increase timeout for full backup
            set_time_limit(300);
            ini_set('memory_limit', '512M');

            $filename = 'full_backup_' . date('Y-m-d_H-i-s') . '.zip';
            $filepath = $this->backupPath . '/' . $filename;

            $zip = new ZipArchive();
            if ($zip->open($filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {

                // 1. Dump Database
                $sql = DbDumper::dump();
                $zip->addFromString('backend/alkanacoating_production.sql', $sql);

                // 2. Add Source Code
                // We need to be careful not to include the backup folder itself or node_modules
                $rootPath = base_path('..'); // Assuming backend is in /backend folder

                // If we are in standard structure: root/backend, root/frontend
                // But user structure seems to be: c:\dev\alkanacoating\backend
                // So base_path is c:\dev\alkanacoating\backend
                // We want to backup c:\dev\alkanacoating

                $sourcePath = dirname(base_path()); // Parent of backend

                $exclude = [
                    '.git',
                    'node_modules',
                    'backend/storage/app/backups', // Don't backup backups
                    'backend/vendor', // Optional: exclude vendor to save space? No, full backup should include it for ease
                    'frontend/node_modules',
                    $filename // Don't include self
                ];

                $this->addFolderToZip($zip, $sourcePath, '', $exclude);

                $zip->close();

                return response()->json([
                    'success' => true,
                    'message' => 'Full system backup created successfully',
                    'filename' => $filename
                ]);
            }

            return response()->json(['success' => false, 'message' => 'Failed to create zip file'], 500);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Download Backup
     */
    public function download($filename)
    {
        $path = $this->backupPath . '/' . $filename;
        if (File::exists($path)) {
            return response()->download($path);
        }
        return response()->json(['message' => 'File not found'], 404);
    }

    /**
     * Download Installer (deploy.php)
     */
    public function downloadInstaller()
    {
        // Assuming deploy.php is in root
        $path = base_path('../deploy.php');
        if (File::exists($path)) {
            return response()->download($path, 'installer.php');
        }
        return response()->json(['message' => 'Installer not found'], 404);
    }

    /**
     * Restore Data Backup
     */
    public function restore($filename)
    {
        try {
            $path = $this->backupPath . '/' . $filename;
            if (!File::exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            $zip = new ZipArchive();
            if ($zip->open($path) === TRUE) {

                // 1. Restore Database
                $sql = $zip->getFromName('database.sql');
                if ($sql) {
                    DB::unprepared($sql);
                }

                // 2. Restore Uploads
                // Extract 'uploads' folder to public/uploads
                // ZipArchive extracts relative paths.
                // We need to extract to a temp folder first
                $tempDir = storage_path('app/temp_restore_' . time());
                File::makeDirectory($tempDir);

                $zip->extractTo($tempDir);
                $zip->close();

                // Move uploads
                if (File::exists($tempDir . '/uploads')) {
                    File::copyDirectory($tempDir . '/uploads', public_path('uploads'));
                }

                // Move storage_public
                if (File::exists($tempDir . '/storage_public')) {
                    File::copyDirectory($tempDir . '/storage_public', storage_path('app/public'));
                }

                // Cleanup
                File::deleteDirectory($tempDir);

                return response()->json([
                    'success' => true,
                    'message' => 'System restored successfully'
                ]);
            }

            return response()->json(['success' => false, 'message' => 'Failed to open zip file'], 500);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete Backup
     */
    public function delete($filename)
    {
        $path = $this->backupPath . '/' . $filename;
        if (File::exists($path)) {
            File::delete($path);
            return response()->json(['success' => true, 'message' => 'Backup deleted']);
        }
        return response()->json(['message' => 'File not found'], 404);
    }

    // Helpers

    private function formatSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    private function addFolderToZip($zip, $folder, $zipFolder, $exclude = [])
    {
        if (!is_dir($folder))
            return;

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($files as $file) {
            $file = realpath($file);
            $relativePath = substr($file, strlen(realpath($folder)) + 1);

            // Check exclusions
            $skip = false;
            foreach ($exclude as $ex) {
                if (str_contains($relativePath, $ex)) {
                    $skip = true;
                    break;
                }
            }
            if ($skip)
                continue;

            $zipPath = $zipFolder ? $zipFolder . '/' . $relativePath : $relativePath;

            if (is_dir($file)) {
                $zip->addEmptyDir($zipPath);
            } else if (is_file($file)) {
                $zip->addFile($file, $zipPath);
            }
        }
    }
}
