<?php
/**
 * API: الحصول على جميع الأدوية
 * Method: GET
 * URL: /api/medicines/get_all.php
 */

require_once '../../config/database.php';

try {
    $db = getDB();
    
    // معاملات الفلترة (اختيارية)
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    
    // بناء الاستعلام
    $sql = "SELECT * FROM medicines WHERE 1=1";
    $params = [];
    
    if ($category) {
        $sql .= " AND category = :category";
        $params[':category'] = $category;
    }
    
    if ($search) {
        $sql .= " AND (name_ar LIKE :search OR name_en LIKE :search OR scientific_name LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    if ($limit) {
        $sql .= " LIMIT :limit";
        $params[':limit'] = $limit;
    }
    
    $stmt = $db->prepare($sql);
    
    // ربط المعاملات
    foreach ($params as $key => $value) {
        if ($key === ':limit') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
    $medicines = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $medicines,
        'count' => count($medicines)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
