-- ============================================================
--  مهاجرت دیتابیس — تیر ۱۴۰۵ (برای دیتابیس‌های موجود)
--  اگر دیتابیس را از نو با schema.sql می‌سازید، نیازی به این فایل نیست.
-- ============================================================

-- ۱) افزودن کد ملی به جدول کاربران
ALTER TABLE `users`
  ADD COLUMN `national_code` VARCHAR(10) DEFAULT NULL COMMENT 'کد ملی ۱۰ رقمی' AFTER `phone`;

-- ۲) افزودن نام استان و شهر (متنی) به جدول آگهی‌ها
ALTER TABLE `listings`
  ADD COLUMN `province` VARCHAR(60) DEFAULT NULL COMMENT 'نام استان' AFTER `city_id`,
  ADD COLUMN `city`     VARCHAR(60) DEFAULT NULL COMMENT 'نام شهر'   AFTER `province`;

-- ۳) افزودن نام محله به جدول آگهی‌ها
ALTER TABLE `listings`
  ADD COLUMN `neighborhood` VARCHAR(80) DEFAULT NULL COMMENT 'نام محله' AFTER `city`;

-- ۳-۱) افزودن اسلاگ دسته/زیردسته (متنی) تا فیلتر دسته به جدول categories وابسته نباشد
ALTER TABLE `listings`
  ADD COLUMN `category_slug` VARCHAR(60) DEFAULT NULL COMMENT 'اسلاگ دسته' AFTER `category_id`,
  ADD COLUMN `sub_slug`      VARCHAR(60) DEFAULT NULL COMMENT 'اسلاگ زیردسته' AFTER `category_slug`;

-- ۳-۲) پر کردن اسلاگ دسته‌ی آگهی‌های قدیمی از روی جدول categories (اگر پر شده باشد):
UPDATE `listings` l
  LEFT JOIN `categories` c ON c.id = l.category_id
  SET l.category_slug = COALESCE(NULLIF(l.category_slug, ''), c.slug)
  WHERE l.category_slug IS NULL OR l.category_slug = '';

-- ۴) پر کردن شهر/استانِ آگهی‌های قدیمی از روی جدول کمکی (اگر پر شده باشد):
UPDATE `listings` l
  LEFT JOIN `cities`    c ON c.id = l.city_id
  LEFT JOIN `provinces` p ON p.id = l.province_id
  SET l.city     = COALESCE(NULLIF(l.city, ''), c.name),
      l.province = COALESCE(NULLIF(l.province, ''), p.name)
  WHERE (l.city IS NULL OR l.city = '') OR (l.province IS NULL OR l.province = '');

-- ۵) اگر همه‌ی آگهی‌های فعلی مربوط به یک شهر هستند (مثلاً مشهد) و هنوز خالی‌اند:
UPDATE `listings`
  SET `city` = 'مشهد', `province` = 'خراسان رضوی'
  WHERE `city` IS NULL OR `city` = '';

-- نکته: انتخاب شهرِ کاربر (city gate) سمت مرورگر ذخیره می‌شود و به دیتابیس نیاز ندارد.
