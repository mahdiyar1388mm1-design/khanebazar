// Persian number formatting helpers
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}

export function toEn(input: string): string {
  return input.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

export function formatPrice(price: number, exact = false): string {
  if (!price) return "توافقی";
  // نمایش دقیق (مثلاً برای خودرو): عدد کامل با جداکننده هزارگان
  if (exact) return `${toFa(Math.round(price).toLocaleString("en-US"))} تومان`;
  if (price >= 1_000_000_000) {
    const v = (price / 1_000_000_000).toFixed(price % 1_000_000_000 === 0 ? 0 : 1);
    return `${toFa(v)} میلیارد تومان`;
  }
  if (price >= 1_000_000) {
    const v = (price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1);
    return `${toFa(v)} میلیون تومان`;
  }
  return `${toFa(price.toLocaleString("en-US"))} تومان`;
}

export function formatNumber(n: number): string {
  return toFa(n.toLocaleString("en-US"));
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "همین الان";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${toFa(min)} دقیقه پیش`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${toFa(hr)} ساعت پیش`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${toFa(day)} روز پیش`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${toFa(month)} ماه پیش`;
  return `${toFa(Math.floor(month / 12))} سال پیش`;
}

export function formatPhone(phone: string, mask = false): string {
  const en = toEn(phone).replace(/\D/g, "");
  if (!en) return phone;
  if (mask && en.length >= 11) return toFa(en.slice(0, 4) + "***" + en.slice(-4));
  return toFa(en);
}

export function getListingPriceDetails(listing: { price: number; priceType: string; fields?: Record<string, any> }) {
  const area = Number(listing.fields?.area || listing.fields?.building_area || listing.fields?.land_area || 0);
  const totalPrice = listing.price || 0;
  const pricePerMeter = (area > 0 && totalPrice > 0) ? Math.round(totalPrice / area) : 0;

  return {
    area,
    totalPrice,
    pricePerMeter,
  };
}
