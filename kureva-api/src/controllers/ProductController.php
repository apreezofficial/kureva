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

    public function uploadImage() {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'UPLOAD_ERROR', 'message' => 'No image file uploaded or upload error occurred.']
            ]);
            return;
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Only JPG, PNG, GIF, and WEBP images are allowed.']
            ]);
            return;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('wish_', true) . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            // Determine host dynamically
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
            $url = $protocol . $host . '/uploads/' . $filename;

            echo json_encode([
                'success' => true,
                'data' => ['url' => $url]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['code' => 'SAVE_ERROR', 'message' => 'Failed to save uploaded image file.']
            ]);
        }
    }

    public function proxyImage() {
        $url = $_GET['url'] ?? '';
        if (empty($url)) {
            http_response_code(400);
            echo "Missing URL parameter.";
            exit;
        }

        // 1. Check if it's a local upload
        if (strpos($url, '/uploads/') !== false || strpos($url, 'uploads/') !== false) {
            $parsedPath = parse_url($url, PHP_URL_PATH);
            $filename = basename($parsedPath);
            $localFile = __DIR__ . '/../../public/uploads/' . $filename;
            if (file_exists($localFile)) {
                $mime = mime_content_type($localFile) ?: 'image/jpeg';
                header("Content-Type: $mime");
                header("Access-Control-Allow-Origin: *");
                header("Cache-Control: public, max-age=86400");
                readfile($localFile);
                exit;
            }
        }

        // 2. Fetch remote external image via cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_ENCODING, '');
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $data = curl_exec($ch);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
        curl_close($ch);

        if ($data) {
            header("Content-Type: $contentType");
            header("Access-Control-Allow-Origin: *");
            header("Cache-Control: public, max-age=86400");
            echo $data;
            exit;
        }

        http_response_code(404);
        exit;
    }
}
