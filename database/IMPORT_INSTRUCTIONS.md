# 📋 تعليمات الاستيراد الصحيحة

## ⚠️ المشكلة التي واجهتها:

عند استيراد ملف `schema.sql` ظهر خطأ:
```
Access denied for user to database 'alshifaa_pharmacy' - #1044
```

**السبب:** في الاستضافات المشتركة، لا يمكنك إنشاء قاعدة بيانات مباشرة من SQL.

---

## ✅ الحل الصحيح (خطوة بخطوة):

### 1️⃣ إنشاء قاعدة البيانات من cPanel

1. سجل دخول إلى **cPanel**
2. ابحث عن **"MySQL Databases"** أو **"قواعد البيانات MySQL"**
3. في قسم **"Create New Database"**:
   - اسم القاعدة: `alshifaa_pharmacy` (أو أي اسم تريد)
   - اضغط **"Create Database"**
4. **احفظ الاسم الكامل** للقاعدة (سيكون مثل: `username_alshifaa_pharmacy`)

### 2️⃣ إضافة مستخدم للقاعدة (إذا لم يكن موجوداً)

1. في نفس الصفحة، قسم **"Create New User"**:
   - اسم المستخدم: `pharmacy_user`
   - كلمة المرور: (اختر كلمة قوية)
   - اضغط **"Create User"**

2. في قسم **"Add User to Database"**:
   - اختر المستخدم الذي أنشأته
   - اختر القاعدة التي أنشأتها
   - اضغط **"Add"**
   - اختر **"ALL PRIVILEGES"**
   - اضغط **"Make Changes"**

### 3️⃣ استيراد الملف الصحيح

1. افتح **phpMyAdmin** من cPanel
2. اختر القاعدة التي أنشأتها من القائمة اليسرى
3. اضغط تبويب **"Import"** أو **"استيراد"**
4. اختر الملف: **`database/schema_import.sql`** (ليس `schema.sql`)
5. اضغط **"Go"** أو **"انطلق"**

---

## 📁 الملفات المتاحة:

### ✅ `database/schema_import.sql` ← استخدم هذا الملف

- **مناسب للاستضافات المشتركة**
- بدون أوامر `CREATE DATABASE`
- بدون أمر `USE`
- يعمل مباشرة بعد إنشاء القاعدة من cPanel

### ❌ `database/schema.sql` ← لا تستخدم هذا

- يحتوي على `CREATE DATABASE` (ممنوع في cPanel)
- مناسب فقط للسيرفرات الكاملة (VPS/Dedicated)

---

## 🔧 بعد الاستيراد الناجح:

### عدّل إعدادات الاتصال

افتح: `backend/config/database.php`

```php
// استبدل هذه القيم بالقيم من cPanel:

define('DB_HOST', 'localhost');           // عادة localhost
define('DB_NAME', 'username_alshifaa_pharmacy');  // الاسم الكامل من cPanel
define('DB_USER', 'username_pharmacy_user');      // اسم المستخدم من cPanel
define('DB_PASS', 'YOUR_PASSWORD_HERE');          // كلمة المرور التي اخترتها
```

---

## ✅ التحقق من نجاح الاستيراد:

في phpMyAdmin، نفذ هذا الاستعلام:

```sql
-- عرض جميع الجداول (يجب أن يكون 8 جداول)
SHOW TABLES;

-- عدد الأدوية (يجب أن يكون 5)
SELECT COUNT(*) FROM medicines;

-- التحقق من المالك
SELECT email, name, role FROM users WHERE role = 'owner';
```

**النتيجة المتوقعة:**
```
✅ 8 جداول
✅ 5 أدوية
✅ مستخدم واحد (hajaraldhaheri2016@gmail.com)
```

---

## 🆘 إذا استمرت المشاكل:

### خطأ: "Table already exists"

**الحل:** احذف القاعدة وأنشئها من جديد:
```sql
DROP DATABASE username_alshifaa_pharmacy;
```
ثم كرر الخطوات من جديد.

### خطأ: "Foreign key constraint fails"

**الحل:** استورد الملف مرة واحدة فقط، لا تستورده عدة مرات.

### خطأ: "Unknown database"

**الحل:** تأكد أنك اخترت القاعدة الصحيحة من القائمة اليسرى في phpMyAdmin.

---

**تم بحمد الله** ✅
