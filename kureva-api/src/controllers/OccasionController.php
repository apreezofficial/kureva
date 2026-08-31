<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use Kureva\Middleware\AuthMiddleware;
use PDO;

class OccasionController {

    private function generateUuid(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public function list() {
        $user = AuthMiddleware::requireAuth();
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM occasions WHERE user_id = :user_id ORDER BY date ASC");
            $stmt->execute(['user_id' => $user['id']]);
            $occasions = $stmt->fetchAll();

            foreach ($occasions as &$o) {
                // Calculate days remaining
                $targetDate = new \DateTime($o['date']);
                $today = new \DateTime();
                $today->setTime(0, 0, 0);
                $targetDate->setTime(0, 0, 0);
                
                $interval = $today->diff($targetDate);
                $days = (int) $interval->format('%r%a');
                $o['days_until'] = $days;

                // Fetch attached wishlists
                $stmtW = $db->prepare("
                    SELECT w.uuid, w.name, w.visibility 
                    FROM occasion_wishlists ow
                    JOIN wishlists w ON ow.wishlist_id = w.id
                    WHERE ow.occasion_id = :occasion_id
                ");
                $stmtW->execute(['occasion_id' => $o['id']]);
                $o['wishlists'] = $stmtW->fetchAll();
            }

            echo json_encode(['success' => true, 'data' => $occasions]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to fetch occasions']]);
        }
    }

    public function create() {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $name = trim($input['name'] ?? '');
        $type = trim($input['type'] ?? 'birthday');
        $date = trim($input['date'] ?? '');
        $description = trim($input['description'] ?? '');
        $location = trim($input['location'] ?? '');
        $visibility = $input['visibility'] ?? 'private';
        $coverImage = trim($input['cover_image'] ?? '');
        $wishlistIds = $input['wishlist_ids'] ?? []; // Array of wishlist UUIDs

        if (empty($name) || empty($date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => ['message' => 'Occasion name and date are required']]);
            return;
        }

        if (!in_array($visibility, ['private', 'unlisted', 'public'])) {
            $visibility = 'private';
        }

        $uuid = $this->generateUuid();

        try {
            $db = Database::getConnection();
            $db->beginTransaction();

            $stmt = $db->prepare("
                INSERT INTO occasions (uuid, user_id, name, type, date, description, location, cover_image, visibility) 
                VALUES (:uuid, :user_id, :name, :type, :date, :description, :location, :cover_image, :visibility)
            ");
            $stmt->execute([
                'uuid' => $uuid,
                'user_id' => $user['id'],
                'name' => $name,
                'type' => $type,
                'date' => $date,
                'description' => $description ?: null,
                'location' => $location ?: null,
                'cover_image' => $coverImage ?: null,
                'visibility' => $visibility
            ]);

            $occasionId = $db->lastInsertId();

            // Link wishlists
            if (!empty($wishlistIds)) {
                // Convert wishlist UUIDs to IDs, filtering by owner to ensure authorization
                $placeholders = implode(',', array_fill(0, count($wishlistIds), '?'));
                $stmtW = $db->prepare("SELECT id FROM wishlists WHERE uuid IN ($placeholders) AND user_id = ?");
                $params = array_merge($wishlistIds, [$user['id']]);
                $stmtW->execute($params);
                $wishlistDbIds = $stmtW->fetchAll(PDO::FETCH_COLUMN);

                foreach ($wishlistDbIds as $wId) {
                    $stmtLink = $db->prepare("INSERT INTO occasion_wishlists (occasion_id, wishlist_id) VALUES (?, ?)");
                    $stmtLink->execute([$occasionId, $wId]);
                }
            }

            $db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'It\'s on the calendar.',
                'data' => ['uuid' => $uuid]
            ]);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to create occasion: ' . $e->getMessage()]]);
        }
    }

    public function get(string $uuid) {
        $user = AuthMiddleware::authenticate();
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT o.*, u.username, p.name as owner_name 
                FROM occasions o 
                JOIN users u ON o.user_id = u.id
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE o.uuid = :uuid
            ");
            $stmt->execute(['uuid' => $uuid]);
            $occasion = $stmt->fetch();

            if (!$occasion) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Occasion not found']]);
                return;
            }

            $isOwner = ($user && $user['id'] === $occasion['user_id']);

