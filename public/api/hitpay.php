<?php
/**
 * Khairul FRESH Food - PHP Backend Proxy for HitPay & Fonnte
 * Runs natively on HestiaCP / Nginx / Apache with PHP-FPM (No Node.js or PM2 required!)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-BUSINESS-API-KEY');

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Get action from query string or body
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// Parse incoming JSON body if available
$rawInput = file_get_contents('php://input');
$body = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}

// If action is in body, respect it
if (empty($action) && isset($body['action'])) {
    $action = trim($body['action']);
}

// If action is still empty, infer from REQUEST_URI
if (empty($action)) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, 'create-payment') !== false) {
        $action = 'create-payment';
    } elseif (strpos($uri, 'test-connection') !== false) {
        $action = 'test-connection';
    } elseif (strpos($uri, 'payment-status') !== false) {
        $action = 'payment-status';
    } elseif (strpos($uri, 'webhook') !== false) {
        $action = 'webhook';
    } elseif (strpos($uri, 'health') !== false) {
        $action = 'health';
    } else {
        $action = 'health';
    }
}

/**
 * Helper function for executing cURL requests with fallback
 */
function callHitPayApi($url, $method = 'GET', $headers = [], $data = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

    if ($data !== null) {
        $payload = is_string($data) ? $data : json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    $curlErrNo = curl_errno($ch);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => $response,
        'error' => $curlErr,
        'errno' => $curlErrNo,
    ];
}

// ==========================================================
// ROUTE: Health Check
// ==========================================================
if ($action === 'health') {
    echo json_encode([
        'status' => 'ok',
        'service' => 'Khairul FRESH Food PHP Backend',
        'timestamp' => date('c'),
        'php_version' => PHP_VERSION,
        'curl_available' => function_exists('curl_version'),
    ]);
    exit;
}

// Helper to read server-saved config
function getHitPayServerConfig() {
    $cfgFile = __DIR__ . '/hitpay_config.json';
    if (file_exists($cfgFile)) {
        $content = @file_get_contents($cfgFile);
        if ($content) {
            $parsed = @json_decode($content, true);
            if (is_array($parsed)) return $parsed;
        }
    }
    return [];
}

// ==========================================================
// ROUTE: Save Server Config (Admin)
// ==========================================================
if ($action === 'save-config') {
    $apiKey = trim($body['apiKey'] ?? $_POST['apiKey'] ?? '');
    $salt = trim($body['salt'] ?? $_POST['salt'] ?? '');
    $isSandbox = !empty($body['isSandbox']) || (isset($_POST['isSandbox']) && $_POST['isSandbox'] === 'true');

    $cfg = [
        'apiKey' => $apiKey,
        'salt' => $salt,
        'isSandbox' => $isSandbox,
        'updated_at' => date('c'),
    ];

    $cfgFile = __DIR__ . '/hitpay_config.json';
    $saved = @file_put_contents($cfgFile, json_encode($cfg, JSON_PRETTY_PRINT));

    if ($saved !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Konfigurasi HitPay berjaya disimpan ke pelayan HestiaCP!',
            'environment' => $isSandbox ? 'sandbox' : 'production',
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Gagal menulis fail konfigurasi di pelayan (periksa keizinan folder api).'
        ]);
    }
    exit;
}

// ==========================================================
// ROUTE: Get Server Config
// ==========================================================
if ($action === 'get-config') {
    $cfg = getHitPayServerConfig();
    echo json_encode([
        'success' => true,
        'hasApiKey' => !empty($cfg['apiKey']),
        'isSandbox' => !empty($cfg['isSandbox']),
        'maskedApiKey' => !empty($cfg['apiKey']) ? substr($cfg['apiKey'], 0, 4) . '...' . substr($cfg['apiKey'], -4) : '',
        'updated_at' => $cfg['updated_at'] ?? null,
    ]);
    exit;
}

