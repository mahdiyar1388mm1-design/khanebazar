import type { Category, CategoryField, SubCategory } from "./types";

// Dynamic field definitions per sub-category
export const CATEGORIES: Category[] = [
  {
    slug: "real-estate",
    name: "فروش املاک",
    icon: "🏠",
    color: "#2563EB",
    subs: [
      {
        slug: "house-sale",
        name: "فروش خانه",
        icon: "🏠",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر مربع", required: true },
          { key: "rooms", label: "تعداد اتاق خواب", type: "select", options: ["استودیو", "۱", "۲", "۳", "۴", "۵+"], required: true },
          { key: "bathrooms", label: "تعداد سرویس بهداشتی", type: "select", options: ["۱", "۲", "۳", "۴+"] },
          { key: "year_built", label: "سال ساخت", type: "number" },
          { key: "deed_type", label: "نوع سند", type: "select", options: ["تک‌برگ", "قولنامه‌ای", "مشاع", "وکالتی"] },
          { key: "parking", label: "پارکینگ", type: "boolean" },
          { key: "storage", label: "انباری", type: "boolean" },
          { key: "amenities", label: "امکانات", type: "multiselect", options: ["شوفاژ", "کولر", "پکیج", "کابینت ام‌دی‌اف", "حیاط", "تراس"] },
          { key: "condition", label: "وضعیت", type: "select", options: ["نوساز", "کلیدنخورده", "استفاده شده", "نیاز به بازسازی"] },
        ],
      },
      {
        slug: "apartment-sale",
        name: "فروش آپارتمان",
        icon: "🏢",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر مربع", required: true },
          { key: "rooms", label: "تعداد اتاق خواب", type: "select", options: ["استودیو", "۱", "۲", "۳", "۴", "۵+"], required: true },
          { key: "bathrooms", label: "تعداد سرویس بهداشتی", type: "select", options: ["۱", "۲", "۳"] },
          { key: "floor", label: "طبقه", type: "select", options: ["همکف", "نیم‌طبقه", "زیرزمین", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "۱۱", "۱۲", "بالای ۱۲", "ندارد"], required: true },
          { key: "total_floors", label: "تعداد کل طبقات", type: "number" },
          { key: "elevator", label: "آسانسور", type: "boolean" },
          { key: "parking", label: "پارکینگ", type: "boolean" },
          { key: "storage", label: "انباری", type: "boolean" },
          { key: "year_built", label: "سال ساخت", type: "number" },
          { key: "deed_type", label: "نوع سند", type: "select", options: ["تک‌برگ", "قولنامه‌ای", "مشاع"] },
          { key: "amenities", label: "امکانات", type: "multiselect", options: ["شوفاژ", "کولر", "پکیج", "کابینت", "بالکن", "روف‌گاردن"] },
        ],
      },
      {
        slug: "villa-sale",
        name: "فروش ویلا",
        icon: "🏡",
        fields: [
          { key: "land_area", label: "متراژ زمین", type: "number", unit: "متر", required: true },
          { key: "building_area", label: "متراژ بنا", type: "number", unit: "متر", required: true },
          { key: "rooms", label: "تعداد اتاق خواب", type: "select", options: ["۱", "۲", "۳", "۴", "۵+"] },
          { key: "pool", label: "استخر", type: "boolean" },
          { key: "yard", label: "حیاط", type: "boolean" },
          { key: "parking", label: "پارکینگ", type: "boolean" },
          { key: "deed_type", label: "نوع سند", type: "select", options: ["تک‌برگ", "قولنامه‌ای", "وکالتی"] },
          { key: "amenities", label: "امکانات ویژه", type: "multiselect", options: ["جکوزی", "سونا", "آلاچیق", "باربیکیو", "محوطه‌سازی", "نگهبانی"] },
        ],
      },
      {
        slug: "garden-sale",
        name: "فروش باغ و ویلا باغی",
        icon: "🌳",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر", required: true },
          { key: "land_use", label: "کاربری", type: "select", options: ["مسکونی", "کشاورزی", "تجاری", "صنعتی", "باغ"] },
          { key: "access", label: "دسترسی", type: "select", options: ["جاده اصلی", "آسفالت", "خاکی"] },
          { key: "deed_type", label: "نوع سند", type: "select", options: ["تک‌برگ", "قولنامه‌ای", "مشاع"] },
          { key: "utilities", label: "امکانات", type: "multiselect", options: ["آب", "برق", "گاز", "تلفن"] },
        ],
      },
      {
        slug: "land-sale",
        name: "فروش زمین",
        icon: "🏔️",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر", required: true },
          { key: "land_use", label: "کاربری", type: "select", options: ["مسکونی", "کشاورزی", "تجاری", "صنعتی"], required: true },
          { key: "access", label: "دسترسی", type: "select", options: ["جاده اصلی", "آسفالت", "خاکی"] },
          { key: "deed_type", label: "نوع سند", type: "select", options: ["تک‌برگ", "قولنامه‌ای", "مشاع"] },
          { key: "utilities", label: "امکانات", type: "multiselect", options: ["آب", "برق", "گاز"] },
        ],
      },
      {
        slug: "presale",
        name: "پیش‌فروش آپارتمان",
        icon: "📐",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر", required: true },
          { key: "rooms", label: "تعداد اتاق خواب", type: "select", options: ["۱", "۲", "۳", "۴+"] },
          { key: "delivery_year", label: "سال تحویل", type: "number", required: true },
          { key: "progress", label: "پیشرفت پروژه", type: "select", options: ["زیر ۲۰٪", "۲۰-۵۰٪", "۵۰-۸۰٪", "بالای ۸۰٪"] },
          { key: "payment_terms", label: "شرایط پرداخت", type: "select", options: ["نقدی", "اقساط", "نقد و اقساط"] },
        ],
      },
    ],
  },
  {
    slug: "rent",
    name: "اجاره املاک",
    icon: "🔑",
    color: "#10B981",
    subs: [
      {
        slug: "residential-rent",
        name: "اجاره مسکونی (ماهیانه)",
        icon: "🏠",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر", required: true },
          { key: "rooms", label: "تعداد اتاق خواب", type: "select", options: ["استودیو", "۱", "۲", "۳", "۴+"], required: true },
          { key: "rent_mode", label: "نوع اجاره", type: "select", options: ["ودیعه + اجاره ماهیانه", "رهن کامل"], required: true },
          { key: "deposit", label: "ودیعه / رهن (تومان)", type: "number", required: true },
          { key: "monthly_rent", label: "اجاره ماهیانه (تومان) — برای رهن کامل صفر", type: "number" },
          { key: "floor", label: "طبقه", type: "select", options: ["همکف", "نیم‌طبقه", "زیرزمین", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "بالای ۱۰", "ندارد"] },
          { key: "elevator", label: "آسانسور", type: "boolean" },
          { key: "parking", label: "پارکینگ", type: "boolean" },
          { key: "furnished", label: "مبله", type: "boolean" },
          { key: "amenities", label: "امکانات", type: "multiselect", options: ["شوفاژ", "کولر", "پکیج", "اینترنت"] },
        ],
      },
      {
        slug: "villa-rent",
        name: "اجاره ویلا (روزانه/ماهیانه)",
        icon: "🏡",
        fields: [
          { key: "area", label: "متراژ", type: "number", unit: "متر", required: true },
          { key: "capacity", label: "ظرفیت", type: "number", unit: "نفر", required: true },
          { key: "rent_type", label: "نوع اجاره", type: "select", options: ["روزانه", "ماهیانه"], required: true },
          { key: "daily_price", label: "قیمت روزانه (تومان)", type: "number" },
          { key: "monthly_price", label: "قیمت ماهیانه (تومان)", type: "number" },
          { key: "amenities", label: "امکانات", type: "multiselect", options: ["استخر", "جکوزی", "باربیکیو", "تلویزیون", "اینترنت", "وای‌فای"] },
          { key: "rules", label: "قوانین", type: "multiselect", options: ["حیوانات خانگی مجاز", "سیگار مجاز", "مهمانی مجاز"] },
        ],
      },
      {
        slug: "car-rent",
        name: "اجاره خودرو",
        icon: "🚗",
        fields: [
          { key: "brand", label: "برند", type: "text", required: true },
          { key: "model", label: "مدل", type: "text", required: true },
          { key: "year", label: "سال تولید", type: "number", required: true },
          { key: "transmission", label: "گیربکس", type: "select", options: ["دستی", "اتوماتیک"] },
          { key: "daily_price", label: "اجاره روزانه (تومان)", type: "number", required: true },
          { key: "weekly_price", label: "اجاره هفتگی (تومان)", type: "number" },
          { key: "monthly_price", label: "اجاره ماهیانه (تومان)", type: "number" },
          { key: "deposit", label: "ودیعه (تومان)", type: "number" },
          { key: "km_limit", label: "محدودیت کیلومتر روزانه", type: "number", unit: "کیلومتر" },
        ],
      },
    ],
  },
  {
    slug: "vehicles",
    name: "وسایل نقلیه",
    icon: "🚗",
    color: "#F59E0B",
    subs: [
      {
        slug: "car-sale",
        name: "فروش خودرو",
        icon: "🚗",
        fields: [
          { key: "brand", label: "برند", type: "select", options: ["ایران خودرو", "سایپا", "بهمن موتور", "تویوتا", "هیوندای", "کیا", "BMW", "بنز", "سایر"], required: true },
          { key: "model", label: "مدل", type: "text", required: true },
          { key: "year", label: "سال تولید", type: "number", required: true },
          { key: "mileage", label: "کارکرد", type: "number", unit: "کیلومتر", required: true },
          { key: "body_color", label: "رنگ بدنه", type: "text" },
          { key: "interior_color", label: "رنگ داخل", type: "text" },
          { key: "transmission", label: "گیربکس", type: "select", options: ["دستی", "اتوماتیک"], required: true },
          { key: "fuel", label: "سوخت", type: "select", options: ["بنزین", "دوگانه‌سوز", "گازوئیل", "برقی", "هیبریدی"] },
          { key: "insurance", label: "بیمه تا (تاریخ)", type: "text" },
          { key: "inspection", label: "معاینه فنی", type: "boolean" },
          { key: "doors", label: "تعداد درب", type: "select", options: ["۲", "۴"] },
          { key: "body_condition", label: "وضعیت بدنه", type: "select", options: ["بی‌رنگ", "صافکاری بدون رنگ", "دو رنگ", "چند رنگ", "تصادفی"] },
          { key: "options", label: "امکانات", type: "multiselect", options: ["ABS", "ایربگ", "شیشه برقی", "قفل مرکزی", "رینگ اسپرت", "سانروف", "صندلی برقی"] },
        ],
      },
      {
        slug: "motorcycle-sale",
        name: "فروش موتورسیکلت",
        icon: "🏍️",
        fields: [
          { key: "brand", label: "برند", type: "text", required: true },
          { key: "model", label: "مدل", type: "text", required: true },
          { key: "year", label: "سال تولید", type: "number", required: true },
          { key: "mileage", label: "کارکرد", type: "number", unit: "کیلومتر" },
          { key: "engine_cc", label: "حجم موتور", type: "number", unit: "سی‌سی" },
          { key: "type", label: "نوع", type: "select", options: ["اسکوتر", "کراس", "تریل", "هوندا", "روزدار"] },
          { key: "condition", label: "وضعیت", type: "select", options: ["صفر", "کارکرده"] },
        ],
      },
      {
        slug: "boat-sale",
        name: "قایق و سایر وسایل نقلیه",
        icon: "🚤",
        fields: [
          { key: "type", label: "نوع وسیله", type: "text", required: true },
          { key: "length", label: "طول", type: "number", unit: "متر" },
          { key: "year", label: "سال ساخت", type: "number" },
          { key: "fuel", label: "سوخت", type: "select", options: ["بنزین", "گازوئیل", "برقی"] },
          { key: "capacity", label: "ظرفیت مسافر", type: "number", unit: "نفر" },
          { key: "amenities", label: "امکانات", type: "multiselect", options: ["موتور", "بادبان", "GPS", "رادیو", "سرویس بهداشتی"] },
        ],
      },
    ],
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubCategory(catSlug: string, subSlug: string) {
  return getCategory(catSlug)?.subs.find((s) => s.slug === subSlug);
}

export function findSubBySlug(subSlug: string) {
  for (const cat of CATEGORIES) {
    const sub = cat.subs.find((s) => s.slug === subSlug);
    if (sub) return { cat, sub };
  }
  return null;
}

// ---------------------------------------------------------------------------
// تشخیص فیلدهای یک آگهی
//
// برخی آگهی‌ها ستون «زیردسته» را خالی دارند (قبل از افزودن آن ستون ثبت
// شده‌اند). در آن حالت قبلاً بخش «مشخصات» کاملاً خالی نمایش داده می‌شد،
// درحالی‌که داده‌ها در آگهی موجود بودند. توابع زیر تعریف فیلدها را از روی
// کلیدهای موجود در خود آگهی پیدا می‌کنند تا هیچ جزئیاتی از دست نرود.
// ---------------------------------------------------------------------------

// برچسب فارسی برای کلیدهایی که ممکن است در تعریف دسته‌ها نباشند
const FALLBACK_FIELD_LABELS: Record<string, string> = {
  monthly_rent: "اجاره ماهیانه (تومان)",
  deposit: "ودیعه / رهن (تومان)",
  rent_mode: "نوع اجاره",
  rent_type: "نوع اجاره",
  daily_price: "قیمت روزانه (تومان)",
  weekly_price: "اجاره هفتگی (تومان)",
  monthly_price: "قیمت ماهیانه (تومان)",
  km_limit: "محدودیت کیلومتر روزانه",
  building_area: "متراژ بنا",
  land_area: "متراژ زمین",
  total_floors: "تعداد کل طبقات",
  year_built: "سال ساخت",
  delivery_year: "سال تحویل",
  engine_cc: "حجم موتور",
  body_color: "رنگ بدنه",
  interior_color: "رنگ داخل",
  body_condition: "وضعیت بدنه",
  land_use: "کاربری",
  payment_terms: "شرایط پرداخت",
};

function prettifyFieldKey(key: string): string {
  const cleaned = key.replace(/[_\-]+/g, " ").trim();
  return cleaned || key;
}

function inferFieldType(v: unknown): CategoryField["type"] {
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return "number";
  if (Array.isArray(v)) return "multiselect";
  return "text";
}

/** فهرست فیلدهای همه‌ی زیردسته‌ها (برای پیدا کردن برچسب/واحد یک کلید) */
function allFieldDefs(): CategoryField[] {
  const out: CategoryField[] = [];
  const seen = new Set<string>();
  for (const cat of CATEGORIES) {
    for (const sub of cat.subs) {
      for (const f of sub.fields) {
        if (seen.has(f.key)) continue;
        seen.add(f.key);
        out.push(f);
      }
    }
  }
  return out;
}

/**
 * بهترین زیردسته‌ی منطبق با کلیدهای فیلدهای یک آگهی.
 * مثلاً برای {area, rooms, floor, elevator, total_floors, ...} زیردسته‌ی
 * «فروش آپارتمان» انتخاب می‌شود تا برچسب‌ها و واحدها درست نمایش داده شوند.
 */
export function inferSubFromFields(
  categorySlug: string,
  fields: Record<string, any> | undefined
): SubCategory | null {
  const keys = Object.keys(fields || {}).filter(
    (k) => fields && fields[k] !== undefined && fields[k] !== null && fields[k] !== ""
  );
  if (!keys.length) return null;
  const cat = getCategory(categorySlug);
  const candidates = cat ? cat.subs : CATEGORIES.flatMap((c) => c.subs);
  let best: { sub: SubCategory; score: number } | null = null;
  for (const sub of candidates) {
    const subKeys = sub.fields.map((f) => f.key);
    if (!subKeys.length) continue;
    const matched = keys.filter((k) => subKeys.includes(k)).length;
    if (!matched) continue;
    // نسبت پوشش کلیدهای آگهی + جریمه‌ی کوچک برای فیلدهای بی‌ربط زیردسته
    const score = matched / keys.length - (subKeys.length - matched) / (subKeys.length * 20);
    if (!best || score > best.score) best = { sub, score };
  }
  return best && best.score >= 0.4 ? best.sub : null;
}

/**
 * فیلدهای نمایش‌دادنی یک آگهی، حتی وقتی زیردسته ثبت نشده یا ناشناخته است.
 * ابتدا زیردسته‌ی ثبت‌شده، بعد زیردسته‌ی استنباط‌شده و در نهایت کلیدهای
 * خالی‌مانده با برچسب ساخته‌شده در انتها اضافه می‌شوند.
 */
export function resolveListingFields(listing: {
  categorySlug?: string;
  subSlug?: string;
  fields?: Record<string, any>;
}): { sub: SubCategory | null; fields: CategoryField[] } {
  const values = listing.fields || {};
  const present = Object.keys(values).filter(
    (k) => values[k] !== undefined && values[k] !== null && values[k] !== ""
  );
  if (!present.length) return { sub: null, fields: [] };

  const declared = listing.subSlug ? findSubBySlug(listing.subSlug)?.sub ?? null : null;
  const sub = declared || inferSubFromFields(listing.categorySlug || "", values);

  const defs: CategoryField[] = [];
  const used = new Set<string>();
  const categorySubs: SubCategory[] = getCategory(listing.categorySlug || "")?.subs ?? CATEGORIES.flatMap((c) => c.subs);
  const pool: CategoryField[] = sub ? sub.fields : categorySubs.flatMap((s) => s.fields);

  for (const f of pool) {
    if (present.includes(f.key)) { defs.push(f); used.add(f.key); }
  }

  if (defs.length !== present.length) {
    const known = new Map(allFieldDefs().map((f) => [f.key, f]));
    for (const key of present) {
      if (used.has(key)) continue;
      defs.push(known.get(key) ?? {
        key,
        label: FALLBACK_FIELD_LABELS[key] || prettifyFieldKey(key),
        type: inferFieldType(values[key]),
      });
    }
  }

  return { sub, fields: defs };
}
