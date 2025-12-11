<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use PDO;

class DbDumper
{
    public static function dump()
    {
        $pdo = DB::connection()->getPdo();
        $output = "";

        // Get all tables
        $tables = [];
        $result = $pdo->query("SHOW TABLES");
        while ($row = $result->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }

        // Disable foreign key checks
        $output .= "SET FOREIGN_KEY_CHECKS=0;\n";
        $output .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
        $output .= "SET time_zone = \"+00:00\";\n\n";

        foreach ($tables as $table) {
            // Drop table
            $output .= "DROP TABLE IF EXISTS `$table`;\n";

            // Create table structure
            $row2 = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
            $output .= $row2[1] . ";\n\n";

            // Insert data
            $result = $pdo->query("SELECT * FROM `$table`");
            while ($row = $result->fetch(PDO::FETCH_NUM)) {
                $output .= "INSERT INTO `$table` VALUES(";
                $temp = [];
                foreach ($row as $value) {
                    if (isset($value)) {
                        $value = addslashes($value);
                        $value = str_replace("\n", "\\n", $value);
                        $temp[] = '"' . $value . '"';
                    } else {
                        $temp[] = 'NULL';
                    }
                }
                $output .= implode(',', $temp);
                $output .= ");\n";
            }
            $output .= "\n\n";
        }

        // Enable foreign key checks
        $output .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $output;
    }
}
