# 🏛️ راهنمای کامل نصب بک‌اند خانه بازار

## ✅ فایل‌های مورد نیاز برای بک‌اند

فقط این **۳ فایل** را نیاز دارید:

| # | فایل | محل آپلود |
|---|------|-----------|
| 1 | `backend/server.cjs` | پوشه بک‌اند در هاست |
| 2 | `backend/package.json` | پوشه بک‌اند در هاست |
| 3 | `backend/.env` (بسازید) | پوشه بک‌اند در هاست |

---

## 📁 ساختار پیشنهادی در هاست

```
/home/username/
├── public_html/              ← فرانت‌اند (خودکار با build)
│   ├── index.html
│   ├── images/
│   └── ...
│
└── khane-bazar-api/          ← بک‌اند (دستی آپلود کنید)
    ├── server.cjs            ✅ آپلود کنید
    ├── package.json          ✅ آپلود کنید
    └── .env                  ✅ خودتان بسازید
```

---

## 🚀 مراحل نصب (گام به گام)

### مرحله ۱: ساخت پوشه بک‌اند

در cPanel → File Manager:
1. به `/home/username/` بروید (یک سطح بالاتر از public_html)
2. پوشه جدید بسازید: `khane-bazar-api`

### مرحله ۲: آپلود فایل‌ها

سه فایل را در این پوشه آپلود کنید:
- `backend/server.cjs`
- `backend/package.json`
- `.env` (در مرحله بعد می‌سازید)

### مرحله ۳: ساخت فایل .env

در پوشه `khane-bazar-api`:
1. فایل جدید بسازید به نام `.env`
2. این محتوا را داخلش بگذارید:

```env
PORT=3000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pxavqkqz_118
DB_USERNAME=pxavqkqz_mahdiyar
DB_PASSWORD=رمز-دیتابیس-خود-را-اینجا-بگذارید
```

نقشه از OpenStreetMap/Nominatim استفاده می‌کند — رایگان و بدون نیاز به کلید API.

**مهم:** رمز دیتابیس خودتان را بگذارید.

### مرحله ۴: راه‌اندازی در cPanel

1. در cPanel بروید به: **Setup Node.js App**
2. کلیک کنید: **Create Application**
3. پر کنید:

| فیلد | مقدار |
|------|-------|
| Node.js version | **18.x** یا **20.x** |
| Application mode | **Production** |
| Application root | `khane-bazar-api` |
| Application URL | `api.khane-bazar-118.ir` |
| Application startup file | `server.cjs` |

4. کلیک: **Create**
5. بعد از ساخته شدن، کلیک: **NPM Install**
6. بعد کلیک: **Start App**

### مرحله ۵: تست سلامت

در مرورگر باز کنید:
```
https://api.khane-bazar-118.ir/api/health
```

**خروجی درست:**
```json
{
  "status": "ok",
  "service": "خانه بازار API",
  "domain": "khane-bazar-118.ir",
  "version": "1.0.0",
  "time": "2025-...",
  "services": {
    "map": true,
    "mysql": true
  }
}
```

اگر `mysql: false` بود، یعنی دیتابیس وصل نیست — `.env` را چک کنید.

---

## 🔌 اتصال فرانت‌اند به بک‌اند

در پروژه React، فایل `.env` را بسازید:

```env
VITE_API_BASE_URL=https://api.khane-bazar-118.ir
```

سپس:
```bash
npm run build
```

و پوشه `dist` را در `public_html` آپلود کنید.

---

## 📊 API Endpoints

| مسیر | متد | ورودی | خروجی |
|------|-----|-------|-------|
| `/api/auth/register` | POST | `{phone, password, name}` | `{success, token, user}` |
| `/api/auth/login` | POST | `{phone, password}` | `{success, token, user}` |
| `/api/map/geocode` | GET | `?lat=&lng=` | آدرس از OpenStreetMap |
| `/api/map/search` | GET | `?q=` | نتایج جستجو |
| `/api/health` | GET | — | وضعیت سرور |

---

## 🐛 رفع خطاها

### خطا: Cannot find module
```bash
# در cPanel → Setup Node.js App
# دکمه NPM Install را بزنید
```

### خطا: MySQL connection failed
- چک کنید `.env` درست است
- چک کنید دیتابیس ساخته شده
- چک کنید کاربر دسترسی دارد

### خطا: Port 3000 already in use
- در `.env` پورت را عوض کنید: `PORT=3001`
- سرور را Restart کنید

### سایت لود نمی‌شود
- چک کنید SSL فعال است
- چک کنید DNS درست است
- لاگ‌ها را ببینید: **Setup Node.js App** → **View Logs**

---

## 📞 اطلاعات تماس

- **شماره:** ۰۹۳۹۸۲۴۲۳۰۶
- **آدرس:** مشهد، توس ۳۹

---

## ✅ چک‌لیست نهایی

- [ ] پوشه `khane-bazar-api` ساخته شد
- [ ] فایل `server.cjs` آپلود شد
- [ ] فایل `package.json` آپلود شد
- [ ] فایل `.env` ساخته و پر شد
- [ ] Node.js App در cPanel ساخته شد
- [ ] NPM Install زده شد
- [ ] Start App زده شد
- [ ] `/api/health` تست شد و `mysql: true` داد
- [ ] فرانت‌اند build و آپلود شد
- [ ] SSL فعال است

---

**موفق باشید!** 🏛️
