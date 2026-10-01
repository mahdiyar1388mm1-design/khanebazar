/**
 * ============================================================================
 *  پیکربندی API ها (خانه بازار)
 * ============================================================================
 *  این فایل محل اتصال فرانت‌اند به بک‌اند Node.js/Express (backend/server.cjs)
 *  و سرویس‌های خارجی است. زمانی که سایت روی هاست خودتان نصب شد، مقادیر را از
 *  طریق فایل .env یا متغیرهای محیطی Vite (VITE_*) تنظیم کنید.
 *
 *  هیچ مقدار واقعی در این فایل قرار داده نشده — همه به عنوان placeholder
 *  باقی مانده‌اند تا شما با کلیدهای واقعی خود جایگزین کنید.
 * ============================================================================
 */

export const API_CONFIG = {
  // آدرس پایه API — تنظیم روی دامنه اصلی
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://khane-bazar-118.ir/api",

  // کلید کاوه‌نگار برای ارسال پیامک OTP (در سمت بک‌اند نگهداری می‌شود)
  KAVENEGAR_API_KEY: import.meta.env.VITE_KAVENEGAR_API_KEY || "",
  KAVENEGAR_OTP_TEMPLATE: import.meta.env.VITE_KAVENEGAR_OTP_TEMPLATE || "",

  // Google reCAPTCHA v3
  RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",

  // Pusher برای چت Real-time
  PUSHER_KEY: import.meta.env.VITE_PUSHER_KEY || "",
  PUSHER_CLUSTER: import.meta.env.VITE_PUSHER_CLUSTER || "",

  // Firebase Cloud Messaging برای Push Notification
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || "",
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || "",
  FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY || "",

};

export function isBackendConnected(): boolean {
  return !!API_CONFIG.BASE_URL;
}

/**
 * لیست کامل Endpointهای API که باید در بک‌اند (backend/server.cjs) پیاده‌سازی شوند.
 * این آرایه فقط برای مرجع و نمایش در پنل ادمین استفاده می‌شود.
 */
export const API_ENDPOINTS = {
  auth: [
    "POST /api/auth/send-otp",
    "POST /api/auth/verify-otp",
    "POST /api/auth/register",
    "POST /api/auth/login",
    "POST /api/auth/logout",
    "GET  /api/auth/user",
  ],
  listings: [
    "GET  /api/listings",
    "GET  /api/listings/{id}",
    "POST /api/listings",
    "PUT  /api/listings/{id}",
    "DELETE /api/listings/{id}",
    "POST /api/listings/{id}/images",
    "DELETE /api/listings/{id}/images/{imageId}",
    "POST /api/listings/{id}/renew",
    "POST /api/listings/{id}/feature",
    "GET  /api/listings/my",
  ],
  search: ["GET /api/search", "GET /api/search/suggestions", "GET /api/search/filters"],
  categories: ["GET /api/categories", "GET /api/categories/{slug}", "GET /api/categories/{id}/fields"],
  cities: ["GET /api/provinces", "GET /api/provinces/{id}/cities", "GET /api/cities/search"],
  chat: [
    "GET  /api/conversations",
    "GET  /api/conversations/{id}",
    "POST /api/conversations",
    "GET  /api/conversations/{id}/messages",
    "POST /api/conversations/{id}/messages",
    "PUT  /api/messages/{id}/read",
  ],
  favorites: [
    "GET  /api/favorites",
    "POST /api/favorites",
    "DELETE /api/favorites/{listingId}",
    "GET  /api/favorites/check/{listingId}",
  ],
  notifications: [
    "GET  /api/notifications",
    "PUT  /api/notifications/{id}/read",
    "PUT  /api/notifications/read-all",
    "DELETE /api/notifications/{id}",
  ],
  user: ["GET /api/user/profile", "PUT /api/user/profile", "PUT /api/user/password", "GET /api/user/stats"],
};

// ----------------------------------------------------------------------------
// Wrapper برای فراخوانی API بک‌اند. در حال حاضر اگر BASE_URL تنظیم نشده باشد،
// خطا برمی‌گرداند تا فرانت‌اند روی localStorage کار کند.
// ----------------------------------------------------------------------------
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!isBackendConnected()) {
    throw new Error("BACKEND_NOT_CONFIGURED");
  }
  const token = localStorage.getItem("kb_token");
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}
