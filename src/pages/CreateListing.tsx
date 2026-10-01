import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, getCategory, getSubCategory } from "../lib/categories";
import { PROVINCES, getCitiesOfProvince, getNeighborhoods } from "../lib/locations";
import { cryptoId, saveListing, useCurrentUser } from "../lib/store";
import type { Listing, ListingImage, PriceType } from "../lib/types";
import { navigate } from "../lib/router";
import { ArrowLeft, ArrowRight, Camera, Check, Pin, Trash } from "../components/Icons";
import { toast } from "../components/Toast";
import { formatPrice, toEn, toFa } from "../lib/format";
import { MapView } from "../components/MapView";
import { API_CONFIG } from "../lib/api";


const STEPS = [
  { n: 1, label: "دسته‌بندی" },
  { n: 2, label: "تصاویر" },
  { n: 3, label: "توضیحات" },
  { n: 4, label: "مشخصات" },
  { n: 5, label: "قیمت و موقعیت" },
  { n: 6, label: "پیش‌نمایش" },
];

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function CreateListingPage() {
  const user = useCurrentUser();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [images, setImages] = useState<ListingImage[]>([]);
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [fields, setFields] = useState<Record<string, any>>({});
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);

  const sub = catSlug && subSlug ? getSubCategory(catSlug, subSlug) : null;

  const goNext = () => setStep((s) => Math.min(6, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (title.trim().length < 10) { toast("عنوان حداقل ۱۰ کاراکتر باشد", "error"); return false; }
        if (!catSlug || !subSlug) { toast("دسته و زیر دسته را انتخاب کنید", "error"); return false; }
        return true;
      case 2:
        if (images.length === 0) { toast("حداقل یک تصویر اضافه کنید", "error"); return false; }
        return true;
      case 3:
        if (shortDesc.trim().length < 20) { toast("توضیح کوتاه حداقل ۲۰ کاراکتر باشد", "error"); return false; }
        if (shortDesc.length > 500) { toast("توضیح کوتاه حداکثر ۵۰۰ کاراکتر", "error"); return false; }
        return true;
      case 4:
        if (sub) {
          for (const f of sub.fields) {
            if (f.required && (fields[f.key] === undefined || fields[f.key] === "")) {
              toast(`فیلد "${f.label}" الزامی است`, "error"); return false;
            }
          }
        }
        return true;
      case 5:
        if (catSlug !== "rent" && priceType !== "negotiable" && (!price || +toEn(price) <= 0)) { toast("قیمت را وارد کنید", "error"); return false; }
        if (!province || !city) { toast("استان و شهر را انتخاب کنید", "error"); return false; }
        return true;
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) goNext(); };

  const handleSubmit = async (asDraft = false) => {
    if (!user || submitting) return;
    setSubmitting(true);
    const listing: Listing = {
      id: cryptoId(),
      userId: user.id,
      categorySlug: catSlug,
      subSlug,
      title: title.trim(),
      shortDescription: shortDesc.trim(),
      description: desc.trim(),
      price: catSlug === "rent"
        ? (Number(toEn(String(fields?.deposit ?? ""))) || 0)
        : (priceType === "negotiable" ? 0 : +toEn(price)),
      priceType: catSlug === "rent" ? "fixed" : priceType,
      fields,
      images,
      province,
      city,
      neighborhood,
      address,
      lat: coords?.lat,
      lng: coords?.lng,
      status: asDraft ? "draft" : "pending",
      views: 0,
      createdAt: Date.now(),
      expiresAt: 0, // بدون محدودیت زمانی — آگهی هرگز منقضی نمی‌شود
    };

    try {
      await saveListing(listing);
      toast(asDraft ? "پیش‌نویس ذخیره شد" : "آگهی ثبت شد و برای تأیید ارسال شد", "success");
      navigate({ name: "my-listings" });
    } catch (e: any) {
      toast(e?.message || "خطا در ثبت آگهی — دوباره تلاش کنید", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-extrabold text-xl md:text-2xl text-slate-800">ثبت آگهی جدید</h1>
        <p className="text-sm text-slate-500 mt-1">آگهی خود را در ۶ مرحله ساده منتشر کنید</p>
      </div>

      {/* Steps */}
      <Stepper current={step} />

      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-7 mt-5">
        {step === 1 && (
          <Step1 title={title} setTitle={setTitle} catSlug={catSlug} setCatSlug={setCatSlug} subSlug={subSlug} setSubSlug={setSubSlug} />
        )}
        {step === 2 && (
          <Step2 images={images} setImages={setImages} />
        )}
        {step === 3 && (
          <Step3 shortDesc={shortDesc} setShortDesc={setShortDesc} desc={desc} setDesc={setDesc} />
        )}
        {step === 4 && sub && (
          <Step4 sub={sub} fields={fields} setFields={setFields} />
        )}
        {step === 5 && (
          <Step5
            catSlug={catSlug}
            price={price} setPrice={setPrice}
            priceType={priceType} setPriceType={setPriceType}
            province={province} setProvince={setProvince}
            city={city} setCity={setCity}
            neighborhood={neighborhood} setNeighborhood={setNeighborhood}
            address={address} setAddress={setAddress}
            coords={coords} setCoords={setCoords}
            fields={fields}
          />
        )}
        {step === 6 && (
          <Step6
            data={{ title, catSlug, subSlug, images, shortDesc, desc, fields, price, priceType, province, city, neighborhood, address, coords }}
            onEdit={(s: number) => setStep(s)}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-5 gap-3">
        <button
          onClick={goBack}
          disabled={step === 1}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 disabled:opacity-30 flex items-center gap-1.5"
        >
          <ArrowRight size={16} /> مرحله قبل
        </button>

        {step < 6 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5"
          >
            ادامه <ArrowLeft size={16} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => handleSubmit(true)} disabled={submitting} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm disabled:opacity-50">ذخیره پیش‌نویس</button>
            <button onClick={() => handleSubmit(false)} disabled={submitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 disabled:opacity-60">
              <Check size={16} /> {submitting ? "در حال ارسال…" : "انتشار آگهی"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4">
      <div className="flex items-center justify-between gap-1 md:gap-3">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-xs transition
                ${current === s.n ? "bg-blue-600 text-white scale-110 shadow-md shadow-blue-200" :
                  current > s.n ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}
              `}>
                {current > s.n ? <Check size={14} /> : toFa(s.n)}
              </div>
              <span className={`text-[10px] md:text-xs ${current === s.n ? "font-bold text-blue-600" : "text-slate-500"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-5 transition ${current > s.n ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1(props: any) {
  const cat = props.catSlug ? getCategory(props.catSlug) : null;
  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">عنوان و دسته‌بندی</h2>

      <Field label="عنوان آگهی" hint={`${toFa(props.title.length)} / ۱۰ کاراکتر حداقل`}>
        <input value={props.title} onChange={(e) => props.setTitle(e.target.value)}
          maxLength={120}
          placeholder="مثلاً: آپارتمان ۸۵ متری ۲ خواب در سعادت‌آباد"
          className="input" />
      </Field>

      <Field label="دسته اصلی">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => { props.setCatSlug(c.slug); props.setSubSlug(""); }}
              className={`p-4 rounded-xl border-2 transition text-center ${props.catSlug === c.slug ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="text-3xl mb-1">{c.icon}</div>
              <div className="text-sm font-bold text-slate-800">{c.name}</div>
            </button>
          ))}
        </div>
      </Field>

      {cat && (
        <Field label="زیر دسته">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {cat.subs.map((s) => (
              <button
                key={s.slug}
                onClick={() => props.setSubSlug(s.slug)}
                className={`p-3 rounded-lg border-2 transition text-right text-sm flex items-center gap-2 ${props.subSlug === s.slug ? "border-blue-500 bg-blue-50 font-bold" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <span className="text-xl">{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </Field>
      )}
      <InputStyle />
    </div>
  );
}

function Step2(props: { images: ListingImage[]; setImages: (i: ListingImage[]) => void }) {
  const [processing, setProcessing] = useState(false);

  const handleFiles = async (files: FileList) => {
    if (props.images.length + files.length > MAX_IMAGES) {
      toast(`حداکثر ${toFa(MAX_IMAGES)} تصویر مجاز است`, "error"); return;
    }
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) { toast(`حجم "${file.name}" بیشتر از ۱۰ مگابایت است`, "error"); continue; }
      if (!file.type.startsWith("image/")) { toast("فقط فایل تصویری مجاز است", "error"); continue; }
      validFiles.push(file);
    }
    if (!validFiles.length) return;

    setProcessing(true);
    try {
      // پردازش موازی همه‌ی عکس‌ها به‌جای یکی‌یکی — چند برابر سریع‌تر
      const dataUrls = await Promise.all(validFiles.map((f) => fileToDataUrl(f)));
      const startEmpty = props.images.length === 0;
      const newImgs: ListingImage[] = dataUrls.map((dataUrl, i) => ({
        id: cryptoId(),
        dataUrl,
        isPrimary: startEmpty && i === 0,
      }));
      props.setImages([...props.images, ...newImgs]);
    } finally {
      setProcessing(false);
    }
  };

  const removeImg = (id: string) => {
    const filtered = props.images.filter((i) => i.id !== id);
    if (filtered.length && !filtered.some((i) => i.isPrimary)) filtered[0].isPrimary = true;
    props.setImages(filtered);
  };

  const setPrimary = (id: string) => {
    props.setImages(props.images.map((i) => ({ ...i, isPrimary: i.id === id })));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">تصاویر آگهی</h2>
      <div className="text-sm text-slate-500 leading-6">
        حداکثر <strong>{toFa(MAX_IMAGES)}</strong> تصویر، حجم هر تصویر تا <strong>۱۰ مگابایت</strong> (بعد از آپلود خودکار فشرده می‌شود) — همه فرمت‌های تصویری پشتیبانی می‌شوند
      </div>

      <label className={`block border-2 border-dashed rounded-xl p-6 text-center transition bg-slate-50 ${processing ? "border-blue-300 cursor-wait opacity-70" : "border-slate-300 hover:border-blue-400 cursor-pointer"}`}>
        <Camera className="mx-auto text-slate-400 mb-2" size={36} />
        <div className="text-sm font-semibold text-slate-700">
          {processing ? "در حال آماده‌سازی تصاویر…" : "برای انتخاب تصاویر کلیک کنید"}
        </div>
        <div className="text-xs text-slate-500 mt-1">یا فایل‌ها را اینجا بکشید</div>
        <input
          type="file" accept="image/*" multiple hidden disabled={processing}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </label>

      {props.images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {props.images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-transparent">
              <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
              {img.isPrimary && (
                <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">اصلی</div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {!img.isPrimary && (
                  <button onClick={() => setPrimary(img.id)} className="px-2 py-1 bg-white text-slate-700 text-[10px] rounded">اصلی</button>
                )}
                <button onClick={() => removeImg(img.id)} className="w-7 h-7 bg-red-500 text-white rounded grid place-items-center"><Trash size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step3(props: any) {
  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">توضیحات</h2>
      <Field label="توضیح کوتاه (الزامی)" hint={`${toFa(props.shortDesc.length)} / حداقل ۲۰، حداکثر ۵۰۰ کاراکتر`}>
        <textarea value={props.shortDesc} onChange={(e) => props.setShortDesc(e.target.value)} maxLength={500} rows={3} className="input resize-none" placeholder="در یک یا دو جمله، خلاصه‌ای از آگهی را بنویسید" />
      </Field>
      <Field label="توضیح کامل (اختیاری)" hint={`${toFa(props.desc.length)} / حداکثر ۵۰۰۰ کاراکتر`}>
        <textarea value={props.desc} onChange={(e) => props.setDesc(e.target.value)} maxLength={5000} rows={8} className="input resize-none" placeholder="جزئیات بیشتر، شرایط، نکات و..." />
      </Field>
      <InputStyle />
    </div>
  );
}

function Step4(props: { sub: any; fields: Record<string, any>; setFields: (f: Record<string, any>) => void }) {
  const update = (k: string, v: any) => props.setFields({ ...props.fields, [k]: v });
  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">مشخصات اختصاصی — {props.sub.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.sub.fields.map((f: any) => (
          <Field key={f.key} label={f.label + (f.required ? " *" : "")} hint={f.unit}>
            {f.type === "text" && (
              <input value={props.fields[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} className="input" />
            )}
            {f.type === "number" && (
              <input type="text" inputMode="numeric" value={props.fields[f.key] ?? ""} onChange={(e) => update(f.key, +toEn(e.target.value).replace(/\D/g, "") || "")} className="input fa-num" />
            )}
            {f.type === "select" && (
              <select value={props.fields[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} className="input">
                <option value="">انتخاب کنید</option>
                {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {f.type === "boolean" && (
              <div className="flex gap-2">
                <button onClick={() => update(f.key, true)} className={`flex-1 py-2 rounded-lg border-2 text-sm ${props.fields[f.key] === true ? "border-blue-500 bg-blue-50 font-bold" : "border-slate-200"}`}>دارد</button>
                <button onClick={() => update(f.key, false)} className={`flex-1 py-2 rounded-lg border-2 text-sm ${props.fields[f.key] === false ? "border-blue-500 bg-blue-50 font-bold" : "border-slate-200"}`}>ندارد</button>
              </div>
            )}
            {f.type === "multiselect" && (
              <div className="flex flex-wrap gap-1.5">
                {f.options.map((o: string) => {
                  const arr: string[] = props.fields[f.key] ?? [];
                  const on = arr.includes(o);
                  return (
                    <button
                      key={o}
                      onClick={() => update(f.key, on ? arr.filter((x) => x !== o) : [...arr, o])}
                      className={`px-3 py-1.5 rounded-lg text-xs border-2 transition ${on ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 text-slate-600"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>
        ))}
      </div>
      <InputStyle />
    </div>
  );
}

function Step5(props: any) {
  const cities = props.province ? getCitiesOfProvince(props.province) : [];
  const isRent = props.catSlug === "rent";
  const previewPrice = props.price ? formatPrice(+toEn(props.price)) : "—";

  // با انتخاب استان/شهر/محله، نقشه به‌صورت خودکار به همان منطقه می‌رود
  // تا کاربر مجبور نباشد خودش روی نقشه دنبال محل بگردد.
  const [areaCenter, setAreaCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestedAddress, setSuggestedAddress] = useState("");
  useEffect(() => {
    if (!props.city || props.coords) return;
    const parts = [props.neighborhood, props.city, props.province, "ایران"].filter(Boolean);
    const query = Array.from(new Set(parts)).join("، ");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const base = API_CONFIG.BASE_URL || "";
        const res = await fetch(`${base}/api/map/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const first = data?.items?.[0];
        if (first?.lat && first?.lng) setAreaCenter({ lat: first.lat, lng: first.lng });
      } catch {
        // شبکه/سرور در دسترس نیست — نقشه در موقعیت پیش‌فرض می‌ماند
      }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [props.city, props.neighborhood, props.province, props.coords]);

  // Read area size from fields state:
  const area = Number(props.fields?.area || props.fields?.building_area || props.fields?.land_area || 0);
  
  // Calculate price per meter or total price based on entered value
  const totalPrice = Number(toEn(props.price)) || 0;
  const pricePerMeterVal = (area > 0 && totalPrice > 0) ? Math.round(totalPrice / area) : 0;
  
  const [pricePerMeterInput, setPricePerMeterInput] = useState(
    pricePerMeterVal > 0 ? pricePerMeterVal.toString() : ""
  );

  // Synchronize input values if the price prop changes from parent (e.g. on initial render or state sync)
  useEffect(() => {
    if (area > 0) {
      const calculatedPerMeter = totalPrice > 0 ? Math.round(totalPrice / area) : 0;
      setPricePerMeterInput(calculatedPerMeter > 0 ? calculatedPerMeter.toString() : "");
    }
  }, [props.price, area, totalPrice]);

  const handleTotalChange = (val: string) => {
    const cleanVal = toEn(val).replace(/\D/g, "");
    const totalNum = Number(cleanVal) || 0;
    props.setPrice(cleanVal);
    
    if (area > 0) {
      const calculatedPerMeter = totalNum > 0 ? Math.round(totalNum / area) : 0;
      setPricePerMeterInput(calculatedPerMeter > 0 ? calculatedPerMeter.toString() : "");
    }
  };

  const handlePerMeterChange = (val: string) => {
    const cleanVal = toEn(val).replace(/\D/g, "");
    const perMeterNum = Number(cleanVal) || 0;
    setPricePerMeterInput(cleanVal);
    
    if (area > 0) {
      const calculatedTotal = Math.round(perMeterNum * area);
      props.setPrice(calculatedTotal > 0 ? calculatedTotal.toString() : "");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">قیمت و موقعیت</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isRent && (
          <div className="col-span-1 md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-7">
            💡 برای آگهی اجاره، مبلغ <strong>رهن/ودیعه</strong> و <strong>اجاره‌ی ماهیانه</strong> در مرحله‌ی «مشخصات» وارد شده است؛ «قیمت کل» لازم نیست.
          </div>
        )}
        {!isRent && <Field label="نوع قیمت">
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "fixed", l: "ثابت" },
              { v: "negotiable", l: "توافقی" },
              { v: "per_meter", l: "متری" },
            ] as const).map((o) => (
              <button key={o.v} onClick={() => props.setPriceType(o.v)} className={`py-2 rounded-lg border-2 text-sm ${props.priceType === o.v ? "border-blue-500 bg-blue-50 font-bold" : "border-slate-200"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </Field>}
        {!isRent && props.priceType !== "negotiable" && (
          <>
            {area > 0 ? (
              <div className="col-span-1 md:col-span-2 bg-blue-50/40 border border-blue-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 text-xs font-semibold text-blue-700 flex flex-wrap items-center justify-between gap-2">
                  <span>🧮 محاسبه خودکار بر اساس متراژ ({toFa(area)} متر مربع):</span>
                  <span className="opacity-85">فرمول: قیمت کل = قیمت هر متر × متراژ</span>
                </div>
                
                <Field label="قیمت کل (تومان)" hint={previewPrice}>
                  <input type="text" inputMode="numeric"
                    value={props.price ? toFa((+toEn(props.price)).toLocaleString("en-US")) : ""}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="input fa-num text-left font-bold" dir="ltr"
                    placeholder="مثلاً: ۵۰۰,۰۰۰,۰۰۰" />
                </Field>
                
                <Field label="قیمت هر متر (تومان)" hint={pricePerMeterInput ? formatPrice(+toEn(pricePerMeterInput)) : "—"}>
                  <input type="text" inputMode="numeric"
                    value={pricePerMeterInput ? toFa((+toEn(pricePerMeterInput)).toLocaleString("en-US")) : ""}
                    onChange={(e) => handlePerMeterChange(e.target.value)}
                    className="input fa-num text-left font-bold" dir="ltr"
                    placeholder="مثلاً: ۵,۰۰۰,۰۰۰" />
                </Field>
              </div>
            ) : (
              <Field label="مبلغ (تومان)" hint={previewPrice}>
                <input type="text" inputMode="numeric"
                  value={props.price ? toFa((+toEn(props.price)).toLocaleString("en-US")) : ""}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  className="input fa-num text-left" dir="ltr"
                  placeholder="مثلاً: ۵۰۰,۰۰۰,۰۰۰" />
              </Field>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="استان">
          <select value={props.province} onChange={(e) => { props.setProvince(e.target.value); props.setCity(""); }} className="input">
            <option value="">انتخاب استان</option>
            {PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="شهر">
          <select value={props.city} onChange={(e) => { props.setCity(e.target.value); props.setNeighborhood(""); }} disabled={!props.province} className="input disabled:bg-slate-50">
            <option value="">انتخاب شهر</option>
            {cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="محله (اختیاری)">
        <input
          value={props.neighborhood}
          onChange={(e) => props.setNeighborhood(e.target.value)}
          disabled={!props.city}
          list="kb-neighborhoods"
          className="input disabled:bg-slate-50"
          placeholder={props.city ? "محله را انتخاب یا تایپ کنید" : "ابتدا شهر را انتخاب کنید"}
        />
        <datalist id="kb-neighborhoods">
          {getNeighborhoods(props.city).map((n: string) => <option key={n} value={n} />)}
        </datalist>
      </Field>

      <Field label="آدرس دقیق (اختیاری)" hint="خودتان دقیق‌ترین آدرس را تایپ کنید؛ انتخاب روی نقشه فقط پیشنهاد می‌دهد و آدرس تایپی شما را پاک نمی‌کند">
        <input value={props.address} onChange={(e) => props.setAddress(e.target.value)} className="input" placeholder="مثلاً: خیابان ولیعصر، کوچه ۱۲، پلاک ۸" />
        {suggestedAddress && suggestedAddress !== props.address && (
          <div className="mt-1.5 flex items-center gap-2 text-xs bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
            <span className="text-blue-700 flex-1">📍 آدرس پیشنهادی نقشه: {suggestedAddress}</span>
            <button type="button" onClick={() => props.setAddress(suggestedAddress)} className="shrink-0 px-2 py-1 bg-blue-600 text-white rounded-md font-semibold">استفاده</button>
          </div>
        )}
      </Field>

      <Field label="موقعیت روی نقشه">
        <div className="rounded-xl overflow-hidden border border-stone-200">
          <MapView
            className="w-full"
            height="320px"
            center={
              props.coords ? [props.coords.lat, props.coords.lng]
              : areaCenter ? [areaCenter.lat, areaCenter.lng]
              : undefined
            }
            zoom={props.coords ? 16 : areaCenter ? (props.neighborhood ? 15 : 13) : 13}
            markers={props.coords ? [{ lat: props.coords.lat, lng: props.coords.lng, color: "#C8A951" }] : []}
            onClick={(lat, lng) => props.setCoords({ lat, lng })}
            onAddress={(addr) => { setSuggestedAddress(addr); if (!props.address) props.setAddress(addr); }}
            showGeocode={true}
            interactive={true}
          />
          <div className="bg-[var(--card-bg)] p-3 flex items-center justify-between text-xs border-t border-stone-100">
            <span className="text-stone-600">
              {props.coords ? (
                <span className="flex items-center gap-1.5 fa-num">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)] inline-block" />
                  {props.address || `${toFa(props.coords.lat.toFixed(5))} , ${toFa(props.coords.lng.toFixed(5))}`}
                </span>
              ) : (
                "🗺️ روی نقشه کلیک کن تا موقعیت دقیق انتخاب شود"
              )}
            </span>
            {props.coords && (
              <button onClick={() => { props.setCoords(null); setSuggestedAddress(""); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md font-semibold text-xs">
                حذف موقعیت
              </button>
            )}
          </div>
        </div>
      </Field>
      <InputStyle />
    </div>
  );
}

function Step6({ data, onEdit }: any) {
  const sub = useMemo(() => getSubCategory(data.catSlug, data.subSlug), [data.catSlug, data.subSlug]);
  const primary = data.images.find((i: any) => i.isPrimary) || data.images[0];
  
  const area = Number(data.fields?.area || data.fields?.building_area || data.fields?.land_area || 0);
  const totalPrice = Number(toEn(data.price)) || 0;
  const pricePerMeter = (area > 0 && totalPrice > 0) ? Math.round(totalPrice / area) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="font-bold text-slate-800">پیش‌نمایش نهایی</h2>

      {/* Preview card */}
      <div className="bg-slate-50 rounded-xl p-4 grid md:grid-cols-[200px_1fr] gap-4">
        <div className="aspect-[4/3] rounded-lg bg-white overflow-hidden grid place-items-center">
          {primary ? <img src={primary.dataUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={32} />}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 mb-2">{data.title}</h3>
          <div className="text-blue-600 font-bold mb-2 flex flex-col gap-0.5">
            {data.priceType === "negotiable" ? (
              <span>توافقی</span>
            ) : (
              <>
                <span>قیمت کل: {data.price ? formatPrice(totalPrice) : "—"}</span>
                {area > 0 && pricePerMeter > 0 && (
                  <span className="text-xs text-slate-500 font-normal">
                    قیمت هر متر: {formatPrice(pricePerMeter)}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Pin size={12} /> {data.province} — {data.city}{data.neighborhood ? ` — ${data.neighborhood}` : ""}</div>
          <div className="text-sm text-slate-700 line-clamp-3">{data.shortDesc}</div>
        </div>
      </div>

      {/* Edit shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[1,2,3,4,5].map((s) => (
          <button key={s} onClick={() => onEdit(s)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600">
            ویرایش {STEPS[s-1].label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl text-sm leading-7" style={{ backgroundColor: "rgba(200,169,81,0.1)", border: "1px solid var(--gold)", color: "var(--text-medium)" }}>
        ✅ آگهی شما رایگان منتشر می‌شود.
        پس از انتشار، آگهی در صف بررسی قرار می‌گیرد و توسط ادمین تأیید خواهد شد.
        {sub && <span className="block mt-1 text-xs">دسته: {sub.name}</span>}
      </div>
    </div>
  );
}

function Field(props: { label: string; hint?: string; children: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-700">{props.label}</label>
        {props.hint && <span className="text-[11px] text-slate-400">{props.hint}</span>}
      </div>
      {props.children}
    </div>
  );
}

function InputStyle() {
  // مقادیر با !important نوشته شده‌اند چون Preflight تیلویند (v4) با یک ترفند
  // افزایش specificity، استایل‌های ساده و بدون لایه مثل این کلاس را override می‌کند.
  return <style>{`
    .input{ width:100% !important; min-height:42px !important; padding:10px 12px !important; border:1px solid #e2e8f0 !important; border-radius:10px !important; font-size:14px !important; background:white !important; outline:none !important; transition: border-color .15s; font-family: inherit;}
    .input:focus{ border-color:#2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1)}
  `}</style>;
}

// تصویر را قبل از تبدیل به base64، کوچک و فشرده می‌کند تا هم آپلود سریع‌تر
// و هم حجم نهایی که روی سایت ذخیره/نمایش داده می‌شود کوچک‌تر باشد.
const TARGET_MAX_BYTES = 350 * 1024; // هدف: هر عکس حداکثر حدود ۳۵۰ کیلوبایت بعد از فشرده‌سازی

// بررسی می‌کند آیا تصویر واقعاً پیکسل شفاف دارد یا نه (برای تصمیم PNG نگه‌داشتن یا JPEG کردن)
function hasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // برای سرعت، فقط یک نمونه‌ی کوچک را بررسی می‌کنیم، نه کل تصویر را
    const sampleW = Math.min(width, 200);
    const sampleH = Math.min(height, 200);
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function fileToDataUrl(file: File, maxDim = 1280, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = () => resolve(reader.result as string); // اگر decode نشد، فایل اصلی را برگردان
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(reader.result as string); return; }
          ctx.drawImage(img, 0, 0, width, height);

          // PNG با شفافیت واقعی را PNG نگه می‌داریم؛ عکس‌های معمولی به JPEG فشرده تبدیل می‌شوند
          const isPng = file.type === "image/png" && hasAlpha(ctx, width, height);
          if (isPng) { resolve(canvas.toDataURL("image/png")); return; }

          // فشرده‌سازی مرحله‌ای: اگر حجم هنوز زیاد بود، کیفیت را کم‌کم پایین می‌آوریم
          let q = quality;
          let out = canvas.toDataURL("image/jpeg", q);
          let tries = 0;
          while (out.length * 0.75 > TARGET_MAX_BYTES && q > 0.4 && tries < 5) {
            q -= 0.1;
            out = canvas.toDataURL("image/jpeg", q);
            tries++;
          }
          resolve(out);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
