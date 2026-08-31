<?php

namespace Kureva\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // Load simple dotenv
        $envFile = __DIR__ . '/../../.env';
        $env = [];
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                list($name, $value) = explode('=', $line, 2);
                $env[trim($name)] = trim($value);
            }
        }

        $driver = $env['DB_DRIVER'] ?? 'mysql';
        $host = $env['DB_HOST'] ?? '127.0.0.1';
        $port = $env['DB_PORT'] ?? '3306';
        $dbName = $env['DB_DATABASE'] ?? 'kureva';
        $username = $env['DB_USERNAME'] ?? 'root';
        $password = $env['DB_PASSWORD'] ?? '';
        $sqlitePath = $env['DB_SQLITE_PATH'] ?? 'database/database.sqlite';
        $fallbackSqlite = ($env['DB_FALLBACK_SQLITE'] ?? 'true') === 'true';

        if ($driver === 'mysql') {
            try {
                $dsn = "mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4";
                self::$instance = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
                return self::$instance;
            } catch (PDOException $e) {
                if ($fallbackSqlite) {
                    error_log("MySQL Connection failed: " . $e->getMessage() . ". Falling back to SQLite.");
                    $driver = 'sqlite';
                } else {
                    throw $e;
                }
            }
        }

        if ($driver === 'sqlite') {
            $fullPath = __DIR__ . '/../../' . $sqlitePath;
            $dir = dirname($fullPath);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            $dsn = "sqlite:$fullPath";
            self::$instance = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Enable foreign keys in SQLite
            self::$instance->exec('PRAGMA foreign_keys = ON;');
            return self::$instance;
        }

        throw new \Exception("Unsupported DB driver");
    }
}
