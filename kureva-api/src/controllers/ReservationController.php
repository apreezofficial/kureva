<?php

namespace Kureva\Controllers;

use Kureva\Config\Database;
use PDO;

class ReservationController {
    
    public function reserve(int $itemId) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');

        if (empty($name) || empty($email)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Name and email are required to reserve this gift.']
            ]);
            return;
        }

        try {
            $db = Database::getConnection();

            // Check if item is already reserved
            $stmtCheck = $db->prepare("SELECT id, status FROM gift_reservations WHERE wishlist_item_id = :item_id");
            $stmtCheck->execute(['item_id' => $itemId]);
            $existing = $stmtCheck->fetch();

            if ($existing) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => ['code' => 'ALREADY_RESERVED', 'message' => 'This gift has already been reserved.']
                ]);
                return;
            }

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

            $stmtReserve = $db->prepare("
                INSERT INTO gift_reservations (wishlist_item_id, name, email, status) 
                VALUES (:item_id, :name, :email, 'reserved')
            ");
            $stmtReserve->execute([
                'item_id' => $itemId,
                'name' => $name,
                'email' => $email
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'It\'s yours. We won\'t tell. 🤫',
                'data' => [
                    'item_id' => $itemId,
                    'status' => 'reserved'
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

        if (empty($name) || empty($email)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Name and email are required to mark this gift as purchased.']
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
                    SET name = :name, email = :email, status = 'purchased' 
                    WHERE id = :id
                ");
                $stmtUpdate->execute([
                    'name' => $name,
                    'email' => $email,
                    'id' => $existing['id']
                ]);
            } else {
                // Insert new purchase
                $stmtInsert = $db->prepare("
                    INSERT INTO gift_reservations (wishlist_item_id, name, email, status) 
                    VALUES (:item_id, :name, :email, 'purchased')
                ");
                $stmtInsert->execute([
                    'item_id' => $itemId,
                    'name' => $name,
                    'email' => $email
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Thank you for your generous gift! Arigatō.',
                'data' => [
                    'item_id' => $itemId,
                    'status' => 'purchased'
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
}
