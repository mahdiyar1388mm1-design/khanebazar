import { useEffect, useState, type ReactNode } from "react";
import { Link } from "../lib/Link";
import { isStandalone, requestInstall, useInstallReady } from "../lib/pwa";
import { isNativeApp } from "../lib/native";
import { AlertTriangle, Check, Copy, Download } from "../components/Icons";
import { SEOHead } from "../components/SEOHead";
import { toFa } from "../lib/format";
import { ANDROID_APK_PATH, IOS_APP_STORE_URL, checkApk, type ApkStatus } from "../lib/appLinks";
import { copyText } from "../utils/clipboard";

type Os = "ios" | "android" | "desktop";
type InstallState = "idle" | "busy" | "installed" | "dismissed";

const SITE_URL = "https://khane-bazar-118.ir/";

function detectOs(): Os {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const iOS =
    /iP(hone|ad|od)/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /(Instagram|FBAN|FBAV|Telegram|Kakaotalk|MicroMessenger|WebView|Line\/)/i.test(ua);
}

type Step = { icon: string; title: string; body: string };

const ANDROID_STEPS: Step[] = [
  {
    icon: "🌐",
    title: "مرورگر کروم را باز کن",
    body: "همین صفحه را در مرورگر کروم (یا «سامسونگ اینترنت») باز کن — در تب معمولی، نه حالت ناشناس.",
  },
  {
    icon: "⋮",
    title: "روی منوی مرورگر بزن",
    body: "در کروم اندروید، سه‌نقطه بالای صفحه است؛ در «سامسونگ اینترنت» دکمه‌ی ☰ پایین صفحه است.",
  },
  {
    icon: "🏠",
    title: "«افزودن به صفحه اصلی» را انتخاب کن",
    body: "در نسخه‌های جدید کروم، گزینه «نصب برنامه / Install app» را هم دارد که همان کار را انجام می‌دهد.",
  },
  {
    icon: "✅",
    title: "نصب را تأیید کن",
    body: "آیکون خانه بازار روی صفحه اصلی گوشی ساخته می‌شود و می‌توانی آن را مثل هر اپ دیگری باز کنی.",
  },
];

const IOS_STEPS: Step[] = [
  {
    icon: "🧭",
    title: "سافاری را باز کن",
    body: "نصب روی آیفون و آیپد فقط از مرورگر سافاری امکان‌پذیر است؛ مرورگرهای دیگر مثل کروم اجازه‌ی نصب نمی‌دهند.",
  },
  {
    icon: "📤",
    title: "روی دکمه‌ی اشتراک‌گذاری بزن",
    body: "مربع با فلش رو به بالا، پایین صفحه‌ی سافاری (در نسخه‌های قدیمی‌تر بالای صفحه).",
  },
  {
    icon: "🏠",
    title: "«افزودن به صفحه اصلی» را انتخاب کن",
    body: "گزینه‌ی Add to Home Screen را در منوی بازشده پیدا کن و بزن.",
  },
  {
    icon: "✅",
    title: "روی «افزودن» بزن",
    body: "نام «خانه بازار» را بگذار و تأیید کن؛ آیکون اپ به صفحه اصلی اضافه می‌شود.",
  },
];

const FEATURES = [
  { icon: "⚡", title: "سریع‌تر از مرورگر", body: "بدون بارگذاری دوباره‌ی صفحه باز می‌شود و تجربه‌ای روان‌تر دارد." },
  { icon: "🖼️", title: "تمام‌صفحه و بدون مزاحمت", body: "بدون نوار آدرس و دکمه‌های مرورگر؛ دقیقاً مثل یک اپ واقعی." },
  { icon: "🔄", title: "همیشه به‌روز", body: "نیازی به نصب نسخه‌ی جدید نیست؛ اپلیکیشن خودش به‌روزرسانی می‌شود." },
  { icon: "🏠", title: "یک لمس تا خانه بازار", body: "آیکون اپ روی صفحه اصلی گوشی است؛ با یک لمس وارد می‌شوی." },
];

