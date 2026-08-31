<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use PDO;

class ProfileController {
    
    public function getProfile(string $username) {
        try {
            $db = Database::getConnection();
            
            // Get user & profile details
            $stmt = $db->prepare("
                SELECT u.id, u.username, p.name, p.bio, p.avatar_url 
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.username = :username
            ");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'NOT_FOUND', 'message' => 'Profile not found.']
                ]);
                return;
            }

            // Get public wishlists
            $stmtW = $db->prepare("
                SELECT uuid, name, description, cover_image, created_at 
                FROM wishlists 
                WHERE user_id = :user_id AND visibility = 'public' 
                ORDER BY created_at DESC
            ");
            $stmtW->execute(['user_id' => $user['id']]);
            $wishlists = $stmtW->fetchAll();

            // Fetch items count for public wishlists
            foreach ($wishlists as &$w) {
                $stmtC = $db->prepare("SELECT COUNT(*) as count FROM wishlist_items WHERE wishlist_id = (SELECT id FROM wishlists WHERE uuid = :uuid)");
                $stmtC->execute(['uuid' => $w['uuid']]);
                $w['items_count'] = $stmtC->fetch()['count'] ?? 0;
            }

            // Get public occasions
            $stmtO = $db->prepare("
                SELECT uuid, name, type, date, description, cover_image 
                FROM occasions 
                WHERE user_id = :user_id AND visibility = 'public' 
                ORDER BY date ASC
            ");
            $stmtO->execute(['user_id' => $user['id']]);
            $occasions = $stmtO->fetchAll();

            foreach ($occasions as &$o) {
                // Calculate days remaining
                $targetDate = new \DateTime($o['date']);
                $today = new \DateTime();
                $today->setTime(0, 0, 0);
                $targetDate->setTime(0, 0, 0);
                
                $interval = $today->diff($targetDate);
                $days = (int) $interval->format('%r%a');
                $o['days_until'] = $days;
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'profile' => [
                        'username' => $user['username'],
                        'name' => $user['name'],
                        'bio' => $user['bio'],
                        'avatar_url' => $user['avatar_url']
                    ],
                    'wishlists' => $wishlists,
                    'occasions' => $occasions
                ]
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SERVER_ERROR', 'message' => 'An error occurred fetching the profile.']
            ]);
        }
    }
}
