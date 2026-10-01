import { useEffect, useState } from "react";
import { PROVINCES, getCitiesOfProvince } from "../lib/locations";
import { getSelectedCity, setSelectedCity } from "../lib/store";
import { Pin, X } from "./Icons";

/**
 * هنگام اولین ورود به سایت، شهر کاربر را می‌پرسد و ذخیره می‌کند.
 * بعد از آن فقط آگهی‌های همان شهر نمایش داده می‌شوند مگر اینکه «کل کشور» انتخاب شود.
 * با رویداد سراسری "kb:open-city" دوباره باز می‌شود (برای تغییر شهر).
 */
export function CityGate() {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    // اگر شهری ذخیره نشده، در اولین ورود باز شود
    if (!getSelectedCity()) setOpen(true);
    const reopen = () => {
      const cur = getSelectedCity();
      setProvince(cur?.province || "");
      setCity(cur?.city || "");
      setOpen(true);
    };
    window.addEventListener("kb:open-city", reopen);
    return () => window.removeEventListener("kb:open-city", reopen);
  }, []);

  if (!open) return null;

  const cities = province ? getCitiesOfProvince(province) : [];

  const chooseCity = () => {
    if (!province || !city) return;
    setSelectedCity({ mode: "city", province, city });
    setOpen(false);
  };

  const chooseAll = () => {
    setSelectedCity({ mode: "all" });
    setOpen(false);
  };

  const canClose = !!getSelectedCity();

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" style={{ background: "rgba(15,26,46,.55)", backdropFilter: "blur(3px)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--gold)" }}>
        {canClose && (
          <button onClick={() => setOpen(false)} className="absolute top-3 left-3 p-1.5 rounded-lg" style={{ color: "var(--text-light)" }}>
            <X size={18} />
          </button>
        )}

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3" style={{ background: "linear-gradient(135deg, var(--royal-blue), var(--royal-blue-light))", color: "var(--gold)" }}>
            <Pin size={26} />
          </div>
          <h2 className="font-extrabold text-lg" style={{ color: "var(--text-dark)" }}>شهر شما کجاست؟</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-medium)" }}>
            آگهی‌های شهر خودتان را ببینید. هر زمان می‌توانید تغییر دهید.
          </p>
        </div>

        <div className="space-y-3">
          <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); }} className="cg-input">
            <option value="">انتخاب استان</option>
            {PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>

          <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province} className="cg-input disabled:opacity-50">
            <option value="">انتخاب شهر</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={chooseCity}
            disabled={!province || !city}
            className="w-full h-12 rounded-xl font-bold btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            نمایش آگهی‌های این شهر
          </button>

          <button
            onClick={chooseAll}
            className="w-full h-11 rounded-xl font-semibold text-sm"
            style={{ border: "1px solid var(--stone)", color: "var(--text-medium)", backgroundColor: "transparent" }}
          >
            🇮🇷 نمایش آگهی‌های کل کشور
          </button>
        </div>

        <style>{`.cg-input{ width:100% !important; height:46px !important; padding:0 12px !important; border:1px solid var(--stone) !important; border-radius:12px !important; font-size:14px !important; background:white !important; color:var(--text-dark) !important; outline:none !important; font-family:inherit; } .cg-input:focus{ border-color:var(--gold) !important; }`}</style>
      </div>
    </div>
  );
}

// کمک‌کننده برای باز کردن مجدد از هر جای برنامه
export function openCityGate() {
  window.dispatchEvent(new CustomEvent("kb:open-city"));
}
