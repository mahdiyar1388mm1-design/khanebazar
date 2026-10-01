import type { Listing } from "../lib/types";
import { Link } from "../lib/Link";
import { findSubBySlug } from "../lib/categories";
import { formatPrice, timeAgo, toFa, getListingPriceDetails } from "../lib/format";
import { Eye, Heart, Pin } from "./Icons";
import { toggleFavorite, useCurrentUser, useFavorites } from "../lib/store";
import { toast } from "./Toast";
import { navigate } from "../lib/router";

export function ListingCard({ listing }: { listing: Listing }) {
  const sub = findSubBySlug(listing.subSlug);
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const isFav = favorites.includes(listing.id);
  const primary = listing.images.find((i) => i.isPrimary) || listing.images[0];

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

        {(() => {
          const { area, totalPrice, pricePerMeter } = getListingPriceDetails(listing);
          const isRent = listing.categorySlug === "rent";
          const monthlyRent = Number(listing.fields?.monthly_rent) || 0;
          return (
            <div className="font-bold text-sm mb-3 flex flex-col justify-center min-h-[2.25rem]" style={{ color: "var(--gold-dark)" }}>
              {isRent ? (
                <>
                  <span>رهن: {formatPrice(listing.price)}</span>
                  <span className="text-[11px] font-normal mt-0.5" style={{ color: "var(--text-medium)" }}>
                    اجاره: {monthlyRent > 0 ? formatPrice(monthlyRent) : "—"}
                  </span>
                </>
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
