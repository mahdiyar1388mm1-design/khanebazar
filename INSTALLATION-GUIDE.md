# 🏛️ راهنمای کامل نصب خانه بازار

## 📋 فهرست مطالب
1. [پیش‌نیازها](#پیش‌نیازها)
2. [مراحل روی کامپیوتر قوی (توسعه)](#مراحل-روی-کامپیوتر-قوی)
3. [مراحل روی هاست اشتراکی](#مراحل-روی-هاشت-اشتراکی)
4. [فایل‌های مورد نیاز](#فایل‌های-مورد-نیاز)
5. [دستورات کامل](#دستورات-کامل)
6. [عیب‌یابی](#عیب‌یابی)

---

## 🎯 پیش‌نیازها

### روی کامپیوتر قوی (برای توسعه و build)
- Node.js 18 یا 20
- npm
- Git (اختیاری)
- ویرایشگر کد (VS Code پیشنهاد می‌شود)

### روی هاست اشتراکی
- cPanel با قابلیت Node.js
- MySQL Database
- دامنه: khane-bazar-118.ir
- SSL فعال

---

## 💻 مراحل روی کامپیوتر قوی

### مرحله 1: نصب Node.js
اگر Node.js ندارید، از سایت رسمی دانلود کنید:
```bash
# بررسی نصب
node -v
npm -v
```

### مرحله 2: دانلود پروژه
```bash
# اگر با Git است
git clone <repository-url>
cd khane-bazar

# یا اگر فایل ZIP دارید
unzip khane-bazar.zip
cd khane-bazar
```

### مرحله 3: نصب پکیج‌های فرانت‌اند
```bash
npm install
```

**پکیج‌های نصب می‌شوند:**
- react, react-dom
- vite, typescript
- tailwindcss
- leaflet (نقشه رایگان OpenStreetMap)
- clsx, tailwind-merge

### مرحله 4: ساخت فایل .env فرانت‌اند
یک فایل به نام `.env` در ریشه پروژه بسازید:

```env
VITE_API_BASE_URL=https://api.khane-bazar-118.ir
```

### مرحله 5: تست محلی (اختیاری)
```bash
npm run dev
```
سایت روی `http://localhost:5173` باز می‌شود.

### مرحله 6: Build برای تولید
```bash
npm run build
```

**خروجی:**
- پوشه `dist/` ساخته می‌شود
- فایل اصلی: `dist/index.html`
- حجم: ~704 KB

### مرحله 7: آماده‌سازی بک‌اند
پوشه `backend/` شامل این فایل‌هاست:
```
backend/
── server.cjs          ← سرور اصلی
├── package.json        ← پکیج‌ها
└── .env.example        ← نمونه تنظیمات
```

---

##  مراحل روی هاست اشتراکی

### مرحله 1: ساخت دیتابیس در cPanel

1. وارد cPanel شوید
2. به **MySQL Databases** بروید
3. دیتابیس بسازید:
   - نام: `pxavqkqz_118` (یا نام دلخواه)
4. کاربر بسازید:
   - نام کاربری: `pxavqkqz_mahdiyar`
   - رمز: `mahdiyar1388M@` (یا رمز قوی‌تر)
5. کاربر را به دیتابیس وصل کنید و **ALL PRIVILEGES** بدهید

### مرحله 2: Import دیتابیس

1. در cPanel به **phpMyAdmin** بروید
2. دیتابیس `pxavqkqz_118` را انتخاب کنید
3. تب **Import** را بزنید
4. فایل `public/database/schema.sql` را آپلود کنید
5. **Go** را بزنید

**جداول ساخته می‌شوند:**
- users
- categories
- listings
- listing_fields
- listing_images
- provinces
- cities
- conversations
- messages
- favorites
- notifications
- reports
- activity_logs
- settings
- pages
- banners
- payments

### مرحله 3: آپلود فرانت‌اند

1. در cPanel به **File Manager** بروید
2. وارد پوشه `public_html` شوید
3. تمام محتویات پوشه `dist/` را آپلود کنید:
   - `index.html`
   - `images/`
   - `database/`
   - `backend/`
   - `.htaccess`
   - `sitemap.xml`
   - `robots.txt`
   - `INSTALLATION-GUIDE.md`

### مرحله 4: راه‌اندازی بک‌اند

#### 4.1. ساخت پوشه بک‌اند

در cPanel File Manager:
1. به `/home/username/` بروید (یک سطح بالاتر از public_html)
2. پوشه جدید بسازید: `khane-bazar-api`

#### 4.2. آپلود فایل‌های بک‌اند

سه فایل را در `khane-bazar-api` آپلود کنید:
- `backend/server.cjs`
- `backend/package.json`
- `.env` (مرحله بعد می‌سازید)

#### 4.3. ساخت فایل .env بک‌اند

در پوشه `khane-bazar-api`:
1. فایل جدید بسازید: `.env`
2. این محتوا را بگذارید:

```env
PORT=3000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pxavqkqz_118
DB_USERNAME=pxavqkqz_mahdiyar
DB_PASSWORD=mahdiyar1388M@
```

نقشه از OpenStreetMap/Nominatim استفاده می‌کند — رایگان و بدون نیاز به کلید API.

**مهم:** اطلاعات دیتابیس خودتان را بگذارید.

#### 4.4. راه‌اندازی Node.js App

1. در cPanel به **Setup Node.js App** بروید
2. **Create Application** را بزنید
3. پر کنید:

| فیلد | مقدار |
|------|-------|
| Node.js version | **18.x** یا **20.x** |
| Application mode | **Production** |
| Application root | `khane-bazar-api` |
| Application URL | `api.khane-bazar-118.ir` |
| Application startup file | `server.cjs` |

4. **Create** را بزنید
5. **NPM Install** را بزنید (پکیج‌ها نصب می‌شوند)
6. **Start App** را بزنید

### مرحله 5: فعال‌سازی SSL

1. در cPanel به **SSL/TLS Status** بروید
2. دامنه `khane-bazar-118.ir` را انتخاب کنید
3. **Run AutoSSL** را بزنید
4. صبر کنید تا SSL فعال شود (-۵ دقیقه)

### مرحله 6: تنظیم DNS

در پنل دامنه:
```
A record: @ → IP هاست
A record: www → IP هاست
A record: api → IP هاست
```

### مرحله 7: تست نهایی

**تست سایت:**
```
https://khane-bazar-118.ir
```

**تست API:**
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
  "services": {
    "map": true,
    "mysql": true
  }
}
```

---

## 📁 فایل‌های مورد نیاز

### برای فرانت‌اند (public_html)
```
dist/
├── index.html              ✅ آپلود
├── images/                 ✅ آپلود
│   ├── logo.png
│   ├── hero-persepolis.png
│   ├── hero-pattern.png
│   ├── about-banner.jpg
│   └── enamad-gold.png
├── database/               ✅ آپلود
│   └── schema.sql
├── backend/                ✅ آپلود
│   ├── README.md
│   └── .env.example
├── .htaccess               ✅ آپلود
├── sitemap.xml             ✅ آپلود
├── robots.txt              ✅ آپلود
└── INSTALLATION-GUIDE.md   ✅ آپلود
```

### برای بک‌اند (khane-bazar-api)
```
khane-bazar-api/
├── server.cjs              ✅ آپلود
├── package.json            ✅ آپلود
└── .env                    ✅ خودتان بسازید
```

---

## 📋 دستورات کامل

### روی کامپیوتر قوی

```bash
# 1. بررسی Node.js
node -v
npm -v

# 2. نصب پکیج‌ها
npm install

# 3. تست محلی
npm run dev

# 4. Build برای تولید
npm run build

# 5. مشاهده خروجی
ls dist/
```

### روی هاست (SSH)

```bash
# 1. رفتن به پوشه بک‌اند
cd ~/khane-bazar-api

# 2. بررسی Node.js
node -v

# 3. نصب پکیج‌ها (اگر در cPanel نزده‌اید)
npm install

# 4. اجرای دستی سرور (برای تست)
node server.cjs

# 5. تست API
curl https://api.khane-bazar-118.ir/api/health
```

### مدیریت با PM2 (اگر دسترسی دارید)

```bash
# نصب PM2
npm install -g pm2

# شروع سرور
pm2 start server.cjs --name khane-bazar-api

# مشاهده وضعیت
pm2 status

# مشاهده لاگ
pm2 logs khane-bazar-api

# ری‌استارت
pm2 restart khane-bazar-api

# توقف
pm2 stop khane-bazar-api

# ذخیره برای شروع خودکار
pm2 save
pm2 startup
```

---

## 🐛 عیب‌یابی

### فرانت‌اند لود نمی‌شود

**مشکل:** صفحه سفید
**راه‌حل:**
1. چک کنید SSL فعال است
2. چک کنید `.htaccess` در public_html است
3. Console مرورگر را ببینید (F12)

### API کار نمی‌کند

**خطا:** Cannot connect to database
**راه‌حل:**
1. اطلاعات دیتابیس در `.env` را چک کنید
2. مطمئن شوید دیتابیس ساخته شده
3. مطمئن شوید کاربر دسترسی دارد

**خطا:** Module not found
**راه‌حل:**
```bash
cd ~/khane-bazar-api
npm install
```

**خطا:** Port already in use
**راه‌حل:**
در `.env` پورت را عوض کنید:
```env
PORT=3001
```

### Mixed Content Error

**مشکل:** سایت HTTPS است ولی منابع HTTP
**راه‌حل:**
1. چک کنید `VITE_API_BASE_URL` با `https://` شروع می‌شود
2. چک کنید `.htaccess` ریدایرکت HTTP به HTTPS دارد

### دیتابیس import نمی‌شود

**مشکل:** خطای SQL
**راه‌حل:**
1. فایل `schema.sql` را در Notepad باز کنید
2. Encoding را UTF-8 بگذارید
3. دوباره import کنید

### Node.js App بالا نمی‌آید

**راه‌حل:**
1. در cPanel → Setup Node.js App → View Logs
2. خطا را ببینید
3. معمولاً مشکل از `.env` است

---

## ✅ چک‌لیست نهایی

### روی کامپیوتر
- [ ] Node.js نصب است
- [ ] `npm install` اجرا شد
- [ ] `npm run build` اجرا شد
- [ ] پوشه `dist/` ساخته شد

### روی هاست
- [ ] دیتابیس ساخته شد
- [ ] schema.sql import شد
- [ ] فرانت‌اند در public_html آپلود شد
- [ ] پوشه khane-bazar-api ساخته شد
- [ ] فایل‌های بک‌اند آپلود شدند
- [ ] فایل .env بک‌اند ساخته شد
- [ ] Node.js App در cPanel ساخته شد
- [ ] NPM Install زده شد
- [ ] Start App زده شد
- [ ] SSL فعال شد
- [ ] DNS تنظیم شد
- [ ] سایت کار می‌کند
- [ ] API کار می‌کند

---

## 📞 پشتیبانی

**شماره تماس:** ۰۹۳۹۸۲۴۲۳۰۶  
**آدرس:** مشهد، توس ۳۹  
**ساعات:** همه روزه ۹ صبح تا ۹ شب

---

## 🎉 تبریک!

سایت شما با موفقیت راه‌اندازی شد!

**آدرس سایت:** https://khane-bazar-118.ir  
**آدرس API:** https://api.khane-bazar-118.ir
