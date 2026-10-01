-- Seed: categories (تولیدشده از categories.ts)
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM `categories`;
ALTER TABLE `categories` AUTO_INCREMENT=1;
INSERT INTO `categories` (`id`,`parent_id`,`name`,`slug`,`icon`,`color`,`sort_order`) VALUES
(1, NULL, 'فروش املاک', 'real-estate', '🏠', '#2563EB', 1),
(2, 1, 'فروش خانه', 'house-sale', '🏠', '#2563EB', 2),
(3, 1, 'فروش آپارتمان', 'apartment-sale', '🏢', '#2563EB', 3),
(4, 1, 'فروش ویلا', 'villa-sale', '🏡', '#2563EB', 4),
(5, 1, 'فروش باغ و ویلا باغی', 'garden-sale', '🌳', '#2563EB', 5),
(6, 1, 'فروش زمین', 'land-sale', '🏔️', '#2563EB', 6),
(7, 1, 'پیش‌فروش آپارتمان', 'presale', '📐', '#2563EB', 7),
(8, NULL, 'اجاره املاک', 'rent', '🔑', '#10B981', 8),
(9, 8, 'اجاره مسکونی (ماهیانه)', 'residential-rent', '🏠', '#10B981', 9),
(10, 8, 'اجاره ویلا (روزانه/ماهیانه)', 'villa-rent', '🏡', '#10B981', 10),
(11, 8, 'اجاره خودرو', 'car-rent', '🚗', '#10B981', 11),
(12, NULL, 'وسایل نقلیه', 'vehicles', '🚗', '#F59E0B', 12),
(13, 12, 'فروش خودرو', 'car-sale', '🚗', '#F59E0B', 13),
(14, 12, 'فروش موتورسیکلت', 'motorcycle-sale', '🏍️', '#F59E0B', 14),
(15, 12, 'قایق و سایر وسایل نقلیه', 'boat-sale', '🚤', '#F59E0B', 15);
SET FOREIGN_KEY_CHECKS=1;
