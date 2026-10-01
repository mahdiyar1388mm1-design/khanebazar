import { useEffect, useState } from "react";
import { useCurrentUser, useListings, useAllUsersState, saveListing, deleteListing } from "../lib/store";
import { navigate } from "../lib/router";
import { CATEGORIES } from "../lib/categories";
import { EmptyState } from "../components/EmptyState";
import { Check, X, Trash, User as UserIcon, Server, Database, Sparkles, Eye, Edit, AlertTriangle, ShieldCheck, Grid } from "../components/Icons";
import { formatPrice, timeAgo, toFa, formatPhone } from "../lib/format";
import { toast } from "../components/Toast";
import { Link } from "../lib/Link";

type Tab = "dashboard" | "listings" | "pending" | "users" | "categories" | "settings";

export function AdminPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>("dashboard");
  // آگهی‌ها را بر اساس وضعیت جداگانه می‌گیریم؛ status=pending روی هر نسخه‌ی بک‌اند کار می‌کند
  const pendingList = useListings("pending");
  const activeList = useListings("active");
  const rejectedList = useListings("rejected");
  const all = [...pendingList, ...activeList, ...rejectedList];
  const { users, loading: usersLoading, error: usersError } = useAllUsersState(!!user?.isAdmin);

  useEffect(() => {
    if (!user) { navigate({ name: "login" }); return; }
    if (!user.isAdmin) { toast("دسترسی ندارید", "error"); navigate({ name: "home" }); }
  }, [user]);

  if (!user || !user.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 grid place-items-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg">پنل مدیریت</h1>
            <p className="text-xs text-slate-300 mt-0.5">خوش آمدید {user.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-5 overflow-x-auto thin-scroll">
        <div className="flex gap-1 min-w-max">
          {([
            { v: "dashboard", l: "داشبورد", i: <Grid size={16} /> },
            { v: "pending", l: `در انتظار (${toFa(all.filter(l => l.status === "pending").length)})`, i: <AlertTriangle size={16} /> },
            { v: "listings", l: "همه آگهی‌ها", i: <Sparkles size={16} /> },
            { v: "users", l: "کاربران", i: <UserIcon size={16} /> },
            { v: "categories", l: "دسته‌بندی‌ها", i: <Edit size={16} /> },
            { v: "settings", l: "تنظیمات API", i: <Server size={16} /> },
          ] as const).map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition ${tab === t.v ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t.i} {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && <AdminDashboard listings={all} users={users} />}
      {tab === "pending" && <PendingTab listings={all} />}
      {tab === "listings" && <AllListingsTab listings={all} />}
      {tab === "users" && <UsersTab users={users} loading={usersLoading} error={usersError} />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function AdminDashboard({ listings, users }: any) {
  const stats = {
    total: listings.length,
    active: listings.filter((l: any) => l.status === "active").length,
    pending: listings.filter((l: any) => l.status === "pending").length,
    users: users.length,
    views: listings.reduce((n: number, l: any) => n + (l.views || 0), 0),
    featured: 0,
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Stat label="کل آگهی‌ها" value={toFa(stats.total)} icon={<Sparkles size={22} />} color="blue" />
      <Stat label="آگهی‌های فعال" value={toFa(stats.active)} icon={<Check size={22} />} color="emerald" />
      <Stat label="در انتظار تأیید" value={toFa(stats.pending)} icon={<AlertTriangle size={22} />} color="amber" />
      <Stat label="کل کاربران" value={toFa(stats.users)} icon={<UserIcon size={22} />} color="purple" />
      <Stat label="کل بازدیدها" value={toFa(stats.views)} icon={<Eye size={22} />} color="rose" />
      <Stat label="آگهی‌های ویژه/فوری" value={toFa(stats.featured)} icon={<Sparkles size={22} />} color="orange" />
    </div>
  );
}

function PendingTab({ listings }: any) {
  const pending = listings.filter((l: any) => l.status === "pending");
  if (pending.length === 0) return <EmptyState icon="✅" title="آگهی‌ای برای بررسی نیست" description="همه آگهی‌ها بررسی شده‌اند." />;
  return (
    <div className="space-y-3">
      {pending.map((l: any) => (
        <AdminListingRow
          key={l.id} listing={l}
          actions={
            <>
              <button onClick={async () => { try { await saveListing({ ...l, status: "active" }); toast("آگهی تأیید شد", "success"); } catch (e: any) { toast(e?.message || "خطا در تأیید — بک‌اند را ری‌استارت کنید", "error"); } }} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1"><Check size={14} /> تأیید</button>
              <button onClick={async () => { try { await saveListing({ ...l, status: "rejected" }); toast("آگهی رد شد", "info"); } catch (e: any) { toast(e?.message || "خطا در رد آگهی", "error"); } }} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-semibold flex items-center gap-1"><X size={14} /> رد</button>
            </>
          }
        />
      ))}
    </div>
  );
}

function AllListingsTab({ listings }: any) {
  if (listings.length === 0) return <EmptyState icon="📭" title="آگهی‌ای موجود نیست" />;
  return (
    <div className="space-y-3">
      {listings.map((l: any) => (
        <AdminListingRow
          key={l.id} listing={l}
          actions={
            <>
              <Link to={{ name: "listing", id: l.id }} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">مشاهده</Link>
              <button onClick={async () => { if (confirm("حذف آگهی؟")) { try { await deleteListing(l.id); toast("حذف شد", "success"); } catch (e: any) { toast(e?.message || "خطا در حذف", "error"); } } }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-semibold flex items-center gap-1"><Trash size={14} /> حذف</button>
            </>
          }
        />
      ))}
    </div>
  );
}

function AdminListingRow({ listing, actions }: any) {
  const primary = listing.images.find((i: any) => i.isPrimary) || listing.images[0];
  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    sold: "bg-blue-100 text-blue-700",
    expired: "bg-slate-100 text-slate-500",
    draft: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex gap-3 items-center">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 grid place-items-center">
        {primary ? <img src={primary.dataUrl} className="w-full h-full object-cover" /> : <span className="text-2xl text-slate-300">📷</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-sm text-slate-800 truncate">{listing.title}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${statusColors[listing.status]}`}>{listing.status}</span>
        </div>
        <div className="text-xs text-slate-500 flex flex-wrap gap-3">
          <span className="text-blue-600 font-bold">{formatPrice(listing.price)}</span>
          <span>{listing.city}</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-1.5">{actions}</div>
    </div>
  );
}

function UsersTab({ users, loading, error }: any) {
  if (loading) return <EmptyState icon="⏳" title="در حال بارگذاری کاربران..." />;
  if (error) return (
    <EmptyState
      icon="⚠️"
      title="خطا در دریافت کاربران"
      description={`${error} — معمولاً یعنی بک‌اند به‌روزرسانی/ری‌استارت نشده، یا حساب شما ادمین نیست. آدرس api/version را باز کنید تا نسخه‌ی بک‌اند را ببینید.`}
    />
  );
  if (users.length === 0) return <EmptyState icon="👥" title="کاربری ثبت نشده است" />;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-right">
            <th className="p-3 font-bold text-slate-700">نام</th>
            <th className="p-3 font-bold text-slate-700">شماره موبایل</th>
            <th className="p-3 font-bold text-slate-700">نقش</th>
            <th className="p-3 font-bold text-slate-700">عضویت</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b border-slate-100 last:border-0">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-bold text-xs">{u.name.charAt(0)}</div>
                  <span className="font-medium">{u.name}</span>
                </div>
              </td>
              <td className="p-3 fa-num text-slate-600">{formatPhone(u.phone)}</td>
              <td className="p-3">
                {u.isAdmin ? <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-semibold">مدیر</span> : <span className="text-xs text-slate-500">کاربر</span>}
              </td>
              <td className="p-3 text-xs text-slate-500">{timeAgo(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesTab() {
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <div>دسته‌بندی‌ها به‌صورت کد تعریف شده‌اند (در فایل <code className="bg-amber-100 px-1 rounded">src/lib/categories.ts</code>). برای ویرایش پویا از طریق پنل، نیاز به اتصال به جدول <code className="bg-amber-100 px-1 rounded">categories</code> در دیتابیس است.</div>
      </div>
      {CATEGORIES.map((c) => (
        <div key={c.slug} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg grid place-items-center text-2xl" style={{ backgroundColor: c.color + "20", color: c.color }}>{c.icon}</div>
            <div>
              <h3 className="font-bold text-slate-800">{c.name}</h3>
              <span className="text-xs text-slate-500">{toFa(c.subs.length)} زیر دسته</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {c.subs.map((s) => (
              <span key={s.slug} className="text-xs px-2.5 py-1 bg-slate-100 rounded-md">{s.icon} {s.name} <span className="text-slate-400">· {toFa(s.fields.length)} فیلد</span></span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-slate-500" size={22} />
        <h3 className="font-bold text-slate-800">تنظیمات سرویس‌ها</h3>
      </div>
      <p className="text-sm text-slate-500 leading-7 mb-4">
        برای فعال‌سازی کامل قابلیت‌ها، فایل <code className="bg-slate-100 px-1 rounded text-xs">.env</code> را در سرور هاست خود تنظیم کنید. صفحه پیکربندی کامل را اینجا مشاهده کنید:
      </p>
      <Link to={{ name: "config" }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
        <Server size={16} /> صفحه پیکربندی بک‌اند
      </Link>
    </div>
  );
}

function Stat({ label, value, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className={`w-12 h-12 rounded-xl grid place-items-center mb-3 ${colors[color]}`}>{icon}</div>
      <div className="text-3xl font-extrabold text-slate-800 fa-num">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
