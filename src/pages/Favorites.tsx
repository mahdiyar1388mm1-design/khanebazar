import { useEffect } from "react";
import { useCurrentUser, useFavorites, useListings, useNotifications } from "../lib/store";
import { navigate } from "../lib/router";
import { Link } from "../lib/Link";
import { ListingCard } from "../components/ListingCard";
import { EmptyState } from "../components/EmptyState";
import { Bell, Search } from "../components/Icons";
import { timeAgo, toFa } from "../lib/format";

export function FavoritesPage() {
  const user = useCurrentUser();
  const favs = useFavorites(user?.id);
  const all = useListings();

  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);
  if (!user) return null;

  const list = all.filter((l) => favs.includes(l.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="font-extrabold text-xl text-slate-800">علاقه‌مندی‌های من</h1>
        <p className="text-sm text-slate-500 mt-1">{toFa(list.length)} آگهی ذخیره شده</p>
      </div>
      {list.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {list.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <EmptyState
          icon="❤️"
          title="هنوز آگهی‌ای ذخیره نکرده‌اید"
          description="با کلیک روی آیکون قلب در هر آگهی، می‌توانید آن را به علاقه‌مندی‌های خود اضافه کنید."
          action={
            <Link to={{ name: "search" }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm">
              <Search size={16} /> جستجوی آگهی
            </Link>
          }
        />
      )}
    </div>
  );
}

export function NotificationsPage() {
  const user = useCurrentUser();
  const notifs = useNotifications(user?.id);
  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-xl text-slate-800 mb-5">اعلان‌ها</h1>
      {notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="اعلان جدیدی ندارید"
          description="اعلان‌های مربوط به آگهی‌ها، پیام‌ها و یادآوری‌ها در این بخش نمایش داده می‌شود."
        />
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className={`bg-white border rounded-xl p-4 flex gap-3 ${n.isRead ? "border-slate-200" : "border-blue-200 bg-blue-50/40"}`}>
              <div className={`w-9 h-9 shrink-0 rounded-full grid place-items-center ${n.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"}`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-800">{n.title}</div>
                <div className="text-xs text-slate-600 mt-1 leading-6">{n.body}</div>
                <div className="text-[10px] text-slate-400 mt-1.5">{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
