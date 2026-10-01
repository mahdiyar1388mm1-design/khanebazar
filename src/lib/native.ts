/**
 * تشخیص اجرای سایت داخل اپلیکیشن‌های مستقل (اندروید/iOS ساخته‌شده با Capacitor).
 *
 * بخش «دانلود نرم‌افزار» فقط باید در سایت دیده شود؛ کاربری که اپ را نصب کرده
 * نیازی به دیدن دکمه‌ی دانلود اپ ندارد. برای همین همه‌ی آن بخش‌ها با این
 * تابع مخفی می‌شوند.
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  if (cap) {
    try {
      if (typeof cap.isNativePlatform === "function") return !!cap.isNativePlatform();
      if (typeof cap.getPlatform === "function") return cap.getPlatform() !== "web";
      if (cap.platform && cap.platform !== "web") return true;
    } catch {
      /* نادیده بگیر — به بررسی User-Agent می‌رویم */
    }
  }
  // نسخه‌ی اندروید/iOS کپسیتور عبارت Capacitor را در User-Agent دارد.
  return /\bCapacitor\b/i.test(window.navigator?.userAgent || "");
}

/** نام پلتفرمِ اپ (اندروید/iOS) یا null اگر در مرورگر باشیم. */
export function nativePlatform(): "ios" | "android" | null {
  if (!isNativeApp()) return null;
  const cap = (window as any).Capacitor;
  let platform = cap?.platform || cap?.getPlatform?.() || "";
  if (!platform) platform = /iPhone|iPad|iPod/i.test(window.navigator?.userAgent || "") ? "ios" : "android";
  return String(platform).toLowerCase() === "ios" ? "ios" : "android";
}
