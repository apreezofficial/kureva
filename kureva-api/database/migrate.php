<?php

require_once __DIR__ . '/../src/config/Database.php';

use Kureva\Config\Database;

try {
    $db = Database::getConnection();
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "Running migrations using driver: $driver\n";

    $sqlPath = __DIR__ . '/schema.sql';
    if (!file_exists($sqlPath)) {
        die("schema.sql not found at $sqlPath\n");
    }

    $sql = file_get_contents($sqlPath);

    if ($driver === 'sqlite') {
        // Adapt schema.sql for SQLite syntax
        $sql = preg_replace('/ENGINE\s*=\s*\w+/', '', $sql);
        $sql = preg_replace('/DEFAULT\s+CHARSET\s*=\s*\w+/', '', $sql);
        $sql = preg_replace('/ON UPDATE CURRENT_TIMESTAMP/', '', $sql);
        $sql = preg_replace('/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/', 'DATETIME DEFAULT CURRENT_TIMESTAMP', $sql);
        $sql = preg_replace('/ENUM\([^)]+\)/i', 'VARCHAR(50)', $sql);
        
        // SQLite AUTOINCREMENT requires INTEGER PRIMARY KEY AUTOINCREMENT
        $sql = preg_replace('/id\s+INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/i', 'id INTEGER PRIMARY KEY AUTOINCREMENT', $sql);
        $sql = preg_replace('/user_id\s+INT\s+PRIMARY\s+KEY/i', 'user_id INTEGER PRIMARY KEY', $sql);
        $sql = preg_replace('/AUTO_INCREMENT/', 'AUTOINCREMENT', $sql);
        
        // Also split queries since SQLite PDO exec does not support multiple queries with constraints in some versions
        $queries = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($queries as $query) {
            if (!empty($query)) {
                $db->exec($query);
            }
        }
    } else {
        $db->exec($sql);
    }

    echo "Migrations ran successfully!\n";
} catch (Exception $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
