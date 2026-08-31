<?php

namespace Kureva\Controllers;

use Kureva\Services\ProductParserService;

class ProductController {
    
    public function preview() {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $url = trim($input['url'] ?? '');

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'A valid product URL is required.']
            ]);
            return;
        }

        try {
            $preview = ProductParserService::parse($url);
            echo json_encode([
                'success' => true,
                'data' => $preview
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'PARSE_ERROR', 'message' => 'Failed to parse metadata from the given URL. Please fill in details manually.']
            ]);
        }
    }
}
