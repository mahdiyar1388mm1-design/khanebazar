import type { Listing } from "../lib/types";
import { Link } from "../lib/Link";
import { fieldValueIsFilled, findSubBySlug } from "../lib/categories";
import { formatNumber, formatPrice, timeAgo, toEn, toFa, getListingPriceDetails } from "../lib/format";
import { Eye, Heart, Pin } from "./Icons";
import { toggleFavorite, useCurrentUser, useFavorites } from "../lib/store";
import { toast } from "./Toast";
import { navigate } from "../lib/router";

function getFields(listing: Listing): Record<string, any> {
  const raw: any = listing.fields;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  }
  return typeof raw === "object" && !Array.isArray(raw) ? raw : {};
}

function parseNumberish(value: any): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const en = toEn(value).replace(/[\s,٬،]/g, "");
  if (!/^\d+(\.\d+)?$/.test(en)) return null;
  const n = Number(en);
  return Number.isFinite(n) ? n : null;
}

function formatMoneyShort(value: number): string {
  return value === 0 ? "۰ تومان" : formatPrice(value);
}

function getRentRows(listing: Listing, fields: Record<string, any>) {
  const depositValue = fieldValueIsFilled(fields.deposit)
    ? fields.deposit
    : listing.price > 0 ? listing.price : undefined;
  return [
    { key: "deposit", label: "رهن", value: depositValue },
    { key: "monthly_rent", label: "اجاره", value: fields.monthly_rent },
    { key: "daily_price", label: "روزانه", value: fields.daily_price },
    { key: "weekly_price", label: "هفتگی", value: fields.weekly_price },
    { key: "monthly_price", label: "ماهیانه", value: fields.monthly_price },
  ]
    .map((row) => ({ ...row, amount: parseNumberish(row.value) }))
    .filter((row) => row.amount !== null && fieldValueIsFilled(row.value));
}

function getCardFacts(fields: Record<string, any>) {
  const candidates = [
    { key: "area", suffix: "متر" },
    { key: "building_area", suffix: "متر بنا" },
    { key: "land_area", suffix: "متر زمین" },
    { key: "rooms", suffix: "خواب" },
    { key: "floor", prefix: "طبقه" },
    { key: "brand" },
    { key: "model" },
    { key: "year" },
    { key: "mileage", suffix: "کیلومتر" },
    { key: "capacity", suffix: "نفر" },
  ];
  return candidates
    .filter((c) => fieldValueIsFilled(fields[c.key]))
    .slice(0, 3)
    .map((c) => {
      const raw = fields[c.key];
      const n = parseNumberish(raw);
      const value = n !== null
        ? (c.key === "year" ? toFa(String(Math.round(n))) : (n >= 10000 ? formatNumber(n) : toFa(String(n))))
        : toFa(String(raw));
      const suffix = c.key === "rooms" && String(raw) === "استودیو" ? "" : c.suffix;
      return `${c.prefix ? c.prefix + " " : ""}${value}${suffix ? " " + suffix : ""}`;
    });
}

export function ListingCard({ listing }: { listing: Listing }) {
  const sub = findSubBySlug(listing.subSlug);
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const isFav = favorites.includes(listing.id);
  const primary = listing.images.find((i) => i.isPrimary) || listing.images[0];
  const fields = getFields(listing);
  const facts = getCardFacts(fields);

  return (
    <Link
      to={{ name: "listing", id: listing.id }}
      className="group card-achaemenid overflow-hidden flex flex-col transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: "var(--cream-dark)" }}>
        {primary ? (
          <img src={primary.dataUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
        ) : (
          <div className="w-full h-full grid place-items-center text-5xl" style={{ color: "var(--stone)" }}>
            {sub?.sub.icon ?? "📷"}
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            if (!user) { toast("ابتدا وارد شوید", "error"); navigate({ name: "login" }); return; }
            toggleFavorite(listing.id);
            toast(isFav ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد", "success");
          }}
          className={`absolute top-2 left-2 w-8 h-8 rounded-full grid place-items-center backdrop-blur transition
            ${isFav ? "text-white" : "bg-white/90 hover:bg-white"}`}
          style={isFav ? { backgroundColor: "var(--burgundy)" } : { color: "var(--text-medium)" }}
        >
          <Heart size={16} filled={isFav} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 leading-6 mb-2 min-h-[3rem]" style={{ color: "var(--text-dark)" }}>
          {listing.title}
        </h3>

        {facts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {facts.map((fact) => (
              <span key={fact} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--cream-dark)] text-[var(--royal-blue)] border border-[var(--stone-light)] fa-num">
                {fact}
              </span>
            ))}
          </div>
        )}

        {(() => {
          const { area, totalPrice, pricePerMeter } = getListingPriceDetails(listing);
          const isRent = listing.categorySlug === "rent";
          const rentRows = isRent ? getRentRows(listing, fields).slice(0, 2) : [];
          return (
            <div className="font-bold text-sm mb-3 flex flex-col justify-center min-h-[2.25rem]" style={{ color: "var(--gold-dark)" }}>
              {isRent ? (
                rentRows.length ? (
                  rentRows.map((row, i) => (
                    <span key={row.key} className={i > 0 ? "text-[11px] font-normal mt-0.5" : ""} style={i > 0 ? { color: "var(--text-medium)" } : undefined}>
                      {row.label}: {formatMoneyShort(row.amount ?? 0)}
                    </span>
                  ))
                ) : <span>توافقی</span>
              ) : listing.priceType === "negotiable" ? (
                <span>توافقی</span>
              ) : (
                <>
                  <span>{formatPrice(totalPrice, listing.categorySlug === "vehicles")}</span>
                  {area > 0 && pricePerMeter > 0 && (
                    <span className="text-[10px] font-normal mt-0.5" style={{ color: "var(--text-light)" }}>
                      هر متر: {formatPrice(pricePerMeter)}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })()}

        <div className="mt-auto flex items-center justify-between text-[11px] pt-2" style={{ color: "var(--text-light)", borderTop: "1px solid var(--stone-light)" }}>
          <div className="flex items-center gap-1 truncate">
            <Pin size={12} />
            <span className="truncate">{listing.neighborhood ? `${listing.city}، ${listing.neighborhood}` : listing.city}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1">
              <Eye size={12} /> {toFa(listing.views || 0)}
            </span>
            <span>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