// ==========================================================
// ROUTE: Test Connection
// ==========================================================
if ($action === 'test-connection') {
    $apiKey = trim($body['apiKey'] ?? $_POST['apiKey'] ?? '');
    $isSandbox = !empty($body['isSandbox']) || (isset($_POST['isSandbox']) && $_POST['isSandbox'] === 'true');

    if (empty($apiKey)) {
        $serverCfg = getHitPayServerConfig();
        $apiKey = $serverCfg['apiKey'] ?? '';
        if (isset($serverCfg['isSandbox'])) {
            $isSandbox = !empty($serverCfg['isSandbox']);
        }
    }

    if (empty($apiKey)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Sila masukkan HitPay API Key (X-BUSINESS-API-KEY) terlebih dahulu.'
        ]);
        exit;
    }

    $baseUrl = $isSandbox ? 'https://api.sandbox.hit-pay.com/v1' : 'https://api.hit-pay.com/v1';
    $res = callHitPayApi("$baseUrl/payment-requests", 'GET', [
        "X-BUSINESS-API-KEY: $apiKey",
        'Content-Type: application/json',
        'X-Requested-With: XMLHttpRequest'
    ]);

    if ($res['code'] >= 200 && $res['code'] < 300) {
        $data = json_decode($res['body'], true);
        echo json_encode([
            'success' => true,
            'message' => 'Sambungan API HitPay Berjaya! (' . ($isSandbox ? 'Mod Sandbox / Ujian' : 'Mod Pengeluaran / Live') . ')',
            'data' => $data,
            'environment' => $isSandbox ? 'sandbox' : 'production'
        ]);
    } else {
        $errData = json_decode($res['body'], true);
        $errMsg = $errData['message'] ?? $errData['error'] ?? $res['error'] ?? ('HTTP ' . $res['code']);
        http_response_code($res['code'] > 0 ? $res['code'] : 500);
        echo json_encode([
            'success' => false,
            'message' => "Ralat Pengesahan HitPay ($res[code]): $errMsg",
            'detail' => $res['body']
        ]);
    }
    exit;
}

