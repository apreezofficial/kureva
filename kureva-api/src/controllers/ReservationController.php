<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use Kureva\Middleware\AuthMiddleware;
use PDO;

class ReservationController {
    
    public function reserve(int $itemId) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $note = trim($input['note'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Name is required to reserve this gift.']
            ]);
            return;
        }

        try {
            $db = Database::getConnection();

            // Verify item exists
            $stmtItem = $db->prepare("SELECT id FROM wishlist_items WHERE id = :item_id");
            $stmtItem->execute(['item_id' => $itemId]);
            if (!$stmtItem->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'NOT_FOUND', 'message' => 'Item not found.']
                ]);
                return;
            }

            // Check if item is already reserved
            $stmtCheck = $db->prepare("SELECT id, status FROM gift_reservations WHERE wishlist_item_id = :item_id");
            $stmtCheck->execute(['item_id' => $itemId]);
            $existing = $stmtCheck->fetch();

            if ($existing) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'ALREADY_CLAIMED', 'message' => 'This gift has already been claimed by another guest.']
                ]);
                return;
            }

            $stmtReserve = $db->prepare("
                INSERT INTO gift_reservations (wishlist_item_id, name, email, note, status, is_verified, created_at) 
                VALUES (:item_id, :name, :email, :note, 'reserved', 0, CURRENT_TIMESTAMP)
            ");
            $stmtReserve->execute([
                'item_id' => $itemId,
                'name' => $name,
                'email' => $email,
                'note' => $note ?: null
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Gift reserved! We\'ve locked it so others won\'t buy duplicates.',
                'data' => [
                    'item_id' => $itemId,
                    'status' => 'reserved',
                    'is_verified' => 0
                ]
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SERVER_ERROR', 'message' => 'An error occurred. Please try again.']
            ]);
        }
    }

    public function purchase(int $itemId) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $note = trim($input['note'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Name is required to claim this gift as bought.']
            ]);
            return;
        }

        try {
            $db = Database::getConnection();

            // Verify item exists
            $stmtItem = $db->prepare("SELECT id FROM wishlist_items WHERE id = :item_id");
            $stmtItem->execute(['item_id' => $itemId]);
            if (!$stmtItem->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'NOT_FOUND', 'message' => 'Item not found.']
                ]);
                return;
            }

            // Check if there is an existing reservation
            $stmtCheck = $db->prepare("SELECT id, status FROM gift_reservations WHERE wishlist_item_id = :item_id");
            $stmtCheck->execute(['item_id' => $itemId]);
            $existing = $stmtCheck->fetch();

            if ($existing) {
                // Update to purchased
                $stmtUpdate = $db->prepare("
                    UPDATE gift_reservations 
                    SET name = :name, email = :email, note = :note, status = 'purchased', is_verified = 0, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = :id
                ");
                $stmtUpdate->execute([
                    'name' => $name,
                    'email' => $email,
                    'note' => $note ?: null,
                    'id' => $existing['id']
                ]);
            } else {
                // Insert new purchase claim
                $stmtInsert = $db->prepare("
                    INSERT INTO gift_reservations (wishlist_item_id, name, email, note, status, is_verified, created_at) 
                    VALUES (:item_id, :name, :email, :note, 'purchased', 0, CURRENT_TIMESTAMP)
                ");
                $stmtInsert->execute([
                    'item_id' => $itemId,
                    'name' => $name,
                    'email' => $email,
                    'note' => $note ?: null
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Thank you for your gift! Your claim is recorded and the item is marked as purchased.',
                'data' => [
                    'item_id' => $itemId,
                    'status' => 'purchased',
                    'is_verified' => 0
                ]
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SERVER_ERROR', 'message' => 'An error occurred. Please try again.']
            ]);
        }
    }

    /**
     * Wishlist owner verifies/approves a gift claim
     */
    public function verifyClaim(int $itemId) {
        $user = AuthMiddleware::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
            return;
        }

        try {
            $db = Database::getConnection();

            // Verify ownership
            $stmtOwner = $db->prepare("
                SELECT wi.id 
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                WHERE wi.id = :item_id AND w.user_id = :user_id
            ");
            $stmtOwner->execute(['item_id' => $itemId, 'user_id' => $user['id']]);
            if (!$stmtOwner->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'You do not own this wishlist item.']]);
                return;
            }

            $stmtVerify = $db->prepare("
                UPDATE gift_reservations 
                SET is_verified = 1, status = 'verified', verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE wishlist_item_id = :item_id
            ");
            $stmtVerify->execute(['item_id' => $itemId]);

            echo json_encode([
                'success' => true,
                'message' => 'Gift verified! Marked as received and confirmed.',
                'data' => ['item_id' => $itemId, 'is_verified' => 1, 'status' => 'verified']
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to verify gift claim.']]);
        }
    }

    /**
     * Wishlist owner declines or releases a gift claim (makes item available again)
     */
    public function releaseClaim(int $itemId) {
        $user = AuthMiddleware::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => ['message' => 'Unauthorized']]);
            return;
        }

        try {
            $db = Database::getConnection();

            // Verify ownership
            $stmtOwner = $db->prepare("
                SELECT wi.id 
                FROM wishlist_items wi
                JOIN wishlists w ON wi.wishlist_id = w.id
                WHERE wi.id = :item_id AND w.user_id = :user_id
            ");
            $stmtOwner->execute(['item_id' => $itemId, 'user_id' => $user['id']]);
            if (!$stmtOwner->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => ['message' => 'You do not own this wishlist item.']]);
                return;
            }

            $stmtDelete = $db->prepare("DELETE FROM gift_reservations WHERE wishlist_item_id = :item_id");
            $stmtDelete->execute(['item_id' => $itemId]);

            echo json_encode([
                'success' => true,
                'message' => 'Claim released. The item is now open and available for other guests.',
                'data' => ['item_id' => $itemId, 'reservation_status' => null]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => ['message' => 'Failed to release gift claim.']]);
        }
    }
}
