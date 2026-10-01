import { useEffect, useState } from "react";
import { useCurrentUser, useMyListings, useFavorites, useConversations, useNotifications, deleteListing, saveListing, updateProfile, changePassword } from "../lib/store";
import { navigate } from "../lib/router";
import { Link } from "../lib/Link";
import { ListingCard } from "../components/ListingCard";
import { EmptyState } from "../components/EmptyState";
import { Eye, Plus, Trash, Edit, Chat, Heart, Bell, Sparkles, AlertTriangle, Check, ShieldCheck } from "../components/Icons";
import { formatPrice, formatPhone, timeAgo, toFa, getListingPriceDetails } from "../lib/format";
import { toast } from "../components/Toast";

export function DashboardPage() {
  const user = useCurrentUser();
  const all = useMyListings(user?.id);
  const favs = useFavorites(user?.id);
  const convs = useConversations(user?.id);
  const notifs = useNotifications(user?.id);

  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);
  if (!user) return null;

  const myListings = all.filter((l) => l.userId === user.id);
  const activeCount = myListings.filter((l) => l.status === "active").length;
  const pendingCount = myListings.filter((l) => l.status === "pending").length;
  const totalViews = myListings.reduce((n, l) => n + (l.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl p-5 md:p-7 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 grid place-items-center text-2xl font-bold backdrop-blur">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-lg md:text-xl">سلام {user.name}!</h1>
            <div className="text-xs md:text-sm text-blue-100 fa-num">{formatPhone(user.phone)}</div>
          </div>
          <Link to={{ name: "create" }} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 rounded-lg font-bold text-sm">
            <Plus size={16} /> ثبت آگهی جدید
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Sparkles className="text-emerald-500" size={22} />} label="آگهی‌های فعال" value={toFa(activeCount)} />
        <StatCard icon={<AlertTriangle className="text-amber-500" size={22} />} label="در انتظار تأیید" value={toFa(pendingCount)} />
        <StatCard icon={<Eye className="text-blue-500" size={22} />} label="کل بازدیدها" value={toFa(totalViews)} />
        <StatCard icon={<Heart className="text-red-500" size={22} />} label="علاقه‌مندی‌ها" value={toFa(favs.length)} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <QuickLink to={{ name: "my-listings" }} icon={<Sparkles size={22} />} label="آگهی‌های من" badge={myListings.length} />
        <QuickLink to={{ name: "messages" }} icon={<Chat size={22} />} label="پیام‌ها" badge={convs.length} />
        <QuickLink to={{ name: "favorites" }} icon={<Heart size={22} />} label="علاقه‌مندی‌ها" badge={favs.length} />
        <QuickLink to={{ name: "notifications" }} icon={<Bell size={22} />} label="اعلان‌ها" badge={notifs.filter(n => !n.isRead).length} />
      </div>

      {/* Recent listings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">آگهی‌های اخیر من</h2>
          <Link to={{ name: "my-listings" }} className="text-sm text-blue-600 font-semibold">مشاهده همه ←</Link>
        </div>
        {myListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {myListings.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="هنوز آگهی‌ای ثبت نکرده‌اید"
            description="با ثبت اولین آگهی، کسب‌وکار خود را در سراسر ایران معرفی کنید."
            action={
              <Link to={{ name: "create" }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm">
                <Plus size={16} /> ثبت اولین آگهی
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

function StatCard(props: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-lg bg-slate-50 grid place-items-center">{props.icon}</div>
      <div>
        <div className="text-2xl font-extrabold text-slate-800 fa-num">{props.value}</div>
        <div className="text-xs text-slate-500">{props.label}</div>
      </div>
    </div>
  );
}

function QuickLink(props: { to: any; icon: any; label: string; badge?: number }) {
  return (
    <Link to={props.to} className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">{props.icon}</div>
        <span className="font-semibold text-sm text-slate-800">{props.label}</span>
      </div>
      {!!props.badge && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full fa-num">{toFa(props.badge)}</span>}
    </Link>
  );
}

// ---- My Listings page ----
export function MyListingsPage() {
  const user = useCurrentUser();
  const all = useMyListings(user?.id);

  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);

  if (!user) return null;
  const my = all.filter((l) => l.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  const statusBadge = (s: string) => {
    const map: Record<string, { l: string; c: string }> = {
      active: { l: "فعال", c: "bg-emerald-100 text-emerald-700" },
      pending: { l: "در انتظار تأیید", c: "bg-amber-100 text-amber-700" },
      draft: { l: "پیش‌نویس", c: "bg-slate-100 text-slate-700" },
      expired: { l: "منقضی", c: "bg-slate-100 text-slate-500" },
      sold: { l: "فروخته شده", c: "bg-blue-100 text-blue-700" },
      rejected: { l: "رد شده", c: "bg-red-100 text-red-700" },
    };
    return map[s] || { l: s, c: "bg-slate-100" };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-extrabold text-xl text-slate-800">آگهی‌های من</h1>
        <Link to={{ name: "create" }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5"><Plus size={16} /> ثبت جدید</Link>
      </div>
      {my.length === 0 ? (
        <EmptyState icon="📝" title="آگهی‌ای ندارید" description="هنوز آگهی‌ای ثبت نکرده‌اید." />
      ) : (
        <div className="space-y-3">
          {my.map((l) => {
            const b = statusBadge(l.status);
            const primary = l.images.find((i) => i.isPrimary) || l.images[0];
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 aspect-[4/3] md:aspect-square rounded-lg overflow-hidden bg-slate-100 shrink-0 grid place-items-center">
                  {primary ? <img src={primary.dataUrl} className="w-full h-full object-cover" /> : <span className="text-4xl text-slate-300">📷</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 line-clamp-2">{l.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${b.c}`}>{b.l}</span>
                  </div>
                  {(() => {
                    const { area, totalPrice, pricePerMeter } = getListingPriceDetails(l);
                    return (
                      <div className="text-blue-600 font-bold mb-2 text-sm">
                        {l.priceType === "negotiable" ? (
                          <span>توافقی</span>
                        ) : (
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                            <span>قیمت کل: {formatPrice(totalPrice)}</span>
                            {area > 0 && pricePerMeter > 0 && (
                              <span className="text-xs text-slate-500 font-normal">
                                هر متر: {formatPrice(pricePerMeter)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                    <span>{l.city}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{toFa(l.views || 0)}</span>
                    <span>{timeAgo(l.createdAt)}</span>

                  </div>
                </div>
                <div className="flex md:flex-col gap-1.5 md:w-32 justify-end">
                  <Link to={{ name: "listing", id: l.id }} className="flex-1 md:flex-none px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md text-center font-medium hover:bg-slate-200">
                    مشاهده
                  </Link>
                  {l.status === "expired" && (
                    <button onClick={() => { saveListing({ ...l, status: "active", expiresAt: 0 }); toast("آگهی تمدید شد", "success"); }} className="flex-1 md:flex-none px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-md font-medium">
                      تمدید
                    </button>
                  )}
                  <button onClick={() => { if (confirm("آیا مطمئن هستید؟")) { deleteListing(l.id); toast("آگهی حذف شد", "success"); } }} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md font-medium flex items-center justify-center gap-1 hover:bg-red-100">
                    <Trash size={12} /> حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Settings / Profile ----
export function SettingsPage() {
  const user = useCurrentUser();
  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-extrabold text-xl text-slate-800">تنظیمات حساب</h1>
      <ProfileForm user={user} />
      <PasswordForm />
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <Row label="شماره موبایل" value={formatPhone(user.phone)} />
        <Row label="نقش" value={user.isAdmin ? "مدیر سایت" : "کاربر عادی"} />
        <Row label="عضویت از" value={timeAgo(user.createdAt)} />
        <Row label="وضعیت تأیید" value={user.isVerified ? "تأیید شده" : "تأیید نشده"} />
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: import("../lib/types").User }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || "");
  const [nationalCode, setNationalCode] = useState(user.nationalCode || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = name !== user.name || email !== (user.email || "") || nationalCode !== (user.nationalCode || "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("نام باید حداقل ۲ حرف باشد"); return; }
    setSaving(true); setError("");
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || undefined, nationalCode: nationalCode.trim() || undefined });
      toast("اطلاعات پروفایل به‌روزرسانی شد", "success");
    } catch (err: any) {
      setError(err?.message || "خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <h2 className="font-bold text-slate-800 flex items-center gap-2"><Edit size={16} /> ویرایش پروفایل</h2>
      <Field label="نام">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
      </Field>
      <Field label="ایمیل">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" dir="ltr" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-left" />
      </Field>
      <Field label="کد ملی">
        <input value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} maxLength={10} placeholder="۱۰ رقم" dir="ltr" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-left fa-num" />
      </Field>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button type="submit" disabled={saving || !dirty} className="px-4 py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5">
        <Check size={16} /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next.length < 4) { setError("رمز عبور جدید باید حداقل ۴ کاراکتر باشد"); return; }
    if (next !== confirm) { setError("تکرار رمز عبور مطابقت ندارد"); return; }
    setSaving(true);
    try {
      await changePassword(current, next);
      toast("رمز عبور با موفقیت تغییر کرد", "success");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: any) {
      setError(err?.message || "خطا در تغییر رمز عبور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <h2 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={16} /> تغییر رمز عبور</h2>
      <Field label="رمز عبور فعلی">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} dir="ltr" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
      </Field>
      <Field label="رمز عبور جدید">
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} dir="ltr" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
      </Field>
      <Field label="تکرار رمز عبور جدید">
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} dir="ltr" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
      </Field>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button type="submit" disabled={saving || !current || !next} className="px-4 py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5">
        <Check size={16} /> {saving ? "در حال ذخیره..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
