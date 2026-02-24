<?php
/**
 * API: الحصول على دواء محدد
 * Method: GET
 * URL: /api/medicines/get_by_id.php?id=xxx
 */

require_once '../../config/database.php';

try {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        throw new Exception('معرف الدواء مطلوب');
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM medicines WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $medicine = $stmt->fetch();
    
    if (!$medicine) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'الدواء غير موجود'
        ]);
        exit();
    }
    
    echo json_encode([
        'success' => true,
        'data' => $medicine
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
