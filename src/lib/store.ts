/**
 * خانه بازار — Store
 * ثبت‌نام، ورود و آگهی‌ها از طریق API بک‌اند انجام می‌شود.
 * پیام‌ها، علاقه‌مندی‌ها و نوتیفیکیشن‌ها هم از API خوانده می‌شوند.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import type { User, Listing, Conversation, Message, Notification } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.khane-bazar-118.ir";

const KEYS = {
  USER: "kb_user",
  TOKEN: "kb_token",
};

// ---- Storage helpers ----
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("kb:store", { detail: { key } }));
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("kb:store", handler);
  window.addEventListener("storage", handler);
  return () => { window.removeEventListener("kb:store", handler); window.removeEventListener("storage", handler); };
}

// ---- API helper ----
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(KEYS.TOKEN);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.");
  }
  const raw = await res.text();
  let data: any = {};
  try { data = raw ? JSON.parse(raw) : {}; }
  catch {
    // پاسخ سرور JSON نبود (مثلاً خطای ۴۱۳ حجم زیاد یا صفحه‌ی خطای پروکسی)
    if (res.status === 413) throw new Error("حجم فایل‌های ارسالی بیش از حد مجاز است. تعداد یا حجم تصاویر را کم کنید.");
    throw new Error(`پاسخ نامعتبر از سرور (کد ${res.status})`);
  }
  if (!res.ok) {
    // اگر توکن نامعتبر/منقضی شده باشد، کاربر را با یک پیام واضح به صفحه‌ی ورود می‌بریم
    // تا با یک توکن خراب گیر نکند و همه‌ی درخواست‌های بعدی هم شکست نخورند.
    if (res.status === 401 && token) {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.USER);
      window.dispatchEvent(new CustomEvent("kb:store", { detail: { key: KEYS.USER } }));
      window.dispatchEvent(new CustomEvent("kb:session-expired"));
      throw new Error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
    }
    throw new Error(data.error || `خطا ${res.status}`);
  }
  return data as T;
}

// ---- Selected city (city gate) ----
// mode="all" یعنی کل کشور، mode="city" یعنی فقط شهر انتخاب‌شده
export type CityPref = { mode: "all" | "city"; province?: string; city?: string };

export function getSelectedCity(): CityPref | null {
  return read<CityPref | null>("kb_city", null);
}

export function setSelectedCity(pref: CityPref) {
  write("kb_city", pref);
}

export function useSelectedCity(): CityPref | null {
  const snap = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("kb_city") || "",
    () => ""
  );
  if (!snap) return null;
  try { return JSON.parse(snap) as CityPref; } catch { return null; }
}

// ---- User / Auth ----
export function useCurrentUser(): User | null {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.USER) || "",
    () => ""
  );
  if (!snapshot) return null;
  try { return JSON.parse(snapshot) as User; } catch { return null; }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    write(KEYS.USER, user);
  } else {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.TOKEN);
    window.dispatchEvent(new CustomEvent("kb:store", { detail: { key: KEYS.USER } }));
  }
}

// پاسخ سرور (serializeUser در backend) را به شکل User فرانت‌اند تبدیل می‌کند
function fromServerUser(u: any): User {
  return {
    id: String(u.id), phone: u.phone, name: u.name,
    email: u.email || undefined, nationalCode: u.nationalCode || undefined, avatar: u.avatar || undefined,
    isAdmin: !!u.isAdmin, isVerified: !!u.isVerified,
    createdAt: u.createdAt || Date.now(),
  };
}

export async function registerUser(phone: string, password: string, name: string, nationalCode?: string): Promise<User> {
  const data = await apiFetch<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, password, name, nationalCode }),
  });
  if (data.token) localStorage.setItem(KEYS.TOKEN, data.token);
  const user = fromServerUser(data.user);
  setCurrentUser(user);
  return user;
}

export async function loginUser(phone: string, password: string): Promise<User> {
  const data = await apiFetch<any>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
  if (data.token) localStorage.setItem(KEYS.TOKEN, data.token);
  const user = fromServerUser(data.user);
  setCurrentUser(user);
  return user;
}

// ویرایش نام/ایمیل/کد ملی پروفایل — کاربر لوکال را هم با پاسخ سرور به‌روز می‌کند
export async function updateProfile(payload: { name: string; email?: string; nationalCode?: string }): Promise<User> {
  const data = await apiFetch<any>("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const user = fromServerUser(data.user);
  setCurrentUser(user);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch("/api/user/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function loginOrRegister(phone: string, name?: string): User {
  const user: User = { id: cryptoId(), phone, name: name||phone, isAdmin: false, isVerified: true, createdAt: Date.now() };
  setCurrentUser(user);
  return user;
}

export function useAllUsersState(enabled: boolean = true): { users: User[]; loading: boolean; error: string } {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let alive = true;
    const load = () => {
      setLoading(true); setError("");
      apiFetch<any>("/api/admin/users")
        .then(d => { if (alive) setUsers(d.data || []); })
        .catch(e => { console.error("useAllUsers failed:", e); if (alive) setError(e?.message || "خطا در دریافت کاربران"); })
        .finally(() => { if (alive) setLoading(false); });
    };
    load();
    const onChange = () => load();
    window.addEventListener("kb:data-changed", onChange);
    return () => { alive = false; window.removeEventListener("kb:data-changed", onChange); };
  }, [enabled]);
  return { users, loading, error };
}

export function useAllUsers(enabled: boolean = true): User[] {
  return useAllUsersState(enabled).users;
}

// ---- Listings ----
// کش ساده برای نمایش فوری هنگام برگشتن به صفحه (stale-while-revalidate)
const listCache = new Map<string, Listing[]>();

// بعد از هر عملیات (تأیید/حذف/ثبت) لیست‌ها و کاربران دوباره از سرور خوانده می‌شوند
function bumpData() {
  listCache.clear();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kb:data-changed"));
}

// status="active" برای صفحه اصلی، status="all" برای پنل ادمین
// خروجی شامل loading است تا بتوان اسکلت لودینگ نمایش داد
export function useListingsState(status: string = "active"): { listings: Listing[]; loading: boolean } {
  const key = `list:${status}`;
  const [listings, setListings] = useState<Listing[]>(() => listCache.get(key) || []);
  const [loading, setLoading] = useState<boolean>(() => !listCache.has(key));
  useEffect(() => {
    let alive = true;
    const load = () => {
      apiFetch<any>(`/api/listings?status=${encodeURIComponent(status)}&limit=500`)
        .then(d => { const data = d.data || []; listCache.set(key, data); if (alive) setListings(data); })
        .catch(e => console.error("useListings failed:", e))
        .finally(() => { if (alive) setLoading(false); });
    };
    if (!listCache.has(key)) setLoading(true);
    load();
    const onChange = () => load();
    window.addEventListener("kb:data-changed", onChange);
    return () => { alive = false; window.removeEventListener("kb:data-changed", onChange); };
  }, [status]);
  return { listings, loading };
}

export function useListings(status: string = "active"): Listing[] {
  return useListingsState(status).listings;
}

// آگهی‌های خودِ کاربر (شامل pending و draft) برای داشبورد
export function useMyListings(userId: string | undefined): Listing[] {
  const [listings, setListings] = useState<Listing[]>([]);
  useEffect(() => {
    if (!userId) { setListings([]); return; }
    let alive = true;
    const load = () => {
      apiFetch<any>("/api/listings/my")
        .then(d => { if (alive) setListings(d.data || []); })
        .catch(e => console.error("useMyListings failed:", e));
    };
    load();
    const onChange = () => load();
    window.addEventListener("kb:data-changed", onChange);
    return () => { alive = false; window.removeEventListener("kb:data-changed", onChange); };
  }, [userId]);
  return listings;
}

// یک آگهی خاص را از API می‌گیرد، همراه با وضعیت loading و خطا
export function useListingState(id: string | undefined): { listing: Listing | null; loading: boolean; error: string } {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    if (!id) { setListing(null); setLoading(false); return; }
    let alive = true;
    setLoading(true); setError(""); setListing(null);
    apiFetch<any>(`/api/listings/${id}`)
      .then(d => { if (alive) setListing(d || null); })
      .catch(e => { console.error("useListing failed:", e); if (alive) { setError(e?.message || "خطا در دریافت آگهی"); setListing(null); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);
  return { listing, loading, error };
}

export function useListing(id: string | undefined): Listing | null | undefined {
  const { listing, loading } = useListingState(id);
  return loading ? undefined : listing;
}

export async function saveListing(listing: Listing): Promise<void> {
  if (listing.id && !listing.id.includes("-")) {
    // existing listing with numeric id — update
    await apiFetch(`/api/listings/${listing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: listing.title,
        shortDescription: listing.shortDescription,
        description: listing.description,
        price: listing.price,
        priceType: listing.priceType,
        status: listing.status,
        fields: listing.fields,
      }),
    });
  } else {
    // new listing
    await apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify({
        title: listing.title,
        shortDescription: listing.shortDescription,
        description: listing.description,
        price: listing.price,
        priceType: listing.priceType,
        categorySlug: listing.categorySlug,
        subSlug: listing.subSlug,
        province: listing.province,
        city: listing.city,
        neighborhood: listing.neighborhood,
        address: listing.address,
        lat: listing.lat,
        lng: listing.lng,
        fields: listing.fields,
        images: listing.images,
        status: listing.status,
      }),
    });
  }
  bumpData();
}

export async function deleteListing(id: string): Promise<void> {
  await apiFetch(`/api/listings/${id}`, { method: "DELETE" });
  bumpData();
}

export function incrementViews(_id: string) {}

// ---- Favorites ----
export function useFavorites(userId: string | undefined): string[] {
  const [favIds, setFavIds] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const load = () => apiFetch<any>("/api/favorites").then(d => { if (alive) setFavIds((d.data || []).map((l: any) => String(l.id))); }).catch(() => {});
    load();
    const h = () => load();
    window.addEventListener("kb:favorites-changed", h);
    return () => { alive = false; window.removeEventListener("kb:favorites-changed", h); };
  }, [userId]);
  return favIds;
}

export async function toggleFavorite(listingId: string): Promise<void> {
  await apiFetch("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ listingId }),
  });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kb:favorites-changed"));
}

// ---- Conversations ----
export function useConversations(userId: string | undefined): Conversation[] {
  const [convs, setConvs] = useState<Conversation[]>([]);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const load = () => apiFetch<any>("/api/conversations").then(d => {
      if (!alive) return;
      setConvs((d.data||[]).map((c: any) => ({
        id: String(c.id), listingId: String(c.listing_id),
        listingTitle: c.listing_title || "آگهی حذف شده",
        buyerId: String(c.buyer_id), buyerName: c.buyer_name || "کاربر",
        sellerId: String(c.seller_id), sellerName: c.seller_name || "کاربر",
        lastMessageAt: c.last_message_at ? new Date(c.last_message_at).getTime() : Date.now(),
      })));
    }).catch(() => {});
    load();
    const h = () => load();
    window.addEventListener("kb:messages-changed", h);
    return () => { alive = false; window.removeEventListener("kb:messages-changed", h); };
  }, [userId]);
  return convs;
}

export async function findOrCreateConversation(listingId: string, sellerId: string): Promise<{ id: string }> {
  const data = await apiFetch<any>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ listingId, sellerId }),
  });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kb:messages-changed"));
  return { id: String(data.id) };
}

export function useMessages(conversationId: string | null): Message[] {
  const [msgs, setMsgs] = useState<Message[]>([]);
  useEffect(() => {
    if (!conversationId) return;
    let alive = true;
    const load = () => apiFetch<any>(`/api/conversations/${conversationId}/messages`).then(d => {
      if (!alive) return;
      setMsgs((d.data||[]).map((m: any) => ({
        id: String(m.id), conversationId: String(m.conversation_id),
        senderId: String(m.sender_id), text: m.message,
        isRead: !!m.is_read, createdAt: new Date(m.created_at).getTime(),
      })));
    }).catch(() => {});
    load();
    const h = () => load();
    window.addEventListener("kb:messages-changed", h);
    return () => { alive = false; window.removeEventListener("kb:messages-changed", h); };
  }, [conversationId]);
  return msgs;
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
  const data = await apiFetch<any>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message: text }),
  });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kb:messages-changed"));
  return { id: String(data.id), conversationId, senderId, text, isRead: false, createdAt: Date.now() };
}

// ---- Notifications ----
export function useNotifications(userId: string | undefined): Notification[] {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  useEffect(() => {
    if (!userId) return;
    apiFetch<any>("/api/notifications").then(d => {
      setNotifs((d.data||[]).map((n: any) => ({
        id: String(n.id), userId: String(n.user_id), type: n.type||"system",
        title: n.title, body: n.body||"", isRead: !!n.is_read,
        createdAt: new Date(n.created_at).getTime(),
      })));
    }).catch(() => {});
  }, [userId]);
  return notifs;
}

export function pushNotification(_n: Omit<Notification, "id"|"createdAt"|"isRead">) {}

// ---- Helpers ----
export function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useLocalCount<T>(key: string, fallback: T) {
  const [v, set] = useState<T>(() => read<T>(key, fallback));
  useEffect(() => {
    const handler = () => set(read<T>(key, fallback));
    window.addEventListener("kb:store", handler);
    return () => window.removeEventListener("kb:store", handler);
  }, [key, fallback]);
  return v;
}
