<?php

namespace Kureva\Middleware;

use Kureva\Config\Database;
use PDO;

class AuthMiddleware {
    public static function authenticate(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        $token = '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }

        if (empty($token) && isset($_COOKIE['kureva_session'])) {
            $token = $_COOKIE['kureva_session'];
        }

        if (empty($token)) {
            return null;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT u.id, u.username, u.email, p.name, p.bio, p.avatar_url 
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE s.id = :token AND s.expires_at > CURRENT_TIMESTAMP
            ");
            $stmt->execute(['token' => $token]);
            $user = $stmt->fetch();

            return $user ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function requireAuth(): array {
        $user = self::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'You must be logged in to access this resource.'
                ]
            ]);
            exit;
        }
        return $user;
    }
}