const FAQS = [
  {
    q: "این اپلیکیشن واقعی است یا فقط یک میانبر؟",
    a: "خانه بازار یک وب‌اپلیکیشن (PWA) است: مثل یک اپ نصب می‌شود، در پنجره‌ی جداگانه و تمام‌صفحه اجرا می‌شود و امکانات سایت را کامل دارد.",
  },
  {
    q: "چرا در اپ‌استور یا مایکت نیست؟",
    a: "چون برای نصب به فروشگاه نیازی نیست؛ مستقیم از مرورگر نصب می‌شود، رایگان است و همیشه آخرین نسخه را دارد.",
  },
  {
    q: "نصب چه هزینه‌ای دارد؟",
    a: "نصب کاملاً رایگان است و هیچ هزینه‌ای برای استفاده از آن پرداخت نمی‌کنید.",
  },
  {
    q: "اگر گوشی عوض کنم چه می‌شود؟",
    a: "کافی است دوباره همین صفحه را در مرورگر گوشی جدید باز کنید و نصب را تکرار کنید؛ حساب کاربری و آگهی‌های شما همان‌طور که بوده باقی می‌ماند.",
  },
  {
    q: "چطور اپلیکیشن را حذف کنم؟",
    a: "روی آیکون خانه بازار انگشت نگه دارید و «حذف / Remove» را انتخاب کنید؛ اطلاعات حساب شما در سایت باقی می‌ماند.",
  },
];

