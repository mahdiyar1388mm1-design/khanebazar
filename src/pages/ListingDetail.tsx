import { useEffect, useRef, useState } from "react";
import { findOrCreateConversation, useListingState, useListingsState, incrementViews, sendMessage, toggleFavorite, useCurrentUser, useFavorites } from "../lib/store";
import { fieldValueIsFilled, findSubBySlug, getCategory, resolveListingFields } from "../lib/categories";
import { formatNumber, formatPhone, formatPrice, timeAgo, toFa, toEn, getListingPriceDetails } from "../lib/format";
import { Camera, Chat, Check, Copy, Eye, Heart, Phone, Pin, Share, X, Calendar, Tag, AlertTriangle } from "../components/Icons";
import type { CategoryField, Listing } from "../lib/types";
import { Link } from "../lib/Link";
import { navigate } from "../lib/router";
import { ListingCard } from "../components/ListingCard";
import { ListingDisclaimer } from "../components/Disclaimer";
import { EmptyState } from "../components/EmptyState";
import { toast } from "../components/Toast";
import { copyText } from "../utils/clipboard";
import { MapView } from "../components/MapView";
import { SEOHead } from "../components/SEOHead";

type DisplayField = { field: CategoryField; value: any };

const HIGHLIGHT_FIELD_PRIORITY = [
  "area", "building_area", "land_area", "rooms", "floor", "brand", "model", "year", "mileage",
  "capacity", "rent_mode", "rent_type", "parking", "elevator", "deed_type", "body_condition",
];

function getListingFieldValues(listing: Pick<Listing, "fields"> | { fields?: any }): Record<string, any> {
  const raw = listing.fields;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" && !Array.isArray(raw) ? raw : {};
}

function cleanFieldLabel(label: string): string {
  return label
    .replace(/\s*[—-]\s*برای.+$/g, "")
    .replace(/\s*\(تومان\)\s*/g, "")
    .trim();
}

function isMoneyField(field: CategoryField): boolean {
  return /(price|rent|deposit)/i.test(field.key) || /تومان/.test(field.label);
}

function isYearField(key: string): boolean {
  return /(^|_)year$/.test(key) || key === "year_built" || key === "delivery_year";
}

function parseNumberish(value: any): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const en = toEn(value).replace(/[\s,٬،]/g, "");
  if (!/^\d+(\.\d+)?$/.test(en)) return null;
  const n = Number(en);
  return Number.isFinite(n) ? n : null;
}

function formatMoneyAmount(value: number): string {
  if (value === 0) return "۰ تومان";
  return formatPrice(value, true);
}

function formatFieldText(field: CategoryField, value: any): string {
  if (typeof value === "boolean") return value ? "دارد" : "ندارد";
  if (Array.isArray(value)) return value.filter(fieldValueIsFilled).map((v) => toFa(String(v))).join("، ");
  const n = parseNumberish(value);
  if (n !== null) {
    if (isMoneyField(field)) return formatMoneyAmount(n);
    const shouldGroup = Math.abs(n) >= 10000 || /(mileage|km|engine_cc)/i.test(field.key);
    const base = isYearField(field.key)
      ? toFa(String(Math.round(n)))
      : shouldGroup
        ? formatNumber(n)
        : toFa(String(n));
    return `${base}${field.unit ? ` ${field.unit}` : ""}`;
  }
  return toFa(String(value));
}

function getFieldIcon(field: CategoryField): string {
  const key = field.key;
  if (/(area|building|land|floor|rooms|bathrooms)/.test(key)) return "🏠";
  if (/(price|rent|deposit)/.test(key)) return "💰";
  if (/(parking|elevator|storage|pool|yard|amenities|utilities|options)/.test(key)) return "✨";
  if (/(brand|model|year|mileage|fuel|transmission|engine|body|doors)/.test(key)) return "🚗";
  if (/(deed|land_use|access|condition|progress|payment)/.test(key)) return "📋";
  if (/(capacity|rules)/.test(key)) return "👥";
  return field.type === "boolean" ? "✓" : "•";
}

