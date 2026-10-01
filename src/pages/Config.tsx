import { useState } from "react";
import { API_CONFIG, API_ENDPOINTS, isBackendConnected } from "../lib/api";
import { Server, Database, ShieldCheck, Download, Copy, Info, Check, X } from "../components/Icons";
import { toast } from "../components/Toast";
import { copyText } from "../utils/clipboard";

export function ConfigPage() {
  const [tab, setTab] = useState<"overview" | "env" | "endpoints" | "database">("overview");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-l from-slate-800 to-slate-700 text-white rounded-2xl p-5 md:p-6 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 grid place-items-center shrink-0">
            <Server size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl">پیکربندی بک‌اند</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 leading-6">
              این صفحه برای راهنمایی شما هنگام نصب پروژه روی هاست شخصی است. همه‌ی کلیدهای API و
              مقادیر حساس به‌صورت Placeholder قرار داده شده‌اند تا توسط شما تکمیل شوند.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          {isBackendConnected() ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>بک‌اند متصل: <span className="font-bold">{API_CONFIG.BASE_URL}</span></span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>بک‌اند پیکربندی نشده — حالت آفلاین (داده‌ها در مرورگر شما)</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-5 overflow-x-auto thin-scroll">
        <div className="flex gap-1 min-w-max">
          {([
            { v: "overview", l: "نمای کلی", i: <Info size={16} /> },
            { v: "env", l: "متغیرهای محیطی (.env)", i: <Server size={16} /> },
            { v: "endpoints", l: "API Endpoints", i: <ShieldCheck size={16} /> },
            { v: "database", l: "دیتابیس MySQL", i: <Database size={16} /> },
          ] as const).map((t) => (
            <button key={t.v} onClick={() => setTab(t.v as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition ${tab === t.v ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t.i} {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <Overview />}
      {tab === "env" && <EnvTab />}
      {tab === "endpoints" && <EndpointsTab />}
      {tab === "database" && <DatabaseTab />}
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-4">
      <Section title="معماری پروژه" icon={<Server size={20} />}>
        <ul className="space-y-2 text-sm">
          <Li>این فرانت‌اند با React + Vite + Tailwind ساخته شده و کاملاً به صورت SPA کار می‌کند.</Li>
          <Li>تمامی صفحات، wizard ثبت آگهی، چت، علاقه‌مندی‌ها و پنل ادمین آماده استفاده هستند.</Li>
          <Li>در حالت <strong>آفلاین</strong>، تمام داده‌ها در <code className="bg-slate-100 px-1 rounded">localStorage</code> مرورگر ذخیره می‌شوند تا بتوانید کل فلو را تست کنید.</Li>
          <Li>برای تولید واقعی، کافیست بک‌اند Node.js/Express (<code className="bg-slate-100 px-1 rounded">backend/server.cjs</code>) را راه‌اندازی کنید و <code className="bg-slate-100 px-1 rounded">VITE_API_BASE_URL</code> را در فایل <code className="bg-slate-100 px-1 rounded">.env</code> فرانت‌اند تنظیم کنید.</Li>
        </ul>
      </Section>

      <Section title="چه چیزی آماده است" icon={<Check size={20} className="text-emerald-500" />}>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            "صفحه اصلی + Hero search",
            "صفحه جستجو با فیلترهای پیشرفته",
            "صفحه دسته‌بندی + breadcrumbs",
            "صفحه جزئیات آگهی + گالری + نقشه",
            "Wizard ۶ مرحله‌ای ثبت آگهی",
            "آپلود تصاویر با Drag & Drop و انتخاب اصلی",
            "فیلدهای داینامیک بر اساس دسته",
            "ورود/ثبت‌نام با OTP (شبیه‌سازی شده)",
            "پنل کاربری + داشبورد + آگهی‌های من",
            "سیستم چت + لیست مکالمات + پیام Real-time در مرورگر",
            "علاقه‌مندی‌ها + اعلان‌ها",
            "پنل ادمین کامل (تأیید/رد آگهی، کاربران، دسته‌ها)",
            "پشتیبانی RTL کامل + فونت Vazirmatn",
            "ریسپانسیو موبایل (با bottom nav)",
            "صفحات استاتیک: درباره، تماس، قوانین، FAQ",
          ].map((s) => (
            <div key={s} className="flex items-center gap-2 text-slate-700">
              <Check size={14} className="text-emerald-500 shrink-0" /> {s}
            </div>
          ))}
        </div>
      </Section>

      <Section title="چه چیزی نیاز به پیکربندی شما دارد" icon={<X size={20} className="text-amber-500" />}>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            "راه‌اندازی بک‌اند Node.js/Express (backend/server.cjs) + ساخت دیتابیس",
            "تنظیم Kavenegar API برای SMS واقعی",
            "تنظیم Pusher برای چت Real-time",
            "تنظیم Firebase FCM برای Push Notification",
            "تنظیم درگاه پرداخت (زرین‌پال / IDPay / NextPay)",
            "تنظیم Google reCAPTCHA v3",
            "تنظیم SMTP برای ایمیل",
          ].map((s) => (
            <div key={s} className="flex items-center gap-2 text-slate-700">
              <X size={14} className="text-amber-500 shrink-0" /> {s}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const ENV_TEMPLATE = `# ============================================================
# خانه بازار - متغیرهای محیطی فرانت‌اند (.env)
# این فایل را در ریشه پروژه فرانت‌اند قرار دهید
# ============================================================

# --- Backend (Node.js/Express) ---
VITE_API_BASE_URL=https://api.your-domain.ir

# --- Kavenegar (پیامک OTP) ---
VITE_KAVENEGAR_API_KEY=YOUR_KAVENEGAR_API_KEY_HERE
VITE_KAVENEGAR_OTP_TEMPLATE=YOUR_TEMPLATE_NAME

# نقشه از OpenStreetMap استفاده می‌کند و کاملاً رایگان است — نیازی به کلید API ندارد.

# --- Google reCAPTCHA v3 ---
VITE_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_SITE_KEY

# --- Pusher (چت Real-time) ---
VITE_PUSHER_KEY=YOUR_PUSHER_KEY
VITE_PUSHER_CLUSTER=mt1

# --- Firebase Cloud Messaging (Push) ---
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY

# --- درگاه پرداخت (آگهی ویژه/فوری) ---
# zarinpal | idpay | nextpay
VITE_PAYMENT_GATEWAY=zarinpal
VITE_PAYMENT_MERCHANT_ID=YOUR_MERCHANT_ID
`;

const BACKEND_ENV = `# ============================================================
# نمونه .env بک‌اند Node.js/Express (backend/server.cjs)
# این فایل را کنار server.cjs در پوشه بک‌اند قرار دهید
# ============================================================

# Server
PORT=3001
NODE_ENV=production
SITE_URL=https://your-domain.ir

# Database (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

# نقشه از OpenStreetMap/Nominatim استفاده می‌کند — رایگان و بدون کلید API.
# در صورت نیاز می‌توانید User-Agent سفارشی برای Nominatim تنظیم کنید:
# NOMINATIM_USER_AGENT=KhaneBazaar/1.0 (https://your-domain.ir)

# (اختیاری) سرو کردن فرانت‌اند build شده مستقیماً از همین سرور Node
# SERVE_FRONTEND=1
# FRONTEND_DIR=../dist
`;

function EnvTab() {
  return (
    <div className="space-y-4">
      <CodeCard
        title="فرانت‌اند: .env (در ریشه پروژه React/Vite)"
        downloadName="frontend.env.example"
        content={ENV_TEMPLATE}
      />
      <CodeCard
        title="بک‌اند: .env (کنار backend/server.cjs در هاست)"
        downloadName="backend.env.example"
        content={BACKEND_ENV}
        downloadHref="/backend/.env.example"
      />
    </div>
  );
}

function EndpointsTab() {
  return (
    <div className="space-y-3">
      {Object.entries(API_ENDPOINTS).map(([group, items]) => (
        <Section key={group} title={`گروه: ${group}`} icon={<ShieldCheck size={20} />}>
          <ul className="font-mono text-xs space-y-1">
            {items.map((it) => (
              <li key={it} className="px-3 py-1.5 bg-slate-50 rounded text-slate-700" dir="ltr">{it}</li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
}

function DatabaseTab() {
  const tables = [
    "users", "categories", "listings", "listing_fields", "listing_images",
    "provinces", "cities", "conversations", "messages",
    "favorites", "notifications", "activity_logs", "settings", "pages", "banners",
  ];
  return (
    <div className="space-y-4">
      <Section title="جداول دیتابیس" icon={<Database size={20} />}>
        <p className="text-sm text-slate-600 leading-7 mb-3">
          اسکیمای کامل MySQL همراه پروژه قرار داده شده — می‌توانید فایل را دانلود و در phpMyAdmin هاست خود وارد کنید.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {tables.map((t) => (
            <code key={t} className="text-xs bg-slate-100 px-3 py-2 rounded text-slate-700 text-center" dir="ltr">{t}</code>
          ))}
        </div>
        <a
          href="/database/schema.sql"
          download="khaneh_bazaar_schema.sql"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm"
        >
          <Download size={16} /> دانلود schema.sql
        </a>
      </Section>

      <Section title="مراحل نصب در هاست" icon={<Server size={20} />}>
        <ol className="space-y-2 text-sm list-decimal mr-5 marker:text-blue-600 marker:font-bold">
          <li>در phpMyAdmin هاست خود یک دیتابیس جدید با نام <code className="bg-slate-100 px-1 rounded">khaneh_bazaar</code> با کالیشن <code className="bg-slate-100 px-1 rounded">utf8mb4_persian_ci</code> بسازید.</li>
          <li>فایل <code className="bg-slate-100 px-1 rounded">schema.sql</code> را وارد کنید (Import).</li>
          <li>فایل‌های <code className="bg-slate-100 px-1 rounded">backend/server.cjs</code> و <code className="bg-slate-100 px-1 rounded">backend/package.json</code> را در پوشه‌ای خارج از <code className="bg-slate-100 px-1 rounded">public_html</code> آپلود کنید (مثلاً <code className="bg-slate-100 px-1 rounded">khane-bazar-api</code>).</li>
          <li>فایل <code className="bg-slate-100 px-1 rounded">.env</code> را کنار <code className="bg-slate-100 px-1 rounded">server.cjs</code> با اطلاعات هاست و سرویس‌ها تکمیل کنید.</li>
          <li>در cPanel به <strong>Setup Node.js App</strong> بروید، اپلیکیشن را با startup file برابر <code className="bg-slate-100 px-1 rounded">server.cjs</code> بسازید و <strong>NPM Install</strong> سپس <strong>Start App</strong> را بزنید.</li>
          <li>خروجی <code className="bg-slate-100 px-1 rounded">npm run build</code> فرانت‌اند را در پوشه <code className="bg-slate-100 px-1 rounded">public_html</code> قرار دهید.</li>
          <li>SSL و HTTPS را فعال کنید.</li>
        </ol>
      </Section>
    </div>
  );
}

function CodeCard(props: { title: string; content: string; downloadName?: string; downloadHref?: string }) {
  return (
    <Section title={props.title} icon={<Server size={20} />}>
      <pre className="bg-slate-900 text-slate-100 text-[11px] leading-5 p-4 rounded-lg overflow-x-auto thin-scroll" dir="ltr"><code>{props.content}</code></pre>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => { copyText(props.content).then(() => toast("کپی شد", "success")); }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5"
        >
          <Copy size={14} /> کپی
        </button>
        {props.downloadHref && (
          <a href={props.downloadHref} download className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5">
            <Download size={14} /> دانلود فایل
          </a>
        )}
      </div>
    </Section>
  );
}

function Section(props: { title: string; icon: any; children: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-500">{props.icon}</span>
        <h3 className="font-bold text-slate-800">{props.title}</h3>
      </div>
      {props.children}
    </div>
  );
}

function Li({ children }: any) {
  return (
    <li className="flex items-start gap-2 text-slate-700 leading-7">
      <Check size={16} className="text-emerald-500 mt-1 shrink-0" /> <span>{children}</span>
    </li>
  );
}
