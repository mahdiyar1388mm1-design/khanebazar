// Service worker خانه بازار — برای نصب‌پذیری PWA و کش سبک فایل‌های ایستا.
// عمداً ساده نگه داشته شده: صفحات و API همیشه از شبکه خوانده می‌شوند تا آگهی‌ها
// همیشه به‌روز باشند؛ فقط فایل‌های ایستا (js/css/فونت/آیکون) کش می‌شوند.

const CACHE_NAME = "kb-static-v1";
const STATIC_EXTENSIONS = [".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".woff", ".woff2"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // هرگز API یا صفحات HTML را کش نکن — همیشه از شبکه (داده‌ها باید تازه باشند)
  const isApi = url.hostname.startsWith("api.");
  const isStatic = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  if (isApi || !isStatic) return;

  // برای فایل‌های ایستا: اول کش، بعد شبکه (stale-while-revalidate)
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
