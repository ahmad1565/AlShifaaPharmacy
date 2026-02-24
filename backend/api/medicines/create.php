<?php
/**
 * API: إضافة دواء جديد
 * Method: POST
 * URL: /api/medicines/create.php
 * Auth: Required (Owner only)
 */

require_once '../../config/database.php';

try {
    // التحقق من صلاحيات المالك (يجب إضافة نظام JWT)
    // TODO: Add authentication check
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // التحقق من البيانات المطلوبة
    $required = ['name_ar', 'name_en', 'scientific_name', 'category', 'dosage', 'price', 'quantity', 'expiry_date'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("الحقل $field مطلوب");
        }
    }
    
    $db = getDB();
    
    $sql = "INSERT INTO medicines (
        name_ar, name_en, scientific_name, category, dosage, price, 
        quantity, expiry_date, image, requires_prescription, 
        min_stock_level, description, created_at
    ) VALUES (
        :name_ar, :name_en, :scientific_name, :category, :dosage, :price,
        :quantity, :expiry_date, :image, :requires_prescription,
        :min_stock_level, :description, NOW()
    )";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name_ar' => $data['name_ar'],
        ':name_en' => $data['name_en'],
        ':scientific_name' => $data['scientific_name'],
        ':category' => $data['category'],
        ':dosage' => $data['dosage'],
        ':price' => $data['price'],
        ':quantity' => $data['quantity'],
        ':expiry_date' => $data['expiry_date'],
        ':image' => $data['image'] ?? '/assets/medicines/default.jpg',
        ':requires_prescription' => $data['requires_prescription'] ?? false,
        ':min_stock_level' => $data['min_stock_level'] ?? 10,
        ':description' => $data['description'] ?? ''
    ]);
    
    $medicineId = $db->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'تم إضافة الدواء بنجاح',
        'data' => ['id' => $medicineId]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
