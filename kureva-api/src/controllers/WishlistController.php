<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use Kureva\Middleware\AuthMiddleware;
use PDO;

class WishlistController {
    
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
            $stmt = $db->prepare("SELECT * FROM wishlists WHERE user_id = :user_id ORDER BY created_at DESC");
            $stmt->execute(['user_id' => $user['id']]);
            $wishlists = $stmt->fetchAll();

            // Fetch count of items for each wishlist
            foreach ($wishlists as &$w) {
                $stmtCount = $db->prepare("SELECT COUNT(*) as count FROM wishlist_items WHERE wishlist_id = :wishlist_id");
                $stmtCount->execute(['wishlist_id' => $w['id']]);
                $w['items_count'] = $stmtCount->fetch()['count'] ?? 0;
            }

            echo json_encode(['success' => true, 'data' => $wishlists]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to fetch wishlists']]);
        }
    }

    public function create() {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $visibility = $input['visibility'] ?? 'private';
        $coverImage = trim($input['cover_image'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist name is required']]);
            return;
        }

        if (!in_array($visibility, ['private', 'unlisted', 'public'])) {
            $visibility = 'private';
        }

        $uuid = $this->generateUuid();

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO wishlists (uuid, user_id, name, description, cover_image, visibility) 
                VALUES (:uuid, :user_id, :name, :description, :cover_image, :visibility)
            ");
            $stmt->execute([
                'uuid' => $uuid,
                'user_id' => $user['id'],
                'name' => $name,
                'description' => $description,
                'cover_image' => $coverImage ?: null,
                'visibility' => $visibility
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Wishlist created successfully',
                'data' => [
                    'uuid' => $uuid,
                    'name' => $name,
                    'visibility' => $visibility
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to create wishlist']]);
        }
    }

    public function get(string $uuid) {
        $user = AuthMiddleware::authenticate();
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT w.*, u.username, p.name as owner_name 
                FROM wishlists w 
                JOIN users u ON w.user_id = u.id
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE w.uuid = :uuid
            ");
            $stmt->execute(['uuid' => $uuid]);
            $wishlist = $stmt->fetch();

            if (!$wishlist) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist not found']]);
                return;
            }

            $isOwner = ($user && $user['id'] === $wishlist['user_id']);

            // Visibility checks
            if ($wishlist['visibility'] === 'private' && !$isOwner) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'This wishlist is private.']]);
                return;
            }

            // Fetch wishlist items with reservation & verification details
            $stmtItems = $db->prepare("
                SELECT wi.*, 
                       gr.id as reservation_id,
                       gr.name as reserved_by_name, 
                       gr.email as reserved_by_email, 
                       gr.status as reservation_status,
                       gr.is_verified,
                       gr.note as reservation_note,
                       gr.created_at as reserved_at
                FROM wishlist_items wi 
                LEFT JOIN gift_reservations gr ON wi.id = gr.wishlist_item_id
                WHERE wi.wishlist_id = :wishlist_id 
                ORDER BY wi.created_at DESC
            ");
            $stmtItems->execute(['wishlist_id' => $wishlist['id']]);
            $items = $stmtItems->fetchAll();

            // If not owner, only show claims that have been explicitly verified by the owner.
            // Pending claims remain open to the public so malicious visitors cannot lock items.
            if (!$isOwner) {
                foreach ($items as &$item) {
                    if (empty($item['is_verified'])) {
                        $item['reservation_status'] = null;
                        $item['reserved_by_name'] = null;
                    }
                    unset($item['reserved_by_email']);
                    unset($item['reservation_note']);
                }
            }

            $wishlist['items'] = $items;
            $wishlist['is_owner'] = $isOwner;

            echo json_encode(['success' => true, 'data' => $wishlist]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to retrieve wishlist.']]);
        }
    }

    public function update(string $uuid) {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $db = Database::getConnection();
            
            // Check ownership
            $stmt = $db->prepare("SELECT id, user_id FROM wishlists WHERE uuid = :uuid");
            $stmt->execute(['uuid' => $uuid]);
            $wishlist = $stmt->fetch();

            if (!$wishlist) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist not found']]);
                return;
            }

            if ($wishlist['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');
            $visibility = $input['visibility'] ?? '';
            $coverImage = trim($input['cover_image'] ?? '');

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist name is required']]);
                return;
            }

            $stmtUpdate = $db->prepare("
                UPDATE wishlists 
                SET name = :name, description = :description, cover_image = :cover_image, visibility = :visibility 
                WHERE id = :id
            ");
            $stmtUpdate->execute([
                'name' => $name,
                'description' => $description,
                'cover_image' => $coverImage ?: null,
                'visibility' => $visibility ?: 'private',
                'id' => $wishlist['id']
            ]);

            echo json_encode(['success' => true, 'message' => 'Wishlist updated successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to update wishlist']]);
        }
    }

    public function delete(string $uuid) {
        $user = AuthMiddleware::requireAuth();
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, user_id FROM wishlists WHERE uuid = :uuid");
            $stmt->execute(['uuid' => $uuid]);
            $wishlist = $stmt->fetch();

            if (!$wishlist) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist not found']]);
                return;
            }

            if ($wishlist['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $stmtDelete = $db->prepare("DELETE FROM wishlists WHERE id = :id");
            $stmtDelete->execute(['id' => $wishlist['id']]);

            echo json_encode(['success' => true, 'message' => 'Wishlist deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to delete wishlist']]);
        }
    }

    // --- ITEM CRUD ---

    public function addItem(string $uuid) {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, user_id FROM wishlists WHERE uuid = :uuid");
            $stmt->execute(['uuid' => $uuid]);
            $wishlist = $stmt->fetch();

            if (!$wishlist) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Wishlist not found']]);
                return;
            }

            if ($wishlist['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $name = trim($input['name'] ?? '');
            $imageUrl = trim($input['image_url'] ?? '');
            $productUrl = trim($input['product_url'] ?? '');
            $store = trim($input['store'] ?? '');
            $price = isset($input['price']) && $input['price'] !== '' ? floatval($input['price']) : null;
            $currency = trim($input['currency'] ?? 'USD');
            $description = trim($input['description'] ?? '');
            $notes = trim($input['notes'] ?? '');
            $priority = $input['priority'] ?? 'nice_to_have';
            $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;

            if (empty($name) && !empty($productUrl)) {
                try {
                    $parsed = \Kureva\Services\ProductParserService::parse($productUrl);
                    $name = $parsed['name'] ?? '';
                    if (empty($imageUrl) && !empty($parsed['image_url'])) $imageUrl = $parsed['image_url'];
                    if (empty($store) && !empty($parsed['store'])) $store = $parsed['store'];
                    if ($price === null && !empty($parsed['price'])) $price = $parsed['price'];
                    if (empty($currency) || $currency === 'USD') $currency = $parsed['currency'] ?: 'USD';
                    if (empty($notes) && !empty($parsed['description'])) $notes = $parsed['description'];
                } catch (\Exception $e) {}
            }

            if (empty($name)) {
                if (!empty($productUrl)) {
                    $host = parse_url($productUrl, PHP_URL_HOST) ?? 'Link';
                    $name = "Product from " . preg_replace('/^www\./', '', $host);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => ['message' => 'Please provide a product name or paste a link.']]);
                    return;
                }
            }

            $stmtAdd = $db->prepare("
                INSERT INTO wishlist_items (wishlist_id, name, image_url, product_url, store, price, currency, description, notes, priority, quantity) 
                VALUES (:wishlist_id, :name, :image_url, :product_url, :store, :price, :currency, :description, :notes, :priority, :quantity)
            ");
            $stmtAdd->execute([
                'wishlist_id' => $wishlist['id'],
                'name' => $name,
                'image_url' => $imageUrl ?: null,
                'product_url' => $productUrl ?: null,
                'store' => $store ?: null,
                'price' => $price,
                'currency' => $currency ?: 'USD',
                'description' => $description ?: null,
                'notes' => $notes ?: null,
                'priority' => $priority ?: 'nice_to_have',
                'quantity' => $quantity
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Added to your little collection.'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to add wishlist item: ' . $e->getMessage()]]);
        }
    }

    public function updateItem(string $uuid, int $itemId) {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $db = Database::getConnection();
            
            // Check ownership of wishlist and existence of item
            $stmt = $db->prepare("
                SELECT wi.id, w.user_id 
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                WHERE w.uuid = :uuid AND wi.id = :item_id
            ");
            $stmt->execute(['uuid' => $uuid, 'item_id' => $itemId]);
            $record = $stmt->fetch();

            if (!$record) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Item not found']]);
                return;
            }

            if ($record['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $name = trim($input['name'] ?? '');
            $imageUrl = trim($input['image_url'] ?? '');
            $productUrl = trim($input['product_url'] ?? '');
            $store = trim($input['store'] ?? '');
            $price = isset($input['price']) && $input['price'] !== '' ? floatval($input['price']) : null;
            $currency = trim($input['currency'] ?? 'USD');
            $description = trim($input['description'] ?? '');
            $notes = trim($input['notes'] ?? '');
            $priority = $input['priority'] ?? 'nice_to_have';
            $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => ['message' => 'Item name is required']]);
                return;
            }

            $stmtUpdate = $db->prepare("
                UPDATE wishlist_items 
                SET name = :name, image_url = :image_url, product_url = :product_url, store = :store, 
                    price = :price, currency = :currency, description = :description, notes = :notes, 
                    priority = :priority, quantity = :quantity 
                WHERE id = :id
            ");
            $stmtUpdate->execute([
                'name' => $name,
                'image_url' => $imageUrl ?: null,
                'product_url' => $productUrl ?: null,
                'store' => $store ?: null,
                'price' => $price,
                'currency' => $currency ?: 'USD',
                'description' => $description ?: null,
                'notes' => $notes ?: null,
                'priority' => $priority ?: 'nice_to_have',
                'quantity' => $quantity,
                'id' => $itemId
            ]);

            echo json_encode(['success' => true, 'message' => 'Wishlist item updated successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to update wishlist item']]);
        }
    }

    public function deleteItem(string $uuid, int $itemId) {
        $user = AuthMiddleware::requireAuth();

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT wi.id, w.user_id 
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                WHERE w.uuid = :uuid AND wi.id = :item_id
            ");
            $stmt->execute(['uuid' => $uuid, 'item_id' => $itemId]);
            $record = $stmt->fetch();

            if (!$record) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => ['message' => 'Item not found']]);
                return;
            }

            if ($record['user_id'] !== $user['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
                return;
            }

            $stmtDelete = $db->prepare("DELETE FROM wishlist_items WHERE id = :id");
            $stmtDelete->execute(['id' => $itemId]);

            echo json_encode(['success' => true, 'message' => 'Wishlist item deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to delete wishlist item']]);
        }
    }
}
