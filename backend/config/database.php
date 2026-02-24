<?php
/**
 * ====================================
 * إعدادات قاعدة البيانات
 * ====================================
 * 
 * ملف الإعدادات الرئيسي للاتصال بقاعدة البيانات MySQL
 * قم بتعديل القيم التالية حسب إعدادات السيرفر الخاص بك
 */

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');           // عنوان السيرفر (localhost أو IP)
define('DB_NAME', 'alshifaa_pharmacy');   // اسم قاعدة البيانات
define('DB_USER', 'root');                // اسم المستخدم
define('DB_PASS', '');                    // كلمة المرور
define('DB_CHARSET', 'utf8mb4');          // ترميز الأحرف

// معلومات الموقع
define('SITE_URL', 'http://localhost');
define('API_URL', 'http://localhost/backend/api');

// إعدادات الأمان
define('JWT_SECRET', 'your-secret-key-here-change-in-production'); // غيّر هذا المفتاح في الإنتاج
define('HASH_ALGO', 'sha256');

// إعدادات البريد الإلكتروني (اختياري)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-email-password');
define('SMTP_FROM', 'noreply@alshifaa.com');
define('SMTP_FROM_NAME', 'صيدلية الشفاء');

/**
 * إنشاء اتصال بقاعدة البيانات
 */
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die(json_encode([
                'success' => false,
                'error' => 'فشل الاتصال بقاعدة البيانات: ' . $e->getMessage()
            ]));
        }
    }
    
    /**
     * الحصول على نسخة واحدة من الاتصال (Singleton Pattern)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * الحصول على الاتصال
     */
    public function getConnection() {
        return $this->connection;
    }
}

/**
 * دالة مساعدة للحصول على الاتصال بسرعة
 */
function getDB() {
    return Database::getInstance()->getConnection();
}

// تعيين رؤوس CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// التعامل مع OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