            // Visibility checks
            if ($occasion['visibility'] === 'private' && !$isOwner) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'This occasion is private.']]);
                return;
            }

            // Calculate countdown days
            $targetDate = new \DateTime($occasion['date']);
            $today = new \DateTime();
            $today->setTime(0, 0, 0);
            $targetDate->setTime(0, 0, 0);
            
            $interval = $today->diff($targetDate);
            $days = (int) $interval->format('%r%a');
            $occasion['days_until'] = $days;

            // Fetch attached wishlists (only those visible to this viewer)
            $stmtW = $db->prepare("
                SELECT w.uuid, w.name, w.description, w.cover_image, w.visibility 
                FROM occasion_wishlists ow
                JOIN wishlists w ON ow.wishlist_id = w.id
                WHERE ow.occasion_id = :occasion_id
            ");
            $stmtW->execute(['occasion_id' => $occasion['id']]);
            $wishlists = $stmtW->fetchAll();

            // Filter out private wishlists if user is not owner
            if (!$isOwner) {
                $wishlists = array_filter($wishlists, function ($w) {
                    return $w['visibility'] !== 'private';
                });
                $wishlists = array_values($wishlists);
            }

            $occasion['wishlists'] = $wishlists;
            $occasion['is_owner'] = $isOwner;

            echo json_encode(['success' => true, 'data' => $occasion]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to retrieve occasion']]);
        }
    }

    public function update(string $uuid) {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $db = Database::getConnection();
            
            // Check ownership
            $stmt = $db->prepare("SELECT id, user_id FROM occasions WHERE uuid = :uuid");
            $stmt->execute(['uuid' => $uuid]);
            $occasion = $stmt->fetch();

            if (!$occasion) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Occasion not found']]);
                return;
            }

            if ($occasion['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $name = trim($input['name'] ?? '');
            $type = trim($input['type'] ?? 'birthday');
            $date = trim($input['date'] ?? '');
            $description = trim($input['description'] ?? '');
            $location = trim($input['location'] ?? '');
            $visibility = $input['visibility'] ?? 'private';
            $coverImage = trim($input['cover_image'] ?? '');
            $wishlistIds = $input['wishlist_ids'] ?? [];

            if (empty($name) || empty($date)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => ['message' => 'Name and date are required']]);
                return;
            }

            $db->beginTransaction();

            $stmtUpdate = $db->prepare("
                UPDATE occasions 
                SET name = :name, type = :type, date = :date, description = :description, 
                    location = :location, cover_image = :cover_image, visibility = :visibility 
                WHERE id = :id
            ");
            $stmtUpdate->execute([
                'name' => $name,
                'type' => $type,
                'date' => $date,
                'description' => $description ?: null,
                'location' => $location ?: null,
                'cover_image' => $coverImage ?: null,
                'visibility' => $visibility,
                'id' => $occasion['id']
            ]);

            // Sync wishlists: delete existing linkages and recreate
            $stmtDelLinks = $db->prepare("DELETE FROM occasion_wishlists WHERE occasion_id = :occasion_id");
            $stmtDelLinks->execute(['occasion_id' => $occasion['id']]);

            if (!empty($wishlistIds)) {
                $placeholders = implode(',', array_fill(0, count($wishlistIds), '?'));
                $stmtW = $db->prepare("SELECT id FROM wishlists WHERE uuid IN ($placeholders) AND user_id = ?");
                $params = array_merge($wishlistIds, [$user['id']]);
                $stmtW->execute($params);
                $wishlistDbIds = $stmtW->fetchAll(PDO::FETCH_COLUMN);

                foreach ($wishlistDbIds as $wId) {
                    $stmtLink = $db->prepare("INSERT INTO occasion_wishlists (occasion_id, wishlist_id) VALUES (?, ?)");
                    $stmtLink->execute([$occasion['id'], $wId]);
                }
            }

            $db->commit();

            echo json_encode(['success' => true, 'message' => 'Occasion updated successfully']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to update occasion: ' . $e->getMessage()]]);
        }
    }

    public function delete(string $uuid) {
        $user = AuthMiddleware::requireAuth();
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, user_id FROM occasions WHERE uuid = :uuid");
            $stmt->execute(['uuid' => $uuid]);
            $occasion = $stmt->fetch();

            if (!$occasion) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Occasion not found']]);
                return;
            }

            if ($occasion['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $stmtDelete = $db->prepare("DELETE FROM occasions WHERE id = :id");
            $stmtDelete->execute(['id' => $occasion['id']]);

            echo json_encode(['success' => true, 'message' => 'Occasion deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to delete occasion']]);
        }
    }
}
