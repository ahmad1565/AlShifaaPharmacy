# 📦 دليل النشر والتصدير - AlShifaa Pharmacy

هذا الدليل يشرح خطوة بخطوة كيفية تصدير ونشر المشروع على استضافة تقليدية

---

## 🎯 الخطوات الأساسية

### 1️⃣ التحضير للتصدير

#### أ) تصدير المشروع من OnSpace

1. اذهب إلى Dashboard
2. اضغط على زر **"Download"**
3. ستحصل على ملف ZIP يحتوي كامل المشروع

#### ب) فك الضغط وإعادة الهيكلة

```bash
unzip alshifaa-pharmacy.zip
cd alshifaa-pharmacy
```

---

### 2️⃣ بناء Frontend للإنتاج

```bash
# تثبيت الحزم
npm install

# بناء المشروع
npm run build
```

سيتم إنشاء مجلد `dist/` يحتوي على:
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── images/
└── ...
```

---

### 3️⃣ إعداد قاعدة البيانات

#### في cPanel / phpMyAdmin

1. سجل دخول إلى cPanel
2. افتح **phpMyAdmin**
3. اضغط **"New"** لإنشاء قاعدة بيانات جديدة:
   - الاسم: `alshifaa_pharmacy`
   - Collation: `utf8mb4_unicode_ci`
4. اضغط **"Import"**
5. اختر الملف: `database/schema.sql`
6. اضغط **"Go"**

#### عبر SSH (للمحترفين)

```bash
mysql -u your_username -p
CREATE DATABASE alshifaa_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

mysql -u your_username -p alshifaa_pharmacy < database/schema.sql
```

---

### 4️⃣ تعديل إعدادات قاعدة البيانات

افتح: `backend/config/database.php`

```php
// ❌ قبل (localhost)
define('DB_HOST', 'localhost');
define('DB_NAME', 'alshifaa_pharmacy');
define('DB_USER', 'root');
define('DB_PASS', '');

// ✅ بعد (استضافة)
define('DB_HOST', 'localhost');              // أو IP السيرفر
define('DB_NAME', 'your_db_name');           // اسم قاعدة البيانات من cPanel
define('DB_USER', 'your_db_username');       // اسم المستخدم
define('DB_PASS', 'your_db_password');       // كلمة المرور

// تعديل الروابط
define('SITE_URL', 'https://your-domain.com');
define('API_URL', 'https://your-domain.com/api');

// ⚠️ مهم جداً: غيّر المفتاح السري
define('JWT_SECRET', 'YOUR-RANDOM-SECRET-KEY-1234567890');
```

---

### 5️⃣ رفع الملفات إلى السيرفر

#### عبر FTP (FileZilla)

```
your-hosting/
└── public_html/
    ├── index.html              ← من dist/
    ├── assets/                 ← من dist/assets/
    │   ├── index-abc123.js
    │   ├── index-def456.css
    │   └── images/
    └── api/                    ← مجلد backend بالكامل
        ├── config/
        │   └── database.php
        ├── api/
        │   ├── medicines/
        │   ├── orders/
        │   └── ...
        └── .htaccess
```

#### عبر cPanel File Manager

1. اضغط **"File Manager"**
2. اذهب إلى `public_html/`
3. اضغط **"Upload"**
4. ارفع محتويات `dist/` مباشرة
5. أنشئ مجلد `api/`
6. ارفع محتويات `backend/` إلى `api/`

---

### 6️⃣ تحديث روابط API في Frontend

إذا كانت ملفات JavaScript تحتوي روابط مباشرة، يجب تحديثها:

#### الطريقة الأولى: قبل البناء

في `src/lib/api.ts` (أو config.ts):

```typescript
// ❌ قبل
const API_URL = 'https://mwbjztuynqxteqbgmwbj.backend.onspace.ai';

// ✅ بعد
const API_URL = 'https://your-domain.com/api';
```

ثم أعد البناء:
```bash
npm run build
```

#### الطريقة الثانية: بعد البناء

استخدم أداة **Find & Replace** في ملفات `dist/assets/*.js`:

```bash
# Linux/Mac
sed -i 's|https://old-api-url|https://your-domain.com/api|g' dist/assets/*.js

# Windows (استخدم Notepad++ أو VSCode)
```

---

### 7️⃣ اختبار الموقع

#### تحقق من Backend

افتح: `https://your-domain.com/api/medicines/get_all.php`

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

**إذا ظهرت أخطاء:**
- تحقق من `backend/config/database.php`
- تأكد من إدخال بيانات قاعدة البيانات بشكل صحيح
- افتح `error_log` في cPanel

#### تحقق من Frontend

افتح: `https://your-domain.com`

- يجب أن تظهر الصفحة الرئيسية
- تصفح الأدوية
- جرب إضافة منتج للسلة

---

## 🔧 حل المشاكل الشائعة

### ❌ Error 500 (Internal Server Error)

**السبب:** خطأ في PHP أو قاعدة البيانات

**الحل:**
```php
// أضف في أول ملف database.php (مؤقتاً)
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

---

### ❌ CORS Error

**السبب:** المتصفح يمنع الطلبات

**الحل:** تأكد من وجود `.htaccess` في `api/`:
```apache
Header always set Access-Control-Allow-Origin "*"
```

---

### ❌ لا تظهر الأدوية

**السبب:** Frontend لا يتصل بـ Backend

**الحل:**
1. افتح DevTools (F12)
2. اذهب إلى **Network**
3. تحقق من عنوان الطلب:
   - إذا كان `https://old-url` → غيّر في الكود
   - إذا كان `404` → تحقق من مسار API

---

### ❌ بيانات الدخول لا تعمل

**السبب:** كلمة المرور غير مشفرة بنفس الطريقة

**الحل:** أعد إنشاء المستخدم:
```sql
DELETE FROM users WHERE email = 'hajaraldhaheri2016@gmail.com';

INSERT INTO users (id, email, password_hash, name, role)
VALUES (
    UUID(),
    'hajaraldhaheri2016@gmail.com',
    SHA2('admin123456', 256),
    'محمد أحمد',
    'owner'
);
```

---

## 🚀 تحسينات ما بعد النشر

### 1️⃣ تفعيل SSL (HTTPS)

في cPanel:
1. اذهب إلى **SSL/TLS**
2. اضغط **"Let's Encrypt"**
3. اختر نطاقك
4. اضغط **"Issue"**

### 2️⃣ تفعيل الكاش

في `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3️⃣ ضغط الملفات

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>
```

### 4️⃣ حماية ملفات الإعدادات

```apache
<FilesMatch "^(database\.php|\.env)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## 📊 مراقبة الأداء

### Google Analytics
أضف في `dist/index.html` قبل `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## ✅ Checklist قبل النشر النهائي

- [ ] بيانات قاعدة البيانات صحيحة
- [ ] تم تغيير `JWT_SECRET`
- [ ] تم تغيير كلمة مرور المالك
- [ ] SSL مفعّل (HTTPS)
- [ ] روابط API محدّثة
- [ ] الصور تظهر بشكل صحيح
- [ ] تم اختبار التسجيل والدخول
- [ ] تم اختبار إنشاء طلب
- [ ] تم اختبار لوحة التحكم
- [ ] البريد الإلكتروني يعمل (اختياري)

---

## 📞 الدعم

إذا واجهت أي مشكلة:
- 📧 **البريد:** hajaraldhaheri2016@gmail.com
- 📱 **واتساب:** +213558166889

---

**تم بحمد الله** 🎉