// ==========================================================
// ROUTE: Create Payment
// ==========================================================
if ($action === 'create-payment') {
    $order = $body['order'] ?? null;
    $config = $body['config'] ?? null;

    if (!$order || empty($order['orderId']) || empty($order['total'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Data pesanan tidak lengkap.'
        ]);
        exit;
    }

    $isSandbox = !empty($config['isSandbox']);
    $apiKey = trim($config['apiKey'] ?? '');

    // Fallback to server-saved config if client didn't supply apiKey
    if (empty($apiKey) || strlen($apiKey) < 5) {
        $serverCfg = getHitPayServerConfig();
        if (!empty($serverCfg['apiKey'])) {
            $apiKey = trim($serverCfg['apiKey']);
            if (isset($serverCfg['isSandbox'])) {
                $isSandbox = !empty($serverCfg['isSandbox']);
            }
        }
    }

    if (empty($apiKey) || strlen($apiKey) < 5) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Kunci API HitPay belum dikonfigurasi. Sila masukkan API Key di Portal Pentadbir > Tetapan Kedai.'
        ]);
        exit;
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'freshmarket.my';
    $baseUrlOrigin = "$protocol://$host";

    $baseReturnUrl = !empty($config['redirectUrl']) ? rtrim($config['redirectUrl'], '/') : $baseUrlOrigin;
    $urlParts = explode('?', $baseReturnUrl);
    $cleanBase = $urlParts[0];
    $redirectUrl = "{$cleanBase}?hitpay_status=completed&order_id=" . urlencode($order['orderId']);
    $webhookUrl = !empty($config['webhookUrl']) ? $config['webhookUrl'] : "$baseUrlOrigin/api/hitpay.php?action=webhook";

    $customerEmail = !empty($order['customer']['email']) && strpos($order['customer']['email'], '@') !== false
        ? trim($order['customer']['email'])
        : preg_replace('/\D/', '', $order['customer']['phone'] ?? 'order') . '@khairulfreshfood.my';

    $payload = [
        'amount' => number_format((float)$order['total'], 2, '.', ''),
        'currency' => 'MYR',
        'email' => $customerEmail,
        'name' => $order['customer']['fullName'] ?? 'Pelanggan Khairul Fresh Food',
        'phone' => $order['customer']['phone'] ?? '',
        'purpose' => "Tempahan Ayam Segar Pasar Semenyih #{$order['orderId']}",
        'reference_number' => (string)$order['orderId'],
        'redirect_url' => $redirectUrl,
        'webhook' => $webhookUrl,
        'send_email' => false,
        'send_sms' => false,
    ];

    // In HitPay API, omitting 'payment_methods' displays all active channels configured in merchant dashboard (Cards, FPX, DuitNow QR, TNG, etc.)
    // If specific channels are passed, use official HitPay enums ('duitnow', 'touch_n_go', 'fpx', 'card', 'grabpay_direct', 'shopee_pay')
    if (!empty($config['enabledMethods']) && is_array($config['enabledMethods'])) {
        $allowed = [];
        foreach ($config['enabledMethods'] as $m) {
            if ($m === 'duitnow') $allowed[] = 'duitnow';
            elseif ($m === 'tng') $allowed[] = 'touch_n_go';
            elseif ($m === 'fpx' || $m === 'card') $allowed[] = $m;
            elseif ($m === 'grabpay') $allowed[] = 'grabpay_direct';
            elseif ($m === 'shopeepay') $allowed[] = 'shopee_pay';
        }
        // Only restrict if user selected a subset of channels; otherwise omit to let HitPay show all active account methods
        if (!empty($allowed) && count($allowed) < 6) {
            $payload['payment_methods'] = $allowed;
        }
    }

    $apiEndpoint = $isSandbox ? 'https://api.sandbox.hit-pay.com/v1/payment-requests' : 'https://api.hit-pay.com/v1/payment-requests';
    $res = callHitPayApi($apiEndpoint, 'POST', [
        "X-BUSINESS-API-KEY: $apiKey",
        'Content-Type: application/json',
        'X-Requested-With: XMLHttpRequest'
    ], $payload);

    // Auto-fallback: If HitPay rejected due to a payment method not activated on this merchant account (e.g. DuitNow QR pending),
    // retry without payment_methods restriction so HitPay automatically opens checkout with all active methods (Card, FPX, etc.)
    if (($res['code'] < 200 || $res['code'] >= 300) && isset($payload['payment_methods'])) {
        $errCheck = json_decode($res['body'], true);
        $errMsgCheck = strtolower($errCheck['message'] ?? '');
        if (strpos($errMsgCheck, 'unavailable for your account') !== false || strpos($errMsgCheck, 'payment method') !== false || $res['code'] === 422) {
            unset($payload['payment_methods']);
            $res = callHitPayApi($apiEndpoint, 'POST', [
                "X-BUSINESS-API-KEY: $apiKey",
                'Content-Type: application/json',
                'X-Requested-With: XMLHttpRequest'
            ], $payload);
        }
    }

    if ($res['code'] >= 200 && $res['code'] < 300) {
        $data = json_decode($res['body'], true);
        if ($data && !empty($data['url'])) {
            echo json_encode([
                'success' => true,
                'isSimulated' => false,
                'id' => $data['id'] ?? 'hp_' . time(),
                'url' => $data['url'],
                'status' => $data['status'] ?? 'pending',
                'reference_number' => $data['reference_number'] ?? (string)$order['orderId'],
                'amount' => $data['amount'] ?? $payload['amount'],
                'currency' => $data['currency'] ?? 'MYR',
                'payment_methods' => $data['payment_methods'] ?? ($payload['payment_methods'] ?? []),
                'created_at' => $data['created_at'] ?? date('c'),
            ]);
            exit;
        }
    }

    // If HitPay returns an error message
    $errData = json_decode($res['body'], true);
    $errMsg = $errData['message'] ?? $errData['error'] ?? $res['error'] ?? ('HTTP ' . $res['code']);

    http_response_code($res['code'] > 0 ? $res['code'] : 500);
    echo json_encode([
        'success' => false,
        'message' => "Gagal mencipta pautan bayaran HitPay: $errMsg",
        'errorDetail' => $res['body'],
    ]);
    exit;
}