function buildDisplayFields(defs: CategoryField[], values: Record<string, any>): DisplayField[] {
  return defs
    .map((field) => ({ field, value: values[field.key] }))
    .filter((item) => fieldValueIsFilled(item.value));
}

function buildHighlightFields(items: DisplayField[]): DisplayField[] {
  const ordered = [...items].sort((a, b) => {
    const ai = HIGHLIGHT_FIELD_PRIORITY.indexOf(a.field.key);
    const bi = HIGHLIGHT_FIELD_PRIORITY.indexOf(b.field.key);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  return ordered.slice(0, 4);
}

function getRentPriceRows(listing: Listing, values: Record<string, any>) {
  const depositValue = fieldValueIsFilled(values.deposit)
    ? values.deposit
    : listing.price > 0 ? listing.price : undefined;
  const candidates = [
    { key: "deposit", label: "رهن / ودیعه", value: depositValue },
    { key: "monthly_rent", label: "اجاره ماهیانه", value: values.monthly_rent },
    { key: "daily_price", label: "اجاره روزانه", value: values.daily_price },
    { key: "weekly_price", label: "اجاره هفتگی", value: values.weekly_price },
    { key: "monthly_price", label: "اجاره ماهیانه", value: values.monthly_price },
  ];
  const rows = candidates
    .map((row) => ({ ...row, amount: parseNumberish(row.value) }))
    .filter((row) => row.amount !== null && fieldValueIsFilled(row.value));
  if (!rows.length && listing.price > 0) rows.push({ key: "price", label: "قیمت", value: listing.price, amount: listing.price });
  return rows;
}

export function ListingDetailPage({ id }: { id: string }) {
  const { listings: all, loading: listLoading } = useListingsState();
  const { listing: fetched, loading: fetching, error: fetchError } = useListingState(id);
  // اگر درخواست تکی آگهی نتیجه نداد، از لیست بارگذاری‌شده استفاده کن
  const fromList = all.find((l) => String(l.id) === String(id));
  const listing = fetched || fromList || null;
  const stillLoading = !listing && (fetching || listLoading);
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const isFav = favorites.includes(id);
  const [activeImage, setActiveImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  // نکته: همه‌ی هوک‌ها باید قبل از بازگشت‌های شرطی پایین باشند، وگرنه تعداد
  // هوک‌ها بین رندر «در حال بارگذاری» و رندر «آگهی آماده» عوض می‌شود.
  const touchX = useRef<number | null>(null);

  useEffect(() => { if (listing) incrementViews(listing.id); }, [id]); // eslint-disable-line

  // در حال بارگذاری
  if (stillLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={{ color: "var(--text-light)" }}>
        در حال بارگذاری آگهی…
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon="❓"
          title="آگهی نمایش داده نشد"
          description={fetchError
            ? `خطا در ارتباط با سرور: ${fetchError} — احتمالاً بک‌اند در دسترس نیست یا ری‌استارت نشده.`
            : "ممکن است این آگهی حذف شده یا هنوز تأیید نشده باشد."}
          action={
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm">تلاش مجدد</button>
              <Link to={{ name: "home" }} className="px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-sm">بازگشت به خانه</Link>
            </div>
          }
        />
      </div>
    );
  }

  const subInfo = findSubBySlug(listing.subSlug);
  // مشخصات آگهی: اگر زیردسته ثبت نشده باشد، تعریف فیلدها از روی کلیدهای خود
  // آگهی استنباط می‌شود تا بخش «مشخصات» خالی نماند.
  const resolvedFields = resolveListingFields(listing);
  const fieldValues = getListingFieldValues(listing);
  const specItems = buildDisplayFields(resolvedFields.fields, fieldValues);
  const highlightItems = buildHighlightFields(specItems);
  const displaySub = subInfo?.sub ?? resolvedFields.sub;
  const breadcrumbCat = subInfo?.cat ?? (listing.categorySlug ? getCategory(listing.categorySlug) : undefined);
  const seller = { id: listing.userId, name: (listing as any).userName || "کاربر", phone: (listing as any).userPhone || "", createdAt: listing.createdAt };
  const similar = all.filter((l) => l.id !== listing.id && l.categorySlug === listing.categorySlug && l.status === "active").slice(0, 4);
  const primaryImg = listing.images[activeImage];

  // رفتن به تصویر مشخص (چرخشی)
  const goToImage = (i: number) => {
    const n = listing.images.length;
    if (!n) return;
    setActiveImage(((i % n) + n) % n);
  };
  const onTouchStart = (e: any) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: any) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) goToImage(activeImage + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  const handleChat = () => {
    if (!user) { toast("ابتدا وارد شوید", "error"); navigate({ name: "login" }); return; }
    if (user.id === listing.userId) { toast("نمی‌توانید با خودتان چت کنید", "error"); return; }
    setChatOpen(true);
  };

  const sendChat = async () => {
    if (!user || !chatMsg.trim()) return;
    try {
      const conv = await findOrCreateConversation(listing.id, listing.userId);
      await sendMessage(conv.id, user.id, chatMsg.trim());
      toast("پیام ارسال شد", "success");
      setChatMsg("");
      setChatOpen(false);
      navigate({ name: "messages", conversationId: conv.id });
    } catch (e: any) {
      toast(e?.message || "خطا در ارسال پیام", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {(() => {
        const loc = [listing.province, listing.city, listing.neighborhood].filter(Boolean).join("، ");
        const descRaw = listing.shortDescription || listing.description || `${listing.categoryName || "آگهی"}${loc ? " در " + loc : ""}`;
        const desc = String(descRaw).replace(/\s+/g, " ").trim().slice(0, 160);
        const canonical = `https://khane-bazar-118.ir/listing/${listing.id}`;
        const firstImg = listing.images[0]?.dataUrl || "";
        const ogImage = /^https?:\/\//.test(firstImg) ? firstImg : "https://khane-bazar-118.ir/images/logo.png";
        const isRealEstate = listing.categorySlug === "real-estate" || listing.categorySlug === "rent";
        return (
          <SEOHead
            title={listing.title}
            description={desc}
            canonical={canonical}
            image={ogImage}
            type="product"
            jsonLd={{
              "@context": "https://schema.org",
              "@type": isRealEstate ? "RealEstateListing" : "Product",
              name: listing.title,
              description: desc,
              image: ogImage,
              url: canonical,
              offers: {
                "@type": "Offer",
                price: Number(listing.price) || 0,
                priceCurrency: "IRR",
                availability: "https://schema.org/InStock",
                url: canonical,
                areaServed: listing.city || undefined,
              },
            }}
            breadcrumbs={[
              { name: "خانه", url: "https://khane-bazar-118.ir/" },
              ...(listing.categoryName ? [{ name: listing.categoryName, url: `https://khane-bazar-118.ir/category/${listing.categorySlug}` }] : []),
              { name: listing.title, url: canonical },
            ]}
          />
        );
      })()}
      {/* Breadcrumbs */}
      <div className="mb-4 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
        <Link to={{ name: "home" }} className="hover:text-blue-600">خانه</Link>
        <span>/</span>
        {displaySub && breadcrumbCat && (
          <>
            <Link to={{ name: "category", slug: breadcrumbCat.slug }} className="hover:text-blue-600">{breadcrumbCat.name}</Link>
            <span>/</span>
            <span className="text-slate-700">{displaySub.name}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
        <div>
          {/* Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="relative aspect-[16/10] bg-slate-100"
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {listing.images.length > 0 ? (
                <>
                  {/* فقط تصویر فعال نمایش داده می‌شود (مطمئن و بدون خطای اسکرول) */}
                  <img
                    key={primaryImg?.id || activeImage}
                    src={primaryImg?.dataUrl}
                    alt={`${listing.title} ${toFa(activeImage + 1)}`}
                    onClick={() => setLightbox(true)}
                    className="w-full h-full object-cover cursor-zoom-in select-none"
                    draggable={false}
                  />

                  {listing.images.length > 1 && (
                    <>
                      {/* فلش‌ها */}
                      <button
                        onClick={() => goToImage(activeImage - 1)}
                        aria-label="عکس قبلی"
                        className="absolute top-1/2 -translate-y-1/2 right-2 w-9 h-9 rounded-full grid place-items-center text-xl font-bold shadow-md"
                        style={{ background: "rgba(255,255,255,.9)", color: "var(--royal-blue)" }}
                      >‹</button>
                      <button
                        onClick={() => goToImage(activeImage + 1)}
                        aria-label="عکس بعدی"
                        className="absolute top-1/2 -translate-y-1/2 left-2 w-9 h-9 rounded-full grid place-items-center text-xl font-bold shadow-md"
                        style={{ background: "rgba(255,255,255,.9)", color: "var(--royal-blue)" }}
                      >›</button>

                      {/* شماره‌ی عکس */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(15,26,46,.6)", color: "white" }}>
                        {toFa(activeImage + 1)} / {toFa(listing.images.length)}
                      </div>

                      {/* نقطه‌ها */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                        {listing.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => goToImage(i)}
                            aria-label={`عکس ${toFa(i + 1)}`}
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: i === activeImage ? 18 : 8,
                              background: i === activeImage ? "var(--gold)" : "rgba(255,255,255,.7)",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full grid place-items-center text-7xl text-slate-300">{displaySub?.icon ?? <Camera size={48} />}</div>
              )}
              {/* Badges */}

            </div>
            {listing.images.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto thin-scroll">
                {listing.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => goToImage(i)}
                    className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${i === activeImage ? "border-blue-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + price (mobile) */}
          <div className="md:hidden bg-white rounded-2xl border border-slate-200 mt-4 p-4">
            <h1 className="font-extrabold text-lg text-slate-800 mb-2 leading-7">{listing.title}</h1>
            <PriceBlock listing={listing} values={fieldValues} compact />
            <Meta listing={listing} />
          </div>

          {/* Contact (mobile) — bring phone + in-app chat to the top */}
          <div className="md:hidden bg-white rounded-2xl border border-slate-200 mt-4 p-4 space-y-2">
            <button
              onClick={() => setShowPhone(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm"
            >
              <Phone size={16} /> {showPhone ? formatPhone(seller?.phone ?? "") : "نمایش شماره تماس"}
            </button>
            <button
              onClick={handleChat}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "var(--royal-blue)", color: "white" }}
            >
              <Chat size={16} /> چت درون‌برنامه‌ای با فروشنده
            </button>
          </div>

          {/* Key highlights */}
          {highlightItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {highlightItems.map(({ field, value }) => (
                <div key={field.key} className="relative overflow-hidden rounded-2xl border border-[var(--stone-light)] bg-[var(--card-bg)] p-3 shadow-sm">
                  <div className="absolute -left-5 -top-6 w-16 h-16 rounded-full bg-[var(--gold)]/10" />
                  <div className="relative flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl grid place-items-center text-lg bg-[var(--cream-dark)] border border-[var(--stone-light)]">{getFieldIcon(field)}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[var(--text-light)] truncate">{cleanFieldLabel(field.label)}</div>
                      <div className="text-sm font-extrabold text-[var(--royal-blue)] truncate">{formatFieldText(field, value)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Specs */}
          {specItems.length > 0 && (
            <Section title={`مشخصات کامل (${toFa(specItems.length)} مورد)`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {specItems.map(({ field, value }) => (
                  <SpecCard key={field.key} field={field} value={value} />
                ))}
              </div>
            </Section>
          )}

          {/* Description */}
          <Section title="توضیحات">
            <p className="text-sm text-slate-700 leading-8 whitespace-pre-line">
              {listing.shortDescription}
              {listing.description && "\n\n" + listing.description}
            </p>
          </Section>

          {/* Map + Address */}
          <Section title="آدرس و موقعیت روی نقشه">
            <div className="text-sm text-slate-700 p-3 bg-stone-50 rounded-lg flex items-start gap-2 mb-3">
              <Pin size={16} className="shrink-0 mt-0.5" />
              <span>
                {listing.province} — {listing.city}{listing.neighborhood ? ` — ${listing.neighborhood}` : ""}
                {listing.address && <> — {listing.address}</>}
              </span>
            </div>
            {listing.lat && listing.lng ? (
              <MapView
                className="w-full rounded-xl"
                height="350px"
                center={[listing.lat, listing.lng]}
                zoom={15}
                markers={[{ lat: listing.lat, lng: listing.lng, popup: listing.title, color: "#C8A951" }]}
                interactive={true}
              />
            ) : (
              <div className="text-xs text-slate-400 text-center py-2">
                موقعیت دقیق روی نقشه توسط آگهی‌دهنده ثبت نشده است.
              </div>
            )}
          </Section>

          {/* Similar */}
          {similar.length > 0 && (
            <Section title="آگهی‌های مشابه">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {similar.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 p-5">
            <h1 className="font-extrabold text-lg text-slate-800 mb-2 leading-7">{listing.title}</h1>
            <PriceBlock listing={listing} values={fieldValues} />
            <Meta listing={listing} />
          </div>

          {/* Seller info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-bold text-lg">
                {seller?.name?.charAt(0) ?? "؟"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-800 truncate">{seller?.name ?? "کاربر"}</div>
                <div className="text-xs text-slate-500">عضویت از {timeAgo(seller?.createdAt ?? listing.createdAt)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowPhone(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm"
              >
                <Phone size={16} /> {showPhone ? formatPhone(seller?.phone ?? "") : "نمایش شماره تماس"}
              </button>
              {showPhone && (
                <button
                  onClick={() => { copyText(seller?.phone ?? "").then(() => toast("شماره کپی شد", "success")); }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs"
                >
                  <Copy size={14} /> کپی شماره
                </button>
              )}
              <button
                onClick={handleChat}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm"
              >
                <Chat size={16} /> چت با فروشنده
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (!user) { navigate({ name: "login" }); return; }
                    toggleFavorite(listing.id);
                    toast(isFav ? "حذف شد" : "افزوده شد", "success");
                  }}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium ${isFav ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}
                >
                  <Heart size={16} filled={isFav} /> {isFav ? "ذخیره شد" : "ذخیره"}
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) navigator.share({ title: listing.title, url });
                    else { copyText(url).then(() => toast("لینک کپی شد", "success")); }
                  }}
                  className="py-2.5 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5 text-sm font-medium"
                >
                  <Share size={16} /> اشتراک‌گذاری
                </button>
              </div>
            </div>
          </div>

          <button className="w-full text-xs text-slate-500 hover:text-red-600 py-2 flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} /> گزارش تخلف
          </button>
        </aside>
      </div>

      <ListingDisclaimer />

      {/* Lightbox */}
      {lightbox && primaryImg && (
        <div className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 left-4 text-white p-2"><X size={28} /></button>
          <img src={primaryImg.dataUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Chat modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setChatOpen(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3 text-slate-800">پیام به فروشنده</h3>
            <textarea
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="سلام، آیا این آگهی هنوز فعال است؟"
              className="w-full h-32 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setChatOpen(false)} className="flex-1 py-2.5 bg-slate-100 rounded-lg text-sm font-medium">انصراف</button>
              <button onClick={sendChat} disabled={!chatMsg.trim()} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">ارسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceBlock({ listing, values, compact = false }: { listing: Listing; values: Record<string, any>; compact?: boolean }) {
  if (listing.categorySlug === "rent") {
    const rows = getRentPriceRows(listing, values);
    return (
      <div className={`${compact ? "mb-3" : "mb-4"} space-y-2`}>
        {rows.length ? rows.map((row) => (
          <div key={row.key} className="rounded-2xl border border-[var(--stone-light)] bg-gradient-to-l from-[var(--cream)] to-white p-3">
            <div className="text-[11px] font-semibold text-[var(--text-light)] mb-1">{row.label}</div>
            <div className={`${compact ? "text-lg" : "text-xl"} font-extrabold text-[var(--gold-dark)] fa-num`}>
              {formatMoneyAmount(row.amount ?? 0)}
            </div>
          </div>
        )) : (
          <div className={`${compact ? "text-lg" : "text-2xl"} font-extrabold text-[var(--gold-dark)] mb-3`}>توافقی</div>
        )}
      </div>
    );
  }

  const { area, totalPrice, pricePerMeter } = getListingPriceDetails(listing);
  return (
    <div className={`${compact ? "text-xl" : "text-2xl"} mb-3 flex flex-col gap-1 text-[var(--gold-dark)] font-extrabold`}>
      {listing.priceType === "negotiable" ? (
        <span>توافقی</span>
      ) : (
        <>
          <span>قیمت کل: {formatPrice(totalPrice, listing.categorySlug === "vehicles")}</span>
          {area > 0 && pricePerMeter > 0 && (
            <span className="text-xs text-[var(--text-light)] font-normal">
              قیمت هر متر: {formatPrice(pricePerMeter)}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function SpecCard({ field, value }: DisplayField) {
  const isBool = typeof value === "boolean";
  const isList = Array.isArray(value);
  const listValues = isList ? value.filter(fieldValueIsFilled) : [];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--stone-light)] bg-gradient-to-br from-white to-[var(--cream)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:shadow-md">
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-[var(--gold)]/10 transition group-hover:bg-[var(--gold)]/15" />
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-2xl grid place-items-center text-lg bg-[var(--cream-dark)] border border-[var(--stone-light)]">
          {getFieldIcon(field)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-[var(--text-light)] mb-1">{cleanFieldLabel(field.label)}</div>
          {isBool ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold ${value ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {value ? <Check size={13} /> : <X size={13} />}
              {value ? "دارد" : "ندارد"}
            </span>
          ) : isList ? (
            <div className="flex flex-wrap gap-1.5">
              {listValues.map((item: any) => (
                <span key={String(item)} className="px-2.5 py-1 rounded-full bg-white/80 border border-[var(--stone-light)] text-xs font-bold text-[var(--royal-blue)]">
                  {toFa(String(item))}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm md:text-[15px] font-extrabold leading-7 text-[var(--royal-blue)] break-words fa-num">
              {formatFieldText(field, value)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section(props: { title: string; children: any }) {
  return (
    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--stone-light)] mt-4 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-7 rounded-full bg-[var(--gold)]" />
        <h2 className="font-extrabold text-[var(--royal-blue)]">{props.title}</h2>
      </div>
      {props.children}
    </div>
  );
}

function Meta({ listing }: { listing: any }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-500"><Pin size={14} /> {listing.province} — {listing.city}{listing.neighborhood ? ` — ${listing.neighborhood}` : ""}</div>
      <div className="flex items-center gap-1.5 text-slate-500"><Calendar size={14} /> {timeAgo(listing.createdAt)}</div>
      <div className="flex items-center gap-1.5 text-slate-500"><Eye size={14} /> {toFa(listing.views || 0)} بازدید</div>
      <div className="flex items-center gap-1.5 text-slate-500"><Tag size={14} /> {listing.priceType === "negotiable" ? "توافقی" : listing.priceType === "per_meter" ? "متری" : "ثابت"}</div>
    </div>
  );
}
