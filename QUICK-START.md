# 🚀 شروع سریع خانه بازار

## فقط ۵ دقیقه تا راه‌اندازی!

---

##  کامپیوتر قوی (Build)

```bash
# 1. نصب پکیج‌ها
npm install

# 2. Build
npm run build

# 3. خروجی در پوشه dist/
```

---

##  هاست اشتراکی (Install)

### مرحله 1: دیتابیس
- در cPanel → MySQL Databases
- دیتابیس بسازید
- فایل `dist/database/schema.sql` را import کنید

### مرحله 2: فرانت‌اند
- محتویات `dist/` را در `public_html` آپلود کنید

### مرحله 3: بک‌اند
- پوشه `khane-bazar-api` بسازید
- فایل‌های `backend/server.cjs` و `backend/package.json` را آپلود کنید
- فایل `.env` بسازید:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_DATABASE=نام-دیتابیس
DB_USERNAME=نام-کاربری
DB_PASSWORD=رمز-عبور
```
نقشه از OpenStreetMap استفاده می‌کند — رایگان و بدون نیاز به کلید API.

### مرحله 4: Node.js App
- در cPanel → Setup Node.js App
- Application root: `khane-bazar-api`
- Startup file: `server.cjs`
- NPM Install → Start App

### مرحله 5: SSL
- در cPanel → SSL/TLS Status
- Run AutoSSL

### مرحله 6: تست
- سایت: https://khane-bazar-118.ir
- API: https://api.khane-bazar-118.ir/api/health

---

## ✅ تمام!
