/*
 * لینک‌های دانلود اپلیکیشن‌های مستقل (که جدا از سایت ساخته می‌شوند).
 * کافی است فایل APK در پوشه‌ی public/downloads با همین نام قرار بگیرد
 * و آدرس اپ‌استور (بعد از انتشار iOS) در IOS_APP_STORE_URL وارد شود؛
 * بقیه‌ی سایت خودکار از همین مقادیر استفاده می‌کند.
 */

export const ANDROID_APK_PATH = "/downloads/khane-bazar.apk";
export const IOS_APP_STORE_URL = ""; // مثال: "https://apps.apple.com/app/idXXXXXXXX"

export type ApkStatus = "checking" | "available" | "missing";

/**
 * بررسی می‌کند که آیا فایل APK واقعاً روی سرور موجود است یا نه.
 * (سرورهای SPA برای فایل‌های ناموجود هم index.html برمی‌گردانند؛
 * بنابراین به‌جای کد وضعیت، نوع محتوا را بررسی می‌کنیم.)
 */
export function checkApk(): Promise<ApkStatus> {
  return fetch(ANDROID_APK_PATH, { method: "HEAD" })
    .then((res) => {
      if (!res.ok) return "missing" as const;
      const contentType = res.headers.get("content-type") || "";
      return contentType.includes("html") ? ("missing" as const) : ("available" as const);
    })
    .catch(() => "missing" as const);
}
