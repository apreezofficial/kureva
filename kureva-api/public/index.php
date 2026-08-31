<?php

// Class autoloader mapping Kureva\ namespace to src/ folder
spl_autoload_register(function ($class) {
    $prefix = 'Kureva\\';
    $base_dir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// Configure CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:3000';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Clean query strings out of the path
$path = parse_url($requestUri, PHP_URL_PATH);
$path = rtrim($path, '/');

// Router configuration
$routes = [
    // Auth Routes
    'POST:/api/auth/register' => ['Kureva\Controllers\AuthController', 'register'],
    'POST:/api/auth/login'    => ['Kureva\Controllers\AuthController', 'login'],
    'POST:/api/auth/logout'   => ['Kureva\Controllers\AuthController', 'logout'],
    'GET:/api/auth/me'        => ['Kureva\Controllers\AuthController', 'me'],

    // Wishlist Routes
    'GET:/api/wishlists'      => ['Kureva\Controllers\WishlistController', 'list'],
    'POST:/api/wishlists'     => ['Kureva\Controllers\WishlistController', 'create'],
    'GET:/api/wishlists/([^/]+)' => ['Kureva\Controllers\WishlistController', 'get'],
    'PATCH:/api/wishlists/([^/]+)' => ['Kureva\Controllers\WishlistController', 'update'],
    'DELETE:/api/wishlists/([^/]+)' => ['Kureva\Controllers\WishlistController', 'delete'],

    // Wishlist Items
    'POST:/api/wishlists/([^/]+)/items' => ['Kureva\Controllers\WishlistController', 'addItem'],
    'PATCH:/api/wishlists/([^/]+)/items/([0-9]+)' => ['Kureva\Controllers\WishlistController', 'updateItem'],
    'DELETE:/api/wishlists/([^/]+)/items/([0-9]+)' => ['Kureva\Controllers\WishlistController', 'deleteItem'],

    // Product preview / metadata parsing and uploads
    'POST:/api/products/preview' => ['Kureva\Controllers\ProductController', 'preview'],
    'POST:/api/upload' => ['Kureva\Controllers\ProductController', 'uploadImage'],

    // Gift Reservations
    'POST:/api/items/([0-9]+)/reserve' => ['Kureva\Controllers\ReservationController', 'reserve'],
    'POST:/api/items/([0-9]+)/purchase' => ['Kureva\Controllers\ReservationController', 'purchase'],

    // Occasion Routes
    'GET:/api/occasions'      => ['Kureva\Controllers\OccasionController', 'list'],
    'POST:/api/occasions'     => ['Kureva\Controllers\OccasionController', 'create'],
    'GET:/api/occasions/([^/]+)' => ['Kureva\Controllers\OccasionController', 'get'],
    'PATCH:/api/occasions/([^/]+)' => ['Kureva\Controllers\OccasionController', 'update'],
    'DELETE:/api/occasions/([^/]+)' => ['Kureva\Controllers\OccasionController', 'delete'],

    // Profile Discovery
    'GET:/api/users/([^/]+)'  => ['Kureva\Controllers\ProfileController', 'getProfile'],
];

// Match router request
$routeKey = "$requestMethod:$path";
$matched = false;

foreach ($routes as $routePattern => $controllerAction) {
    // Escape pattern delimiters
    $pattern = '#^' . preg_replace('#/([^/]+)#', '/([^/]+)', $routePattern) . '$#';
    
    // Convert static routes back to exact patterns
    $pattern = str_replace('POST:', 'POST:', $pattern);
    $pattern = str_replace('GET:', 'GET:', $pattern);
    $pattern = str_replace('PATCH:', 'PATCH:', $pattern);
    $pattern = str_replace('DELETE:', 'DELETE:', $pattern);

    // Dynamic replacement match
    // Simple custom regex compiler to handle dynamic placeholders
    $regex = $routePattern;
    $regex = str_replace('([^/]+)', '__PARAM__', $regex);
    $regex = str_replace('([0-9]+)', '__NUM__', $regex);
    
    $regex = preg_quote($regex, '#');
    
    $regex = str_replace('__PARAM__', '([^/]+)', $regex);
    $regex = str_replace('__NUM__', '([0-9]+)', $regex);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $routeKey, $matches)) {
        array_shift($matches); // Remove full match
        
        $className = $controllerAction[0];
        $methodName = $controllerAction[1];
        
        if (class_exists($className)) {
            try {
                $controllerInstance = new $className();
                call_user_func_array([$controllerInstance, $methodName], $matches);
            } catch (\Throwable $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => [
                        'code' => 'SERVER_ERROR',
                        'message' => $e->getMessage()
                    ]
                ]);
            }
            $matched = true;
            break;
        }
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'NOT_FOUND',
            'message' => "Requested route $requestMethod $path not found."
        ]
    ]);
}
