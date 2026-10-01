import { useMemo, useState } from "react";
import { CATEGORIES, getCategory } from "../lib/categories";
import { PROVINCES, getCitiesOfProvince, getNeighborhoods, placeNamesMatch, listingMatchesCity } from "../lib/locations";
import { useListingsState, useSelectedCity } from "../lib/store";
import { useRoute } from "../lib/router";
import { ListingCard } from "../components/ListingCard";
import { ListingSkeletonGrid } from "../components/ListingCardSkeleton";
import { ListingDisclaimer } from "../components/Disclaimer";
import { SEOHead } from "../components/SEOHead";
import { EmptyState } from "../components/EmptyState";
import { Filter } from "../components/Icons";
import { Link } from "../lib/Link";
import { toFa, toEn } from "../lib/format";

const RECENT_KEY = "kb_recent_searches";
function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecent(q: string): string[] {
  const term = q.trim();
  if (term.length < 2) return loadRecent();
  const next = [term, ...loadRecent().filter((t) => t !== term)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function SearchPage(props: { categorySlug?: string }) {
  const route = useRoute();
  const initialQuery = route.name === "search" ? route.query ?? {} : {};
  const { listings: all, loading } = useListingsState();
  const cityPref = useSelectedCity();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecent());

  const defaultProvince = cityPref?.mode === "city" ? cityPref.province || "" : "";
  const defaultCity = cityPref?.mode === "city" ? cityPref.city || "" : "";

  const [q, setQ] = useState(initialQuery.q || "");
  const [cat, setCat] = useState(props.categorySlug || initialQuery.cat || "");
  const [sub, setSub] = useState(initialQuery.sub || "");
  const [province, setProvince] = useState(initialQuery.province || defaultProvince);
  const [city, setCity] = useState(initialQuery.city || defaultCity);
  const [neighborhood, setNeighborhood] = useState(initialQuery.neighborhood || "");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high">("newest");

  const category = cat ? getCategory(cat) : null;
  const subs = category?.subs || [];
  const cities = province ? getCitiesOfProvince(province) : [];

  const filtered = useMemo(() => {
    let items = all.filter((l) => l.status === "active");

    if (q.trim()) {
      const term = q.trim().toLowerCase();
      items = items.filter((l) =>
        l.title.toLowerCase().includes(term) ||
        (l.shortDescription || "").toLowerCase().includes(term) ||
        (l.description || "").toLowerCase().includes(term)
      );
    }
    if (cat) items = items.filter((l) => l.categorySlug === cat);
    if (sub) items = items.filter((l) => l.subSlug === sub);
    // آگهی‌هایی که استانشان ثبت نشده حذف نمی‌شوند تا داده‌های قدیمی از دست نروند
    if (province) items = items.filter((l) => !l.province || placeNamesMatch(l.province, province));
    // تطبیق مقاوم شهر: آگهی‌های بدون شهر اگر در همان استان باشند هم نمایش داده می‌شوند
    if (city) items = items.filter((l) => listingMatchesCity(l, { mode: "city", province, city }));
    if (neighborhood.trim()) {
      const n = neighborhood.trim();
      items = items.filter((l) => (l.neighborhood || "").includes(n));
    }
    const min = priceMin ? Number(toEn(priceMin)) : 0;
    const max = priceMax ? Number(toEn(priceMax)) : Infinity;
    if (min > 0 || max < Infinity) {
      items = items.filter((l) => l.price >= min && l.price <= max);
    }

    if (sort === "price_low") items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === "price_high") items = [...items].sort((a, b) => b.price - a.price);
    else items = [...items].sort((a, b) => b.createdAt - a.createdAt);

    return items;
  }, [all, q, cat, sub, province, city, neighborhood, priceMin, priceMax, sort]);

  const reset = () => {
    setQ(""); setCat(""); setSub(""); setProvince(""); setCity(""); setNeighborhood("");
    setPriceMin(""); setPriceMax(""); setSort("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SEOHead
        title={category ? `آگهی‌های ${category.name}${city ? " در " + city : ""}` : (city ? `آگهی‌های ${city}` : "جستجوی آگهی")}
        description={`جستجو و مشاهده‌ی آگهی‌های ${category ? category.name : "املاک و خودرو"}${city ? " در " + city : " در سراسر ایران"} — خانه بازار`}
        canonical="https://khane-bazar-118.ir/search"
      />
      {/* Breadcrumbs */}
      <div className="mb-4 text-xs text-slate-500 flex items-center gap-2">
        <Link to={{ name: "home" }} className="hover:text-blue-600">خانه</Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold">جستجوی آگهی</span>
        {category && (<><span>/</span><span className="text-slate-700">{category.name}</span></>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="md:col-span-1">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl mb-3 text-sm font-semibold"
          >
            <span className="flex items-center gap-2"><Filter size={16} /> فیلترها</span>
            <span>{filtersOpen ? "بستن" : "باز کردن"}</span>
          </button>

          <div className={`${filtersOpen ? "block" : "hidden"} md:block bg-white border border-slate-200 rounded-xl p-4 space-y-4 sticky top-20`}>
            <FilterGroup label="جستجوی متن">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setRecent(saveRecent(q)); }}
                onBlur={() => setRecent(saveRecent(q))}
                placeholder="کلمه کلیدی (Enter برای ذخیره)"
                className="input"
              />
              {recent.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-500">📌 جستجوهای اخیر</span>
                    <button
                      onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                      className="text-[11px] text-blue-600 hover:underline"
                    >پاک کردن</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recent.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQ(t)}
                        className="px-2.5 py-1 rounded-full text-[11px] border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                      >{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </FilterGroup>

            <FilterGroup label="دسته‌بندی">
              <select value={cat} onChange={(e) => { setCat(e.target.value); setSub(""); }} className="input">
                <option value="">همه دسته‌ها</option>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </FilterGroup>

            {subs.length > 0 && (
              <FilterGroup label="زیردسته">
                <select value={sub} onChange={(e) => setSub(e.target.value)} className="input">
                  <option value="">همه زیردسته‌ها</option>
                  {subs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </FilterGroup>
            )}

            <FilterGroup label="استان">
              <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); setNeighborhood(""); }} className="input">
                <option value="">همه استان‌ها</option>
                {PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </FilterGroup>

            {province && (
              <FilterGroup label="شهر">
                <select value={city} onChange={(e) => { setCity(e.target.value); setNeighborhood(""); }} className="input">
                  <option value="">همه شهرها</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FilterGroup>
            )}

            {city && (
              <FilterGroup label="محله">
                <input
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  list="kb-search-neighborhoods"
                  className="input"
                  placeholder="انتخاب یا تایپ محله"
                />
                <datalist id="kb-search-neighborhoods">
                  {getNeighborhoods(city).map((n) => <option key={n} value={n} />)}
                </datalist>
              </FilterGroup>
            )}

            <FilterGroup label="بازه قیمت (تومان)">
              <div className="flex gap-2">
                <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="حداقل" className="input" />
                <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="حداکثر" className="input" />
              </div>
            </FilterGroup>

            <FilterGroup label="مرتب‌سازی">
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input">
                <option value="newest">جدیدترین</option>
                <option value="price_low">ارزان‌ترین</option>
                <option value="price_high">گران‌ترین</option>
              </select>
            </FilterGroup>

            <button onClick={reset} className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-600">
              <span className="fa-num font-bold text-slate-800">{toFa(filtered.length)}</span> آگهی
            </div>
          </div>

          {loading ? (
            <ListingSkeletonGrid count={9} />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <EmptyState
              icon="🔍"
              title={city ? `نتیجه‌ای در ${city} یافت نشد` : "نتیجه‌ای یافت نشد"}
              description="با تغییر فیلترها یا کلمه کلیدی دیگر دوباره امتحان کنید. در حال حاضر آگهی‌ای با این مشخصات در سایت ثبت نشده."
              action={
                city ? (
                  <button
                    onClick={() => { setCity(""); setProvince(""); setNeighborhood(""); }}
                    className="px-5 py-2.5 rounded-lg font-semibold text-sm btn-gold"
                  >
                    حذف فیلتر شهر و نمایش همه
                  </button>
                ) : undefined
              }
            />
          )}

          <ListingDisclaimer />
        </div>
      </div>

      <style>{`.input{ width:100%; height:42px; padding:0 12px; border:1px solid #e2e8f0; border-radius:10px; font-size:13px; background:white; color:#1e293b; outline:none; font-family:inherit; } .input:focus{ border-color:#2563eb; }`}</style>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1.5">{label}</div>
      {children}
    </div>
  );
}
