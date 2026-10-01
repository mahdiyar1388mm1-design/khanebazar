import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./polyfills";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ثبت service worker برای قابلیت نصب PWA و کش سبک فایل‌های ایستا
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // اگر ثبت نشد (مثلاً روی http غیرامن)، سایت به‌صورت عادی کار می‌کند
    });
  });
}