// ==========================================================
// ROUTE: Payment Status
// ==========================================================
if ($action === 'payment-status') {
    $id = $_GET['id'] ?? $body['id'] ?? '';
    $apiKey = trim($_GET['apiKey'] ?? $body['apiKey'] ?? '');
    $isSandbox = (isset($_GET['isSandbox']) && $_GET['isSandbox'] === 'true') || !empty($body['isSandbox']);

    if (empty($apiKey)) {
        $serverCfg = getHitPayServerConfig();
        $apiKey = $serverCfg['apiKey'] ?? '';
        if (isset($serverCfg['isSandbox'])) {
            $isSandbox = !empty($serverCfg['isSandbox']);
        }
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID bayaran diperlukan.']);
        exit;
    }

    if (strpos($id, 'hp_sim_') === 0) {
        echo json_encode(['success' => true, 'status' => 'completed', 'reference_number' => $id, 'amount' => '0.00']);
        exit;
    }

    $baseUrl = $isSandbox ? 'https://api.sandbox.hit-pay.com/v1' : 'https://api.hit-pay.com/v1';
    $res = callHitPayApi("$baseUrl/payment-requests/" . urlencode($id), 'GET', [
        "X-BUSINESS-API-KEY: $apiKey",
        'Content-Type: application/json',
        'X-Requested-With: XMLHttpRequest'
    ]);

    if ($res['code'] >= 200 && $res['code'] < 300) {
        $data = json_decode($res['body'], true);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'status' => $data['status'] ?? 'pending',
            'reference_number' => $data['reference_number'] ?? $id,
            'amount' => $data['amount'] ?? '0.00',
        ]);
    } else {
        http_response_code($res['code'] > 0 ? $res['code'] : 500);
        echo json_encode([
            'success' => false,
            'message' => "Ralat menyemak status: " . ($res['body'] ?? $res['error'])
        ]);
    }
    exit;
}

// ==========================================================
// ROUTE: Fonnte WhatsApp Send
// ==========================================================
if ($action === 'fonnte-send') {
    $target = trim($body['target'] ?? $_POST['target'] ?? '');
    $message = trim($body['message'] ?? $_POST['message'] ?? '');
    $token = trim($body['token'] ?? $_POST['token'] ?? '');
    $isTest = !empty($body['isTest']) || (isset($_POST['isTest']) && $_POST['isTest'] === 'true');

    if (empty($token) || empty($target) || (empty($message) && !$isTest)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parameter token, target, mesej tidak lengkap.']);
        exit;
    }

    $fonnteUrl = $isTest ? 'https://api.fonnte.com/device' : 'https://api.fonnte.com/send';
    $postFields = $isTest ? null : http_build_query(['target' => $target, 'message' => $message]);
    $headers = ["Authorization: $token"];
    if (!$isTest) {
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    }

    $res = callHitPayApi($fonnteUrl, 'POST', $headers, $postFields);
    $data = json_decode($res['body'], true);

    if ($res['code'] >= 200 && $res['code'] < 300 && (!empty($data['status']) || !empty($data['id']) || !empty($data['device_status']))) {
        echo json_encode([
            'success' => true,
            'message' => $data['message'] ?? 'Berjaya dihantar melalui proksi PHP.',
            'data' => $data
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $data['reason'] ?? $data['message'] ?? 'Gagal menghantar melalui Fonnte Gateway.',
            'data' => $data
        ]);
    }
    exit;
}

// ==========================================================
// ROUTE: Webhook
// ==========================================================
if ($action === 'webhook') {
    http_response_code(200);
    echo json_encode(['status' => 'received', 'timestamp' => date('c')]);
    exit;
}

// Unknown action fallback
http_response_code(404);
echo json_encode(['success' => false, 'message' => "Aksi tidak ditemui: $action"]);