export function AppInstallPage() {
  const [env] = useState(() => detectOs());
  const [inApp] = useState(() => isInAppBrowser());
  const [standalone] = useState(() => isStandalone());
  // داخل اپلیکیشن مستقل (اندروید/iOS) هیچ بخش «دانلود نرم‌افزار»ی نشان داده نمی‌شود
  const [native] = useState(() => isNativeApp());
  const appMode = native || standalone;
  const installable = useInstallReady();

  const [tab, setTab] = useState<"ios" | "android">(env === "ios" ? "ios" : "android");
  const [installState, setInstallState] = useState<InstallState>("idle");
  const [copied, setCopied] = useState(false);
  const [apkStatus, setApkStatus] = useState<ApkStatus>("checking");

  useEffect(() => {
    let alive = true;
    checkApk().then((s) => { if (alive) setApkStatus(s); });
    return () => { alive = false; };
  }, []);

  const steps = tab === "ios" ? IOS_STEPS : ANDROID_STEPS;

  const runInstall = async () => {
    setInstallState("busy");
    const result = await requestInstall();
    setInstallState(result === "installed" ? "installed" : "dismissed");
  };

  const copyLink = async () => {
    try {
      await copyText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* دسترسی به کلیپ‌بورد ممکن نیست؛ نادیده می‌گیریم */
    }
  };

  return (
    <div>
      <SEOHead
        title="نصب اپلیکیشن خانه بازار | اندروید و آیفون"
        description="خانه بازار را روی گوشی اندروید یا آیفون خود نصب کنید — راهنمای گام‌به‌گام نصب اپلیکیشن (PWA) بدون نیاز به اپ‌استور."
        canonical="https://khane-bazar-118.ir/app"
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--royal-blue-dark) 0%, var(--royal-blue) 55%, var(--royal-blue-light) 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(200,169,81,.16) 0%, transparent 55%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-[1.15fr_.85fr] items-center gap-10">
          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: "rgba(200,169,81,.14)", border: "1px solid rgba(200,169,81,.5)", color: "var(--gold-light)" }}>
              💎 نصب رایگان — اندروید، آیفون و وب
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3" style={{ color: "var(--gold-light)" }}>
              خانه بازار را روی گوشی‌ات نصب کن
            </h1>
            <p className="text-sm md:text-base leading-8 max-w-xl mx-auto md:mx-0 mb-6" style={{ color: "var(--stone)" }}>
              با چند لمس ساده، آیکون خانه بازار به صفحه اصلی گوشی اضافه می‌شود؛
              درست مثل یک اپ واقعی باز می‌شود، سریع‌تر کار می‌کند و همیشه به‌روز است.
            </p>

            {appMode ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ backgroundColor: "rgba(16,185,129,.15)", border: "1px solid #34d399", color: "#6ee7b7" }}>
                <Check size={18} /> روی این دستگاه نصب است
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {installable && (
                  <button
                    onClick={runInstall}
                    disabled={installState === "busy"}
                    className="px-6 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 btn-gold disabled:opacity-60"
                  >
                    <Download size={18} /> نصب اپلیکیشن
                  </button>
                )}
                <button
                  onClick={() => document.getElementById("install-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition"
                  style={{ backgroundColor: "rgba(255,255,255,.06)", border: "1px solid rgba(200,169,81,.4)", color: "var(--gold-light)" }}
                >
                  راهنمای {env === "ios" ? "آیفون و آیپد" : env === "android" ? "اندروید" : "نصب"} ↓
                </button>
              </div>
            )}
          </div>

          <PhoneMock />
        </div>
        <div className="h-1" style={{ background: "linear-gradient(90deg, transparent 5%, var(--gold-dark) 20%, var(--gold) 50%, var(--gold-dark) 80%, transparent 95%)" }} />
      </section>

      {/* مراحل نصب */}
      <div id="install-guide" className="max-w-3xl mx-auto px-4 py-10 md:py-12">
        {/* اپلیکیشن مستقل — دانلود مستقیم؛ فقط در سایت نمایش داده می‌شود
            و داخل خودِ اپلیکیشن‌ها (اندروید/iOS) مخفی است */}
        {!native && (
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: "1.5px solid var(--gold)", background: "var(--card-bg)" }}>
          <div className="px-5 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))" }}>
            <img src="/icons/icon-192.png" alt="خانه بازار 118" className="w-8 h-8 rounded-lg object-cover" style={{ border: "1px solid var(--gold)" }} />
            <h2 className="font-extrabold text-base" style={{ color: "var(--gold-light)" }}>اپلیکیشن خانه بازار 118</h2>
          </div>
          <div className="p-5">
            <AppRow
              emoji="🤖"
              title="نسخه‌ی اندروید — فایل نصب (APK)"
              desc="اپلیکیشن مستقلی که جدا از سایت ساخته می‌شود؛ فایل نصب را دانلود و روی گوشی نصب کن."
              action={
                apkStatus === "available" ? (
                  <a
                    href={ANDROID_APK_PATH}
                    download
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold btn-gold"
                  >
                    <Download size={16} /> دانلود APK
                  </a>
                ) : (
                  <span
                    className="shrink-0 inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-light)", border: "1px solid var(--stone-light)" }}
                  >
                    {apkStatus === "checking" ? "در حال بررسی..." : "به‌زودی منتشر می‌شود"}
                  </span>
                )
              }
              hint={apkStatus === "missing" ? "فعلاً از «نصب از مرورگر» پایین همین صفحه استفاده کنید — بدون نیاز به فایل دانلود." : undefined}
            />
            <AppRow
              emoji="🍎"
              title="نسخه‌ی آیفون و آیپد"
              desc="از طریق اپ‌استور اپل توزیع می‌شود؛ بعد از انتشار، لینک همین‌جا قرار می‌گیرد."
              last
              action={
                IOS_APP_STORE_URL ? (
                  <a
                    href={IOS_APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold btn-royal"
                  >
                    دانلود از اپ‌استور
                  </a>
                ) : (
                  <span
                    className="shrink-0 inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-light)", border: "1px solid var(--stone-light)" }}
                  >
                    به‌زودی در اپ‌استور
                  </span>
                )
              }
            />
          </div>
        </div>
        )}

        {appMode ? (
          <div className="card-achaemenid rounded-2xl p-6 md:p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center mb-4"
              style={{ backgroundColor: "rgba(16,185,129,.12)" }}>
              <Check className="text-emerald-600" size={30} />
            </div>
            <h2 className="font-extrabold text-lg md:text-xl mb-2" style={{ color: "var(--text-dark)" }}>
              خانه بازار روی این دستگاه نصب است 🎉
            </h2>
            <p className="text-sm leading-7 max-w-md mx-auto" style={{ color: "var(--text-light)" }}>
              برای بهترین تجربه، اپلیکیشن را از آیکون صفحه اصلی باز کن؛
              بدون نوار مرورگر و با دسترسی سریع‌تر.
            </p>
            <p className="text-xs mt-4" style={{ color: "var(--text-light)" }}>
              برای حذف: روی آیکون انگشت نگه دار → «حذف / Remove».
            </p>
          </div>
        ) : (
          <>
            {/* هشدار مرورگر داخلی */}
            {inApp && (
              <div className="rounded-2xl p-4 mb-6 flex items-start gap-3 text-sm leading-7"
                style={{ backgroundColor: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.4)" }}>
                <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={20} />
                <p>
                  <strong className="text-amber-800">این صفحه داخل مرورگر داخلی یک اپ باز شده است</strong>{" "}
                  (مثل اینستاگرام، تلگرام یا واتس‌اپ). برای نصب، اول با گزینه‌ی «باز کردن در مرورگر»
                  (Open in browser) وارد سافاری یا کروم شو؛ مرورگرهای داخلی اجازه‌ی نصب نمی‌دهند.
                </p>
              </div>
            )}

            {env === "android" && (
              <div className="rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4"
                style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))", border: "1px solid var(--gold)" }}>
                <div className="flex-1">
                  <div className="font-extrabold" style={{ color: "var(--gold-light)" }}>
                    {installable || installState === "busy" ? "گوشی شما آماده‌ی نصب است" : "نصب با یک لمس، مستقیم از مرورگر"}
                  </div>
                  <p className="text-xs mt-1 leading-6" style={{ color: "var(--stone)" }}>
                    {installable || installState === "busy"
                      ? "روی دکمه‌ی زیر بزن و در پنجره‌ی بازشده «نصب» را تأیید کن."
                      : "کروم اندروید معمولاً دکمه‌ی نصب را خودش نشان می‌دهد؛ اگر ندیدی، مراحل کنار همین متن را دنبال کن."}
                  </p>
                </div>
                {(installable || installState === "busy") && (
                  <button
                    onClick={runInstall}
                    disabled={installState === "busy"}
                    className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-gold disabled:opacity-60"
                  >
                    <Download size={16} /> {installState === "busy" ? "در حال نصب..." : "نصب اپلیکیشن"}
                  </button>
                )}
              </div>
            )}

            {env === "desktop" && (
              <div className="rounded-2xl p-5 md:p-6 mb-8"
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone-light)" }}>
                <div className="font-extrabold mb-1" style={{ color: "var(--text-dark)" }}>
                  به نظر می‌رسد با رایانه وارد شده‌اید
                </div>
                <p className="text-sm leading-7 mb-4" style={{ color: "var(--text-light)" }}>
                  برای نصب روی گوشی، این صفحه را در مرورگر گوشی باز کنید (آدرس زیر را کپی و برای خودتان ارسال کنید):
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div dir="ltr" className="flex-1 h-11 px-3 rounded-xl flex items-center text-left text-sm font-mono"
                    style={{ backgroundColor: "var(--cream-dark)", border: "1px dashed var(--gold-dark)", color: "var(--bronze)" }}>
                    {SITE_URL}
                  </div>
                  <button onClick={copyLink}
                    className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 btn-gold">
                    {copied ? <><Check size={16} /> کپی شد</> : <><Copy size={16} /> کپی لینک</>}
                  </button>
                </div>
                <p className="text-xs mt-3 leading-6" style={{ color: "var(--text-light)" }}>
                  نکته: در رایانه هم می‌توانید خانه بازار را از منوی ⋮ کروم → «نصب خانه بازار» مثل برنامه نصب کنید.
                </p>
              </div>
            )}

            {/* انتخاب پلتفرم */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl mb-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--cream-dark)", border: "1px solid var(--stone-light)" }}>
              <TabButton active={tab === "android"} onClick={() => setTab("android")}>
                🤖 اندروید
              </TabButton>
              <TabButton active={tab === "ios"} onClick={() => setTab("ios")}>
                🍏 آیفون / آیپد
              </TabButton>
            </div>

            <h2 className="text-center font-extrabold text-lg md:text-xl mb-6" style={{ color: "var(--text-dark)" }}>
              مراحل نصب روی {tab === "ios" ? "آیفون و آیپد" : "اندروید"}
            </h2>

            <ol className="card-achaemenid rounded-2xl p-5 md:p-7">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} index={i} total={steps.length} />
              ))}
            </ol>

            {/* نکته */}
            <div className="rounded-2xl p-4 mt-6 flex items-start gap-3 text-sm leading-7"
              style={{ backgroundColor: "rgba(200,169,81,.1)", border: "1px solid rgba(200,169,81,.35)" }}>
              <span className="text-lg shrink-0">💡</span>
              <p style={{ color: "var(--text-medium)" }}>
                <strong>گزینه را پیدا نمی‌کنید؟</strong>{" "}
                {tab === "ios"
                  ? "مطمئن شوید از سافاری استفاده می‌کنید (نه کروم و نه مرورگر داخلی اپ‌ها) و iOS گوشی را به‌روزرسانی کرده‌اید."
                  : "فایل دانلود یا نسخه‌ی مرورگر را به‌روز کنید؛ حالت ناشناس (Incognito) و اتصال اینترنت ضعیف مانع نمایش گزینه‌ی نصب می‌شوند."}
              </p>
            </div>
          </>
        )}

        {/* مزایا */}
        <div className="mt-14">
          <h2 className="font-extrabold text-lg md:text-xl mb-6 text-center" style={{ color: "var(--text-dark)" }}>
            چرا نصب کنیم؟
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-achaemenid p-4 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold text-sm mb-1" style={{ color: "var(--text-dark)" }}>{f.title}</div>
                <p className="text-xs leading-6" style={{ color: "var(--text-light)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* سوالات متداول */}
        <div className="mt-14">
          <h2 className="font-extrabold text-lg md:text-xl mb-6" style={{ color: "var(--text-dark)" }}>
            سوالات پرتکرار نصب
          </h2>
          <div className="space-y-3">
            {FAQS.map((it) => (
              <details key={it.q} className="card-achaemenid rounded-xl p-4 group">
                <summary className="font-bold cursor-pointer flex items-center gap-2" style={{ color: "var(--text-dark)" }}>
                  <span style={{ color: "var(--gold-dark)" }}>◈</span> {it.q}
                </summary>
                <p className="text-sm leading-7 mt-3 pr-7" style={{ color: "var(--text-light)" }}>{it.a}</p>
              </details>
            ))}
          </div>

          <div className="text-center mt-8 text-sm" style={{ color: "var(--text-light)" }}>
            سوال دیگری دارید؟{" "}
            <Link to={{ name: "contact" }} className="font-bold hover:underline" style={{ color: "var(--gold-dark)" }}>
              با پشتیبانی تماس بگیرید
            </Link>{" "}
            یا{" "}
            <Link to={{ name: "faq" }} className="font-bold hover:underline" style={{ color: "var(--gold-dark)" }}>
              سوالات متداول
            </Link>{" "}
            را ببینید.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- اجزای داخلی ---------- */

function AppRow(props: {
  emoji: string;
  title: string;
  desc: string;
  action: ReactNode;
  hint?: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4"
      style={props.last ? {} : { borderBottom: "1px solid var(--stone-light)" }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-11 h-11 shrink-0 rounded-xl grid place-items-center text-xl"
          style={{ backgroundColor: "var(--cream-dark)", border: "1px solid var(--stone-light)" }}
        >
          {props.emoji}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm" style={{ color: "var(--text-dark)" }}>{props.title}</div>
          <div className="text-xs leading-6 mt-0.5" style={{ color: "var(--text-light)" }}>{props.desc}</div>
          {props.hint && (
            <div className="text-[11px] mt-1 font-semibold" style={{ color: "var(--bronze)" }}>{props.hint}</div>
          )}
        </div>
      </div>
      {props.action}
    </div>
  );
}

function TabButton(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      className={`h-10 rounded-xl text-sm font-bold transition ${
        props.active ? "btn-gold" : "hover:bg-white"
      }`}
      style={props.active ? {} : { color: "var(--text-medium)" }}
    >
      {props.children}
    </button>
  );
}

function StepRow({ step, index, total }: { step: Step; index: number; total: number }) {
  const last = index === total - 1;
  return (
    <li className="relative flex items-start gap-4">
      <div className="flex flex-col items-center self-stretch">
        <div
          className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}
        >
          {toFa(index + 1)}
        </div>
        {!last && <div className="w-[2px] flex-1 my-1.5 rounded" style={{ background: "var(--stone-light)" }} />}
      </div>
      <div className="flex-1 pb-7 -mt-0.5">
        <div className="font-bold text-[15px] flex items-center gap-2" style={{ color: "var(--text-dark)" }}>
          <span className="text-lg leading-none">{step.icon}</span>
          {step.title}
        </div>
        <p className="text-sm leading-7 mt-1" style={{ color: "var(--text-light)" }}>{step.body}</p>
      </div>
    </li>
  );
}

function PhoneMock() {
  return (
    <div className="relative hidden md:block mx-auto w-60 lg:w-64 select-none pointer-events-none">
      <div
        className="absolute -inset-8 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,169,81,.55) 0%, transparent 65%)" }}
      />
      <div
        className="relative rounded-[2.6rem] p-2.5 shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0F1A2E, #243556)", border: "1px solid var(--gold)" }}
      >
        <div className="rounded-[2rem] overflow-hidden bg-white">
          <div className="flex items-center justify-between px-5 pt-2 text-[8px] font-semibold fa-num"
            style={{ color: "var(--text-light)" }}>
            <span dir="ltr">۹:۴۱</span>
            <span dir="ltr" className="tracking-wider">▮▮▮ ▮▮ ▮</span>
          </div>
          <div className="px-3 pt-1 pb-3" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))" }}>
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="" className="w-6 h-6 rounded-md object-cover" style={{ border: "1px solid var(--gold)" }} />
              <div>
                <div className="text-[9px] font-extrabold" style={{ color: "var(--gold-light)" }}>خانه بازار</div>
                <div className="text-[6px]" style={{ color: "var(--stone)" }}>خرید، فروش و اجاره</div>
              </div>
            </div>
            <div className="mt-2 h-4 rounded-md" style={{ backgroundColor: "rgba(255,255,255,.12)" }} />
            <div className="mt-2 flex gap-1.5">
              <div className="h-3 w-1/3 rounded-full" style={{ backgroundColor: "rgba(200,169,81,.4)" }} />
              <div className="h-3 w-1/4 rounded-full" style={{ backgroundColor: "rgba(255,255,255,.12)" }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {["🏠", "🚗", "🗝️", "🏢", "📄", "📍", "❤️", "💬", "⚙️"].map((e, i) => (
              <div key={i} className="h-11 rounded-xl grid place-items-center text-base"
                style={{ backgroundColor: i % 2 ? "var(--cream)" : "var(--cream-dark)", border: "1px solid var(--stone-light)" }}>
                {e}
              </div>
            ))}
          </div>
          <div className="px-3 pb-2.5">
            <div className="rounded-xl py-2 text-center text-[8px] font-bold"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))", color: "var(--royal-blue-dark)" }}>
              مشاهده آگهی‌ها
            </div>
          </div>
        </div>
      </div>
      {/* برچسب نصب‌شده */}
      <div
        className="absolute -left-10 top-16 rotate-[-8deg] px-3 py-1.5 rounded-xl text-[11px] font-extrabold shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "var(--royal-blue-dark)" }}
      >
        ✓ نصب شد
      </div>
    </div>
  );
}
