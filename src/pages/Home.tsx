import { useState } from "react";
import { Link } from "../lib/Link";
import { navigate } from "../lib/router";
import { CATEGORIES } from "../lib/categories";
import { PROVINCES, filterByCity } from "../lib/locations";
import { useListingsState, useSelectedCity, setSelectedCity } from "../lib/store";
import { openCityGate } from "../components/CityGate";
import { ListingCard } from "../components/ListingCard";
import { ListingSkeletonGrid } from "../components/ListingCardSkeleton";
import { ListingDisclaimer } from "../components/Disclaimer";
import { EmptyState } from "../components/EmptyState";
import { SEOHead } from "../components/SEOHead";
import { Search, Plus, Pin, ShieldCheck, Chat } from "../components/Icons";
import { toFa } from "../lib/format";

export function HomePage() {
  const { listings: all, loading } = useListingsState();
  const cityPref = useSelectedCity();
  const active = all.filter((l) => l.status === "active");
  const isCityMode = !!cityPref && cityPref.mode === "city" && !!cityPref.city;
  // تطبیق مقاوم شهر (نویسه‌های عربی/فارسی، فاصله‌ی اضافه و آگهی‌های بدون شهر را هم پوشش می‌دهد)
  const inCity = filterByCity(active, cityPref);
  const recent = [...inCity].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
  // آگهی‌های بقیه‌ی شهرها — فقط وقتی در شهر کاربر چیزی نیست نمایش داده می‌شوند
  const inCityIds = new Set(inCity.map((l) => l.id));
  const elsewhere = isCityMode
    ? [...active].filter((l) => !inCityIds.has(l.id)).sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)
    : [];

  return (
    <div>
      <SEOHead
        title="خانه بازار | خرید، فروش و اجاره ملک، آپارتمان و خودرو در ایران"
        description="خانه بازار — نیازمندی‌های رایگان ملک، آپارتمان، ویلا، زمین و خودرو. آگهی خود را رایگان ثبت کنید یا بین صدها آگهی فعال جستجو کنید."
        canonical="https://khane-bazar-118.ir/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "خانه بازار",
          url: "https://khane-bazar-118.ir/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://khane-bazar-118.ir/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {/* Hero - Achaemenid */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "180px",
          backgroundImage:
            "linear-gradient(rgba(15,26,46,.62), rgba(26,39,68,.52)), radial-gradient(ellipse at 50% 0%, rgba(200,169,81,.14) 0%, transparent 60%), url(/images/hero-persepolis.png)",
          backgroundSize: "cover, cover, 180px auto",
          backgroundPosition: "center bottom, center center, center bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Soft vignette overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,26,46,.18) 0%, rgba(15,26,46,.28) 100%)" }} />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 pb-6 text-center">
          {/* Logo */}
          <img src="/images/logo.png" alt="خانه بازار" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-2xl object-cover" style={{ border: "2px solid var(--gold)", boxShadow: "0 4px 30px rgba(200,169,81,0.2)" }} />
          
          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }} />
            <span style={{ color: "var(--gold)" }}>◆</span>
            <div className="w-16 h-[1px]" style={{ background: "linear-gradient(270deg, transparent, var(--gold))" }} />
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight" style={{ color: "var(--gold-light)" }}>
            خانه رویایی خود را پیدا کنید
          </h1>
          <p className="text-sm md:text-base mb-8 max-w-2xl mx-auto leading-7" style={{ color: "var(--stone)" }}>
            خرید، فروش و اجاره املاک، خودرو و وسایل نقلیه — با الهام از شکوه تمدن هخامنشی
          </p>

          <button
            onClick={openCityGate}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 transition"
            style={{ backgroundColor: "rgba(200,169,81,0.15)", border: "1px solid var(--gold)", color: "var(--gold-light)" }}
          >
            <Pin size={14} />
            {cityPref && cityPref.mode === "city" && cityPref.city ? `آگهی‌های ${cityPref.city}` : "کل کشور"}
            <span className="opacity-70 text-xs">(تغییر)</span>
          </button>

          <HeroSearch />

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10 text-center">
            <Stat value={toFa(inCity.length)} label={isCityMode ? `آگهی در ${cityPref!.city}` : "آگهی فعال"} />
            <Stat value={toFa(PROVINCES.length)} label="استان" />
            <Stat value={toFa(CATEGORIES.reduce((n, c) => n + c.subs.length, 0))} label="دسته‌بندی" />
          </div>
        </div>
        
        {/* Bottom ornamental border */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, transparent 5%, var(--gold-dark) 20%, var(--gold) 50%, var(--gold-dark) 80%, transparent 95%)" }} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHead title="دسته‌بندی‌ها" subtitle="آنچه می‌خواهی را در یک جا پیدا کن" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={{ name: "category", slug: cat.slug }} className="group card-achaemenid p-4 md:p-5 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl" style={{ backgroundColor: `${cat.color}12` }}>
                  {cat.icon}
                </div>
                <div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>{cat.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-light)" }}>{toFa(cat.subs.length)} زیر دسته</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.subs.slice(0, 4).map((sub) => (
                  <span key={sub.slug} className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-medium)" }}>
                    {sub.icon} {sub.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <SectionHead
          title={isCityMode ? `جدیدترین آگهی‌ها در ${cityPref!.city}` : "جدیدترین آگهی‌ها"}
          subtitle={isCityMode ? "آگهی‌های ثبت‌شده در شهر شما" : "تازه‌ترین آگهی‌های منتشر شده"}
          action={<Link to={{ name: "search" }} className="text-sm font-semibold hover:underline" style={{ color: "var(--gold-dark)" }}>مشاهده همه ←</Link>}
        />
        {loading ? (
          <ListingSkeletonGrid count={8} />
        ) : recent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {recent.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : isCityMode ? (
          <EmptyState
            icon="📍"
            title={`هنوز آگهی‌ای در ${cityPref!.city} ثبت نشده`}
            description="می‌توانید آگهی‌های شهرهای دیگر را ببینید یا شهر خود را عوض کنید."
            action={
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCity({ mode: "all" })}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm btn-gold"
                >
                  نمایش آگهی‌های کل کشور
                </button>
                <button
                  onClick={openCityGate}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm"
                  style={{ border: "1px solid var(--stone)", color: "var(--text-medium)", backgroundColor: "transparent" }}
                >
                  تغییر شهر
                </button>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon="📭"
            title="هنوز آگهی‌ای ثبت نشده است"
            description="اولین آگهی را شما ثبت کنید! خانه بازار به‌صورت تازه راه‌اندازی شده و آماده‌ی پذیرش آگهی‌های شماست."
            action={
              <Link to={{ name: "create" }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm btn-gold">
                <Plus size={16} /> ثبت اولین آگهی
              </Link>
            }
          />
        )}

        {isCityMode && recent.length === 0 && elsewhere.length > 0 && (
          <div className="mt-12">
            <SectionHead title="آگهی‌های سایر شهرها" subtitle="تازه‌ترین آگهی‌های ثبت‌شده در شهرهای دیگر" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {elsewhere.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}

        <ListingDisclaimer />
      </section>

      {/* Features */}
      <section className="pb-20" style={{ backgroundColor: "var(--card-bg)", borderTop: "1px solid var(--stone-light)" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            icon={<ShieldCheck className="text-emerald-600" size={28} />}
            title="امن و قابل اعتماد"
            description="تمامی آگهی‌ها قبل از انتشار توسط تیم خانه بازار بررسی و تأیید می‌شوند."
          />
          <Feature
            icon={<Chat className="text-blue-500" size={28} />}
            title="چت مستقیم"
            description="با فروشنده مستقیم چت کنید و بدون واسطه به توافق برسید."
          />
          <Feature
            icon={<Pin className="text-rose-500" size={28} />}
            title="نقشه رایگان"
            description="موقعیت دقیق ملک یا خودرو را روی نقشه ببینید و بهترین گزینه را انتخاب کنید."
          />
        </div>
      </section>
    </div>
  );
}

function HeroSearch() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [province, setProvince] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query: Record<string, string> = {};
        if (q) query.q = q;
        if (cat) query.cat = cat;
        if (province) query.province = province;
        navigate({ name: "search", query });
      }}
      className="max-w-3xl mx-auto p-2 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2"
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone)", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
    >
      <div className="relative">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="چه چیزی می‌خوای؟"
          className="w-full h-11 pr-10 pl-3 text-sm rounded-lg outline-none"
          style={{ color: "var(--text-dark)" }}
        />
      </div>
      <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 px-3 text-sm rounded-lg outline-none" style={{ color: "var(--text-dark)" }}>
        <option value="">همه دسته‌ها</option>
        {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <select value={province} onChange={(e) => setProvince(e.target.value)} className="h-11 px-3 text-sm rounded-lg outline-none" style={{ color: "var(--text-dark)" }}>
        <option value="">همه استان‌ها</option>
        {PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
      </select>
      <button type="submit" className="h-11 px-5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 btn-gold">
        <Search size={16} /> جستجو
      </button>
    </form>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-extrabold" style={{ color: "var(--gold)" }}>{value}</div>
      <div className="text-xs md:text-sm" style={{ color: "var(--stone)" }}>{label}</div>
    </div>
  );
}

function SectionHead(props: { title: string; subtitle?: string; icon?: any; action?: any }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <div className="flex items-center gap-2">
          {props.icon}
          <h2 className="font-extrabold text-lg md:text-xl" style={{ color: "var(--text-dark)" }}>{props.title}</h2>
        </div>
        {props.subtitle && <p className="text-xs md:text-sm mt-1" style={{ color: "var(--text-light)" }}>{props.subtitle}</p>}
      </div>
      {props.action}
    </div>
  );
}

function Feature(props: { icon: any; title: string; description: string }) {
  return (
    <div className="text-center md:text-right p-5">
      <div className="w-14 h-14 rounded-2xl grid place-items-center mb-3 mx-auto md:mx-0" style={{ backgroundColor: "var(--cream-dark)" }}>
        {props.icon}
      </div>
      <h3 className="font-bold mb-2" style={{ color: "var(--text-dark)" }}>{props.title}</h3>
      <p className="text-sm leading-7" style={{ color: "var(--text-light)" }}>{props.description}</p>
    </div>
  );
}
