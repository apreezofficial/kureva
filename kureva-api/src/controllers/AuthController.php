<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use Kureva\Middleware\AuthMiddleware;
use PDO;

class AuthController {
    public function register() {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $username = trim($input['username'] ?? '');
        $name = trim($input['name'] ?? $username);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($username) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Username, email, and password are required.']
            ]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Invalid email address.']
            ]);
            return;
        }

        if (strlen($username) < 3 || !preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Username must be at least 3 alphanumeric characters/underscores.']
            ]);
            return;
        }

        try {
            $db = Database::getConnection();
            
            // Check if username/email already exists
            $stmt = $db->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
            $stmt->execute(['username' => $username, 'email' => $email]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'DUPLICATE_ERROR', 'message' => 'Username or email already exists.']
                ]);
                return;
            }

            $db->beginTransaction();

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)");
            $stmt->execute([
                'username' => $username,
                'email' => $email,
                'password_hash' => $passwordHash
            ]);

            $userId = $db->lastInsertId();

            $stmt = $db->prepare("INSERT INTO user_profiles (user_id, name) VALUES (:user_id, :name)");
            $stmt->execute([
                'user_id' => $userId,
                'name' => $name
            ]);

            $db->commit();

            // Auto-login after registration
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

            $stmt = $db->prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (:id, :user_id, :expires_at)");
            $stmt->execute([
                'id' => $token,
                'user_id' => $userId,
                'expires_at' => $expiresAt
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Konnichiwa! Welcome to Kureva.',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $userId,
                        'username' => $username,
                        'email' => $email,
                        'name' => $name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SERVER_ERROR', 'message' => 'An error occurred during registration. Please try again.']
            ]);
        }
    }

    public function login() {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $identity = trim($input['identity'] ?? ''); // username or email
        $password = $input['password'] ?? '';

        if (empty($identity) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Username/email and password are required.']
            ]);
            return;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT u.id, u.username, u.email, u.password_hash, p.name, p.bio, p.avatar_url 
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.username = :identity OR u.email = :identity
            ");
            $stmt->execute(['identity' => $identity]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'INVALID_CREDENTIALS', 'message' => 'Invalid username/email or password.']
                ]);
                return;
            }

            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

            $stmt = $db->prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (:id, :user_id, :expires_at)");
            $stmt->execute([
                'id' => $token,
                'user_id' => $user['id'],
                'expires_at' => $expiresAt
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Welcome back.',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'name' => $user['name'],
                        'bio' => $user['bio'],
                        'avatar_url' => $user['avatar_url']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SERVER_ERROR', 'message' => 'An error occurred during login. Please try again.']
            ]);
        }
    }

    public function logout() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
        if (empty($token) && isset($_COOKIE['kureva_session'])) {
            $token = $_COOKIE['kureva_session'];
        }

        if (!empty($token)) {
            try {
                $db = Database::getConnection();
                $stmt = $db->prepare("DELETE FROM sessions WHERE id = :token");
                $stmt->execute(['token' => $token]);
            } catch (\Exception $e) {
                // Fail silently
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }

    public function me() {
        $user = AuthMiddleware::requireAuth();
        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }
}
