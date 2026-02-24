<?php
/**
 * API: إنشاء طلب جديد
 * Method: POST
 * URL: /api/orders/create.php
 */

require_once '../../config/database.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // التحقق من البيانات المطلوبة
    $required = ['customer_name', 'customer_email', 'customer_phone', 'customer_address', 
                 'payment_method', 'total_amount', 'items'];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("الحقل $field مطلوب");
        }
    }
    
    $db = getDB();
    $db->beginTransaction();
    
    try {
        // إنشاء الطلب
        $sql = "INSERT INTO orders (
            customer_name, customer_email, customer_phone, customer_address,
            payment_method, payment_status, order_status, total_amount, notes, created_at
        ) VALUES (
            :customer_name, :customer_email, :customer_phone, :customer_address,
            :payment_method, 'pending', 'pending', :total_amount, :notes, NOW()
        )";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':customer_name' => $data['customer_name'],
            ':customer_email' => $data['customer_email'],
            ':customer_phone' => $data['customer_phone'],
            ':customer_address' => $data['customer_address'],
            ':payment_method' => $data['payment_method'],
            ':total_amount' => $data['total_amount'],
            ':notes' => $data['notes'] ?? ''
        ]);
        
        $orderId = $db->lastInsertId();
        
        // إضافة عناصر الطلب
        $itemSql = "INSERT INTO order_items (
            order_id, medicine_id, medicine_name, quantity, price, subtotal, created_at
        ) VALUES (
            :order_id, :medicine_id, :medicine_name, :quantity, :price, :subtotal, NOW()
        )";
        
        $itemStmt = $db->prepare($itemSql);
        
        foreach ($data['items'] as $item) {
            $itemStmt->execute([
                ':order_id' => $orderId,
                ':medicine_id' => $item['medicine_id'],
                ':medicine_name' => $item['medicine_name'],
                ':quantity' => $item['quantity'],
                ':price' => $item['price'],
                ':subtotal' => $item['subtotal']
            ]);
        }
        
        $db->commit();
        
        // TODO: إرسال بريد إلكتروني للعميل
        
        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء الطلب بنجاح',
            'data' => [
                'order_id' => $orderId,
                'order_number' => strtoupper(substr($orderId, 0, 8))
            ]
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
