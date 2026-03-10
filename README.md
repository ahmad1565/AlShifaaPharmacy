# صيدلية الشفاء الحديثة - AlShifaa Pharmacy

نظام إدارة صيدلية متكامل مبني بـ React + PHP/MySQL

---

## 📁 هيكل المشروع

```
alshifaa-pharmacy/
├── 📁 frontend/              # تطبيق React (الواجهة الأمامية)
│   ├── src/
│   │   ├── components/       # مكونات React
│   │   ├── pages/           # صفحات التطبيق
│   │   ├── lib/             # مكتبات مساعدة
│   │   └── assets/          # الصور والملفات الثابتة
│   ├── public/
│   └── package.json
│
├── 📁 backend/               # API بـ PHP (الواجهة الخلفية)
│   ├── config/
│   │   └── database.php     # ⚙️ إعدادات قاعدة البيانات
│   ├── api/
│   │   ├── medicines/       # عمليات الأدوية
│   │   ├── orders/          # عمليات الطلبات
│   │   ├── customers/       # عمليات العملاء
│   │   └── auth/            # نظام المصادقة
│   └── utils/               # دوال مساعدة
│
├── 📁 database/
│   └── schema.sql           # هيكل قاعدة البيانات
│
└── README.md                # هذا الملف
```

---

## 🚀 التثبيت والإعداد

### المتطلبات
- **PHP** 7.4 أو أحدث
- **MySQL** 5.7 أو أحدث / **MariaDB** 10.3 أو أحدث
- **Apache** / **Nginx** مع mod_rewrite
- **Node.js** 16+ و **npm** (لتطوير Frontend)

---

## ⚙️ إعداد قاعدة البيانات

### 1️⃣ إنشاء قاعدة البيانات

```bash
mysql -u root -p
```

```sql
CREATE DATABASE alshifaa_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2️⃣ استيراد الجداول

```bash
mysql -u root -p alshifaa_pharmacy < database/schema.sql
```

### 3️⃣ تعديل إعدادات الاتصال

افتح الملف: `backend/config/database.php`

```php
define('DB_HOST', 'localhost');           // عنوان السيرفر
define('DB_NAME', 'alshifaa_pharmacy');   // اسم قاعدة البيانات
define('DB_USER', 'root');                // اسم المستخدم
define('DB_PASS', 'your_password');       // كلمة المرور
```

---

## 🌐 إعداد Backend (PHP)

### في بيئة الاستضافة المشتركة (Shared Hosting)

1. ارفع مجلد `backend/` إلى السيرفر (مثلاً: `public_html/api/`)
2. تأكد من أن ملف `.htaccess` موجود:

```apache
# .htaccess في مجلد backend
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?url=$1 [QSA,L]
```

### في بيئة التطوير (localhost)

```bash
cd backend
php -S localhost:8000
```

### اختبار API

افتح المتصفح: `http://localhost:8000/api/medicines/get_all.php`

يجب أن تحصل على:

```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

## 💻 إعداد Frontend (React)

### 1️⃣ تثبيت الحزم

```bash
npm install
```

### 2️⃣ تعديل URL الـ API

افتح: `src/lib/api.ts` (أو ملف مشابه)

```typescript
// قبل التعديل (OnSpace Cloud)
const apiUrl = 'https://mwbjztuynqxteqbgmwbj.backend.onspace.ai';

// بعد التعديل (PHP Backend)
const apiUrl = 'http://localhost:8000/api'; // أو رابط السيرفر الحقيقي
```

### 3️⃣ استبدال استدعاءات Supabase بـ Fetch

**مثال قبل:**
```typescript
const { data } = await supabase.from('medicines').select('*');
```

**مثال بعد:**
```typescript
const response = await fetch('http://localhost:8000/api/medicines/get_all.php');
const result = await response.json();
const data = result.data;
```

### 4️⃣ تشغيل Frontend

```bash
npm run dev
```

افتح: `http://localhost:5173`

---

## 📦 النشر على الاستضافة (Production)

### 1️⃣ بناء Frontend

```bash
npm run build
```

سيتم إنشاء مجلد `dist/` يحتوي ملفات HTML/CSS/JS

### 2️⃣ رفع الملفات

```
استضافتك/
├── public_html/
│   ├── index.html         ← من مجلد dist
│   ├── assets/            ← من مجلد dist
│   └── api/               ← مجلد backend بالكامل
```

### 3️⃣ تعديل الإعدادات النهائية

في `backend/config/database.php

### الحصول على دواء محدد
```
GET /api/medicines/get_by_id.php?id=xxx
```

### إضافة دواء جديد
```
POST /api/medicines/create.php
Content-Type: application/json

{
  "name_ar": "اسم الدواء",
  "name_en": "Medicine Name",
  "scientific_name": "Active Ingredient",
  "category": "مسكنات",
  "dosage": "500mg",
  "price": 25.50,
  "quantity": 100,
  "expiry_date": "2026-12-31"
}
```

### إنشاء طلب
```
POST /api/orders/create.php
Content-Type: application/json

{
  "customer_name": "أحمد محمد",
  "customer_email": "customer@example.com",
  "customer_phone": "+201234567890",
  "customer_address": "القاهرة، مصر",
  "payment_method": "COD",
  "total_amount": 150.00,
  "items": [
    {
      "medicine_id": "xxx",
      "medicine_name": "بارامول",
      "quantity": 2,
      "price": 25.00,
      "subtotal": 50.00
    }
  ]
}
```

---

## 🛠️ التخصيص والتطوير

### إضافة API endpoint جديد

1. أنشئ ملف في `backend/api/`:

```php
<?php
require_once '../../config/database.php';

try {
    $db = getDB();
    // كودك هنا
    
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        '
---

## 📄 الترخيص

هذا المشروع خاص بصيدلية الشفاء الحديثة - جميع الحقوق محفوظة © 2025
