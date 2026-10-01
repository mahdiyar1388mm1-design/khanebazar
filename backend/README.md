# 🏛️ خانه بازار — راهنمای نصب بک‌اند

## 📁 فایل‌های مورد نیاز

برای راه‌اندازی بک‌اند، این فایل‌ها را در یک پوشه (مثلاً `khane-bazar-api`) آپلود کنید:

| فایل | کاربرد |
|------|--------|
| `server.cjs` | سرور اصلی API |
| `package.json` | لیست پکیج‌ها |
| `.env` | تنظیمات (دیتابیس، پورت و...) |

---

## 🚀 مراحل نصب

### ۱. آپلود فایل‌ها

در هاست cPanel:
1. وارد **File Manager** شوید
2. به پوشه‌ای خارج از `public_html` بروید (مثلاً `/home/username/khane-bazar-api/`)
3. سه فایل بالا را آپلود کنید

### ۲. ساخت فایل .env

یک فایل به نام `.env` بسازید و این محتوا را در آن بگذارید:

```env
PORT=3000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pxavqkqz_118
DB_USERNAME=pxavqkqz_mahdiyar
DB_PASSWORD=رمز-دیتابیس-خود-را-اینجا-بگذارید


# نقشه رایگان (OpenStreetMap/Nominatim) — نیازی به کلید API نیست
```

### ۳. نصب پکیج‌ها

در cPanel به **Setup Node.js App** بروید:
- **Create Application**
- **Application root:** `khane-bazar-api`
- **Application startup file:** `server.cjs`
- **Node version:** 18 یا 20
- **Application mode:** Production
- روی **Create** کلیک کنید
- سپس روی **NPM Install** کلیک کنید

### ۴. راه‌اندازی سرور

در همان صفحه **Setup Node.js App**:
- روی **Start App** کلیک کنید

### ۵. تست سلامت

در مرورگر باز کنید:
```
https://api.khane-bazar-118.ir/api/health
```

اگر درست کار کند، چیزی شبیه این می‌بینید:
```json
{
  "status": "ok",
  "service": "خانه بازار API",
  "domain": "khane-bazar-118.ir",
  "version": "1.0.0",
  "services": {
    "map": true,
    "mysql": true
  }
}
```

---

## 📊 API Endpoints

| مسیر | متد | توضیحات |
|------|-----|---------|
| `/api/auth/register` | POST | ثبت‌نام کاربر |
| `/api/auth/login` | POST | ورود کاربر |
| `/api/map/geocode` | GET | تبدیل مختصات به آدرس |
| `/api/map/search` | GET | جستجوی مکان |
| `/api/health` | GET | بررسی سلامت سرور |

---

## 🔧 عیب‌یابی

### سرور بالا نمی‌آید
- لاگ‌ها را در **Setup Node.js App** → **View Logs** ببینید
- مطمئن شوید پکیج‌ها نصب شده‌اند
- چک کنید `.env` درست ساخته شده

### دیتابیس وصل نمی‌شود
- اطلاعات دیتابیس در `.env` را چک کنید
- مطمئن شوید دیتابیس ساخته شده
- کاربر دیتابیس دسترسی دارد

### Mixed Content Error
- مطمئن شوید SSL روی دامنه فعال است
- در فرانت‌اند `VITE_API_BASE_URL` با `https://` شروع شود

---

## 📞 پشتیبانی

شماره تماس: **۰۹۳۸۲۴۳۰۶**  
آدرس: **مشهد، توس ۳۹**
