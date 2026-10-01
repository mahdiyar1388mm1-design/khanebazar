-- =============================================================================
--  خانه بازار (Khaneh Bazaar) - MySQL Database Schema
--  Compatible with MySQL 8.x / MariaDB 10.5+
--  Charset: utf8mb4 / Collation: utf8mb4_persian_ci
-- =============================================================================
--  نحوه استفاده:
--    1) در phpMyAdmin هاست خود یک دیتابیس جدید بسازید (مثلاً khaneh_bazaar)
--    2) این فایل را Import کنید (Database > Import > Choose File > Go)
--    3) سپس فایل .env بک‌اند Node.js (backend/server.cjs) را با اطلاعات دیتابیس تنظیم کنید
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
--  Table: users — کاربران (مدیران، فروشندگان، خریداران)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `national_code` VARCHAR(10) DEFAULT NULL COMMENT 'کد ملی ۱۰ رقمی',
  `email` VARCHAR(150) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'رمز عبور hash شده با SHA256',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  KEY `users_email_idx` (`email`),
  KEY `users_is_admin_idx` (`is_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
-- -----------------------------------------------------------------------------
--  Locations: provinces & cities — استان و شهر
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `provinces` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `sort_order` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provinces_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

CREATE TABLE IF NOT EXISTS `cities` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `province_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cities_province_id_idx` (`province_id`),
  UNIQUE KEY `cities_slug_unique` (`slug`),
  CONSTRAINT `cities_province_fk` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Categories — دسته‌بندی‌ها (با فیلدهای داینامیک)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(20) DEFAULT NULL,
  `color` VARCHAR(10) DEFAULT NULL,
  `fields_json` JSON DEFAULT NULL COMMENT 'تعریف فیلدهای داینامیک به صورت JSON',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_idx` (`parent_id`),
  CONSTRAINT `categories_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Listings — آگهی‌ها (جدول اصلی)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `listings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `category_slug` VARCHAR(60) DEFAULT NULL COMMENT 'اسلاگ دسته (متنی)',
  `sub_slug` VARCHAR(60) DEFAULT NULL COMMENT 'اسلاگ زیردسته (متنی)',
  `title` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `short_description` VARCHAR(600) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` BIGINT NOT NULL DEFAULT 0,
  `price_type` ENUM('fixed','negotiable','per_meter') NOT NULL DEFAULT 'fixed',
  `status` ENUM('draft','pending','active','rejected','expired','sold') NOT NULL DEFAULT 'pending',
  `province_id` INT UNSIGNED DEFAULT NULL,
  `city_id` INT UNSIGNED DEFAULT NULL,
  `province` VARCHAR(60) DEFAULT NULL COMMENT 'نام استان (متنی، مستقل از جدول کمکی)',
  `city` VARCHAR(60) DEFAULT NULL COMMENT 'نام شهر (متنی، مستقل از جدول کمکی)',
  `neighborhood` VARCHAR(80) DEFAULT NULL COMMENT 'نام محله',
  `address` VARCHAR(255) DEFAULT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  `map_address` VARCHAR(255) DEFAULT NULL,
  `plan` ENUM('free','featured','urgent') NOT NULL DEFAULT 'free',
  `featured_until` TIMESTAMP NULL DEFAULT NULL,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `rejected_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `listings_slug_unique` (`slug`),
  KEY `listings_user_idx` (`user_id`),
  KEY `listings_category_idx` (`category_id`),
  KEY `listings_status_idx` (`status`),
  KEY `listings_plan_idx` (`plan`),
  KEY `listings_city_idx` (`city_id`),
  KEY `listings_province_idx` (`province_id`),
  KEY `listings_expires_idx` (`expires_at`),
  KEY `listings_search_idx` (`status`, `category_id`, `created_at`),
  FULLTEXT KEY `listings_fulltext` (`title`, `short_description`, `description`),
  CONSTRAINT `listings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `listings_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `listings_province_fk` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE SET NULL,
  CONSTRAINT `listings_city_fk` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- مقادیر فیلدهای داینامیک (key-value)
CREATE TABLE IF NOT EXISTS `listing_fields` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `field_key` VARCHAR(60) NOT NULL,
  `field_value` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_fields_listing_idx` (`listing_id`),
  KEY `listing_fields_key_idx` (`field_key`),
  CONSTRAINT `listing_fields_listing_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- تصاویر آگهی
CREATE TABLE IF NOT EXISTS `listing_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` SMALLINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_images_listing_idx` (`listing_id`),
  CONSTRAINT `listing_images_listing_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
--  Conversations & Messages — چت
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `buyer_id` BIGINT UNSIGNED NOT NULL,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `last_message_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conv_unique` (`listing_id`, `buyer_id`, `seller_id`),
  KEY `conv_buyer_idx` (`buyer_id`),
  KEY `conv_seller_idx` (`seller_id`),
  CONSTRAINT `conv_listing_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `conv_buyer_fk` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `conv_seller_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` BIGINT UNSIGNED NOT NULL,
  `sender_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_conv_idx` (`conversation_id`),
  KEY `messages_sender_idx` (`sender_id`),
  CONSTRAINT `messages_conv_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Favorites — علاقه‌مندی‌ها
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_unique` (`user_id`, `listing_id`),
  CONSTRAINT `favorites_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_listing_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
--  Notifications — اعلان‌ها
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `body` TEXT DEFAULT NULL,
  `data_json` JSON DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_idx` (`user_id`),
  KEY `notifications_read_idx` (`is_read`),
  CONSTRAINT `notifications_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Reports — گزارش‌های تخلف
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED DEFAULT NULL,
  `target_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `reason` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_user_idx` (`user_id`),
  KEY `reports_listing_idx` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Activity Logs — لاگ فعالیت‌ها
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `model_type` VARCHAR(100) DEFAULT NULL,
  `model_id` BIGINT UNSIGNED DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_user_idx` (`user_id`),
  KEY `activity_action_idx` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Settings — تنظیمات سایت (key-value)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT DEFAULT NULL,
  `group_name` VARCHAR(50) DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Static pages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(160) DEFAULT NULL,
  `meta_description` VARCHAR(300) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Banners — بنرهای تبلیغاتی
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  `position` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `banners_position_idx` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- -----------------------------------------------------------------------------
--  Payments — تراکنش‌های پرداخت (آگهی ویژه/فوری)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED DEFAULT NULL,
  `amount` BIGINT NOT NULL,
  `gateway` VARCHAR(20) NOT NULL,
  `gateway_ref` VARCHAR(100) DEFAULT NULL,
  `authority` VARCHAR(100) DEFAULT NULL,
  `tracking_code` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `description` VARCHAR(255) DEFAULT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_user_idx` (`user_id`),
  KEY `payments_status_idx` (`status`),
  CONSTRAINT `payments_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
--  Personal Access Tokens (API auth tokens issued by backend/server.cjs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT DEFAULT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pat_token_unique` (`token`),
  KEY `pat_tokenable_idx` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
--  Seed: Provinces (استان‌های ایران)
-- =============================================================================
INSERT INTO `provinces` (`name`, `slug`, `sort_order`) VALUES
('تهران','tehran',1),('البرز','alborz',2),('اصفهان','isfahan',3),
('فارس','fars',4),('خراسان رضوی','khorasan-razavi',5),('آذربایجان شرقی','east-azerbaijan',6),
('آذربایجان غربی','west-azerbaijan',7),('مازندران','mazandaran',8),('گیلان','gilan',9),
('خوزستان','khuzestan',10),('کرمان','kerman',11),('سیستان و بلوچستان','sistan-baluchestan',12),
('قم','qom',13),('کرمانشاه','kermanshah',14),('گلستان','golestan',15),
('هرمزگان','hormozgan',16),('مرکزی','markazi',17),('همدان','hamedan',18),
('یزد','yazd',19),('اردبیل','ardabil',20),('زنجان','zanjan',21),
('قزوین','qazvin',22),('لرستان','lorestan',23),('بوشهر','bushehr',24),
('کردستان','kurdistan',25),('کهگیلویه و بویراحمد','kohgiluyeh-boyerahmad',26),
('چهارمحال و بختیاری','chaharmahal-bakhtiari',27),('ایلام','ilam',28),
('خراسان شمالی','north-khorasan',29),('خراسان جنوبی','south-khorasan',30),
('سمنان','semnan',31);

-- =============================================================================
--  Seed: Categories (دسته‌بندی‌های اصلی)
-- =============================================================================
INSERT INTO `categories` (`parent_id`,`name`,`slug`,`icon`,`color`,`fields_json`,`sort_order`,`is_active`) VALUES
(NULL,'املاک','real-estate','🏠','#2563EB',NULL,1,1),
(NULL,'اجاره','rent','🔑','#10B981',NULL,2,1),
(NULL,'وسایل نقلیه','vehicles','🚗','#F59E0B',NULL,3,1);

-- زیر دسته‌ها (parent_id را با ID دسته اصلی مطابقت دهید — معمولاً 1،2،3)
-- تعریف کامل فیلدها در فایل src/lib/categories.ts فرانت‌اند موجود است.

-- =============================================================================
--  Seed: Settings (تنظیمات پیش‌فرض)
-- =============================================================================
INSERT INTO `settings` (`key`,`value`,`group_name`) VALUES
('site_title','خانه بازار','general'),
('site_description','مارکت‌پلیس آگهی‌های ایران','general'),
('contact_phone','','general'),
('contact_email','','general'),
('listing_free_days','30','listings'),
('listing_featured_days','60','listings'),
('listing_urgent_days','7','listings'),
('listing_max_images','10','listings'),
('listing_image_max_size','5242880','listings'),
('otp_expiry_seconds','120','auth'),
('login_max_attempts','5','auth');

-- =============================================================================
--  Seed: Default Admin User
--  پسورد فقط نمونه است — حتماً پس از Import تغییر دهید!
--  Hash معادل sha256("admin12345") — همان الگوریتمی که backend/server.cjs
--  با hashPassword() استفاده می‌کند (نه bcrypt).
-- =============================================================================
INSERT INTO `users` (`name`,`phone`,`email`,`password_hash`,`is_admin`,`is_active`,`is_verified`,`created_at`,`updated_at`) VALUES
('مدیر سایت','09120000000','admin@khane-bazar-118.ir','41e5653fc7aeb894026d6bb7b2db7f65902b454945fa8fd65a6327047b5277f',1,1,1,NOW(),NOW());

-- =============================================================================
--  END OF SCHEMA — موفق باشید! 🎉
-- =============================================================================
