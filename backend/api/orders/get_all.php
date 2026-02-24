<?php
/**
 * API: الحصول على جميع الطلبات
 * Method: GET
 * URL: /api/orders/get_all.php
 * Auth: Required (Owner only)
 */

require_once '../../config/database.php';

try {
    // TODO: التحقق من صلاحيات المالك
    
    $db = getDB();
    
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    $sql = "SELECT * FROM orders WHERE 1=1";
    $params = [];
    
    if ($status) {
        $sql .= " AND order_status = :status";
        $params[':status'] = $status;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $orders,
        'count' => count($orders)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
