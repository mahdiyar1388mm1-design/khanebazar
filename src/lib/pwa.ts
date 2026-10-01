import { useEffect, useState } from "react";

/*
 * وضعیت نصب‌پذیری PWA به‌صورت سراسری.
 *
 * رویداد `beforeinstallprompt` فقط یک‌بار در طول بازدید صادر می‌شود؛ برای اینکه هم بنر
 * پایین صفحه و هم صفحه‌ی «نصب اپلیکیشن» بتوانند از آن استفاده کنند، این‌جا به‌صورت
 * سراسری ثبت و نگه‌داری می‌شود.
 */

type InstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** آیا سایت الان به‌صورت اپلیکیشن نصب‌شده (تمام‌صفحه) باز شده است؟ */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (window.navigator as any).standalone === true
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    // جلوگیری از نمایش خودکار نوار نصب کروم تا خودمان تعیین کنیم کجا و چه‌وقت نشان بدهیم
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

/** واکنش‌گرا: آیا مرورگر الان آماده‌ی نمایش دیالوگ نصب است؟ */
export function useInstallReady(): boolean {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return deferredPrompt !== null;
}

/** نمایش دیالوگ نصب مرورگر (اگر در دسترس باشد). */
export async function requestInstall(): Promise<"installed" | "dismissed" | "unavailable"> {
  const ev = deferredPrompt;
  if (!ev) return "unavailable";
  ev.prompt();
  let result: "installed" | "dismissed" = "dismissed";
  try {
    const choice = await ev.userChoice;
    result = choice.outcome === "accepted" ? "installed" : "dismissed";
  } catch {
    // کاربر یا مرورگر دیالوگ را بست؛ چیزی برای گزارش نیست
  }
  deferredPrompt = null;
  notify();
  return result;
}
