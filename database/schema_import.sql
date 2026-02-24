-- ====================================
-- قاعدة بيانات صيدلية الشفاء الحديثة
-- نسخة للاستيراد (بدون CREATE DATABASE)
-- ====================================
-- 
-- ⚠️ تعليمات مهمة:
-- 1. أنشئ قاعدة البيانات من cPanel أولاً
-- 2. ثم استورد هذا الملف مباشرة
-- ====================================

-- ====================================
-- جدول المستخدمين
-- ====================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('owner', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول الموردين
-- ====================================
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول الأدوية
-- ====================================
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(36) PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    image VARCHAR(500),
    requires_prescription BOOLEAN DEFAULT FALSE,
    min_stock_level INT DEFAULT 10,
    description TEXT,
    supplier_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_name_ar (name_ar),
    INDEX idx_name_en (name_en),
    FULLTEXT idx_search (name_ar, name_en, scientific_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول العملاء (معلومات إضافية)
-- ====================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول بوابات الدفع
-- ====================================
CREATE TABLE IF NOT EXISTS payment_gateways (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('paymob', 'fawry', 'vodafone_cash', 'wallet', 'cod') NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    account_name VARCHAR(255),
    account_number VARCHAR(100),
    payment_url VARCHAR(500),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول الطلبات
-- ====================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_gateway_id VARCHAR(36),
    payment_method VARCHAR(100) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_gateway_id) REFERENCES payment_gateways(id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id),
    INDEX idx_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول عناصر الطلبات
-- ====================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    medicine_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- جدول الإشعارات
-- ====================================
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- بيانات افتراضية
-- ====================================

-- إضافة المالك (كلمة المرور: admin123456 - مشفرة)
INSERT INTO users (id, email, password_hash, name, role) 
VALUES (
    UUID(),
    'hajaraldhaheri2016@gmail.com',
    SHA2('admin123456', 256),
    'محمد أحمد',
    'owner'
) ON DUPLICATE KEY UPDATE email=email;

-- إضافة بوابة الدفع عند الاستلام
INSERT INTO payment_gateways (id, name, type, enabled, instructions)
VALUES (
    UUID(),
    'الدفع عند الاستلام',
    'cod',
    TRUE,
    'سيتم الدفع نقداً عند استلام الطلب'
) ON DUPLICATE KEY UPDATE name=name;

-- إضافة أدوية افتراضية
INSERT INTO medicines (id, name_ar, name_en, scientific_name, category, dosage, price, quantity, expiry_date, image, requires_prescription, min_stock_level, description)
VALUES 
    (UUID(), 'بارامول أقراص', 'Paramol Tablets', 'Paracetamol 500mg', 'مسكنات', '500 مجم - قرص كل 6 ساعات', 25.00, 150, '2026-12-31', '/assets/medicines/painkillers.jpg', FALSE, 20, 'مسكن للآلام وخافض للحرارة'),
    (UUID(), 'أيبوبروفين', 'Ibuprofen', 'Ibuprofen 400mg', 'مسكنات', '400 مجم - قرص كل 8 ساعات', 35.00, 120, '2026-10-15', '/assets/medicines/painkillers.jpg', FALSE, 15, 'مسكن ومضاد للالتهابات'),
    (UUID(), 'أموكسيسيلين', 'Amoxicillin', 'Amoxicillin 500mg', 'مضادات حيوية', '500 مجم - كبسولة كل 8 ساعات', 55.00, 80, '2025-08-20', '/assets/medicines/antibiotics.jpg', TRUE, 10, 'مضاد حيوي واسع المجال'),
    (UUID(), 'فيتامين سي 1000', 'Vitamin C 1000', 'Ascorbic Acid 1000mg', 'فيتامينات', '1000 مجم - قرص يومياً', 45.00, 200, '2027-03-15', '/assets/medicines/vitamins.jpg', FALSE, 30, 'مكمل فيتامين سي لتقوية المناعة'),
    (UUID(), 'شراب الكحة', 'Cough Syrup', 'Dextromethorphan 15mg/5ml', 'أدوية البرد والإنفلونزا', '10 مل كل 6 ساعات', 28.00, 100, '2025-12-31', '/assets/medicines/cold-flu.jpg', FALSE, 15, 'شراب مهدئ للكحة')
ON DUPLICATE KEY UPDATE name_ar=name_ar;
