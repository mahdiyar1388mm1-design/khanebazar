import { useEffect, useState } from "react";
import { useRoute } from "../lib/router";
import { isStandalone, requestInstall, useInstallReady } from "../lib/pwa";
import { isNativeApp } from "../lib/native";
import { Download, X } from "./Icons";

const DISMISS_KEY = "kb_pwa_install_dismissed";

/**
 * بنر پایین صفحه برای نصب اپلیکیشن (PWA). فقط وقتی مرورگر واقعاً قابل نصب
 * تشخیص بدهد نمایش داده می‌شود (نه در حالت standalone، نه بعد از رد کردن،
 * و نه در خودِ صفحه‌ی «نصب اپلیکیشن» که راهنمای کامل دارد).
 */
export function InstallPrompt() {
  const route = useRoute();
  const installable = useInstallReady();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dismissed = !!localStorage.getItem(DISMISS_KEY);
    // داخل اپلیکیشن مستقل نیازی به پیشنهاد نصب نیست
    setVisible(!isStandalone() && !isNativeApp() && !dismissed && installable && route.name !== "app");
  }, [installable, route.name]);

  if (!visible) return null;

  const install = async () => {
    setBusy(true);
    await requestInstall();
    setBusy(false);
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div
      className="fixed bottom-16 md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-80 z-40 rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
      style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))", border: "1px solid var(--gold)" }}
    >
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ border: "1.5px solid var(--gold)" }}>
        <img src="/icons/icon-192.png" alt="خانه بازار" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white">نصب اپلیکیشن خانه بازار</div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.7)" }}>دسترسی سریع‌تر، بدون نیاز به مرورگر</div>
      </div>
      <button
        onClick={install}
        disabled={busy}
        className="shrink-0 px-3 py-2 rounded-lg text-xs font-bold btn-gold flex items-center gap-1 disabled:opacity-60"
      >
        <Download size={14} /> نصب
      </button>
      <button onClick={dismiss} aria-label="بستن" className="shrink-0 p-1 rounded-lg" style={{ color: "rgba(255,255,255,.6)" }}>
        <X size={16} />
      </button>
    </div>
  );
}
