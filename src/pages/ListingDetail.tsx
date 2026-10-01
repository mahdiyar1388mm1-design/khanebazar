import { useEffect, useRef, useState } from "react";
import { findOrCreateConversation, useListingState, useListingsState, incrementViews, sendMessage, toggleFavorite, useCurrentUser, useFavorites } from "../lib/store";
import { findSubBySlug, getCategory, resolveListingFields } from "../lib/categories";
import { formatPhone, formatPrice, timeAgo, toFa, getListingPriceDetails } from "../lib/format";
import { Camera, Chat, Copy, Eye, Heart, Phone, Pin, Share, X, Calendar, Tag, AlertTriangle } from "../components/Icons";
import { Link } from "../lib/Link";
import { navigate } from "../lib/router";
import { ListingCard } from "../components/ListingCard";
import { ListingDisclaimer } from "../components/Disclaimer";
import { EmptyState } from "../components/EmptyState";
import { toast } from "../components/Toast";
import { copyText } from "../utils/clipboard";
import { MapView } from "../components/MapView";
import { SEOHead } from "../components/SEOHead";

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
            {(() => {
              const { area, totalPrice, pricePerMeter } = getListingPriceDetails(listing);
              return (
                <div className="text-blue-600 font-extrabold text-xl mb-3 flex flex-col gap-1">
                  {listing.categorySlug === "rent" ? (
                    <>
                      <span>رهن: {formatPrice(listing.price)}</span>
                      <span className="text-sm font-bold text-slate-700">اجاره ماهیانه: {Number(listing.fields?.monthly_rent) > 0 ? formatPrice(Number(listing.fields?.monthly_rent)) : "—"}</span>
                    </>
                  ) : listing.priceType === "negotiable" ? (
                    <span>توافقی</span>
                  ) : (
                    <>
                      <span>قیمت کل: {formatPrice(totalPrice, listing.categorySlug === "vehicles")}</span>
                      {area > 0 && pricePerMeter > 0 && (
                        <span className="text-xs text-slate-500 font-normal">
                          قیمت هر متر: {formatPrice(pricePerMeter)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
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

          {/* Specs */}
          {resolvedFields.fields.length > 0 && (
            <Section title="مشخصات">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {resolvedFields.fields.map((field) => {
                  const v = listing.fields[field.key];
                  if (v === undefined || v === "" || v === null) return null;
                  let display: string;
                  if (typeof v === "boolean") display = v ? "دارد" : "ندارد";
                  else if (Array.isArray(v)) display = v.length ? v.join("، ") : "—";
                  else display = String(v);
                  return (
                    <div key={field.key} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">{field.label}</div>
                      <div className="font-semibold text-sm text-slate-800">
                        {display === "—" ? "—" : (typeof v === "number" ? toFa(v.toString()) : display)}
                        {field.unit && typeof v === "number" && <span className="text-xs text-slate-500 mr-1">{field.unit}</span>}
                      </div>
                    </div>
                  );
                })}
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
            {(() => {
              const { area, totalPrice, pricePerMeter } = getListingPriceDetails(listing);
              return (
                <div className="text-blue-600 font-extrabold text-2xl mb-3 flex flex-col gap-1">
                  {listing.categorySlug === "rent" ? (
                    <>
                      <span>رهن: {formatPrice(listing.price)}</span>
                      <span className="text-sm font-bold text-slate-700">اجاره ماهیانه: {Number(listing.fields?.monthly_rent) > 0 ? formatPrice(Number(listing.fields?.monthly_rent)) : "—"}</span>
                    </>
                  ) : listing.priceType === "negotiable" ? (
                    <span>توافقی</span>
                  ) : (
                    <>
                      <span>قیمت کل: {formatPrice(totalPrice, listing.categorySlug === "vehicles")}</span>
                      {area > 0 && pricePerMeter > 0 && (
                        <span className="text-xs text-slate-500 font-normal">
                          قیمت هر متر: {formatPrice(pricePerMeter)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
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

function Section(props: { title: string; children: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 mt-4 p-5">
      <h2 className="font-bold text-slate-800 mb-4">{props.title}</h2>
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
