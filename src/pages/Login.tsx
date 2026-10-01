import { useState } from "react";
import { loginUser, registerUser } from "../lib/store";
import { navigate } from "../lib/router";
import { Phone, ShieldCheck, User as UserIcon, Check, Info } from "../components/Icons";
import { toEn } from "../lib/format";
import { toast } from "../components/Toast";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enPhone = toEn(phone).replace(/\D/g, "");
    if (!/^09\d{9}$/.test(enPhone)) {
      toast("شماره موبایل نامعتبر است (مثلاً ۰۹۱۲۳۴۵۶۷۸۹)", "error");
      return;
    }
    if (password.length < 4) {
      toast("رمز عبور باید حداقل ۴ کاراکتر باشد", "error");
      return;
    }
    if (mode === "register" && name.trim().length < 2) {
      toast("نام باید حداقل ۲ حرف باشد", "error");
      return;
    }
    const enNational = toEn(nationalCode).replace(/\D/g, "");
    if (mode === "register" && !/^\d{10}$/.test(enNational)) {
      toast("کد ملی باید ۱۰ رقم باشد", "error");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await loginUser(enPhone, password);
        toast("🎉 خوش آمدید!", "success");
      } else {
        await registerUser(enPhone, password, name.trim(), enNational);
        toast("🎉 ثبت‌نام با موفقیت انجام شد", "success");
      }
      navigate({ name: "dashboard" });
    } catch (err: any) {
      toast(err.message || "خطا در عملیات", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-8">
      <div className="w-full max-w-md card-achaemenid shadow-lg p-6 md:p-8">
        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden mb-6 border" style={{ borderColor: "var(--stone)" }}>
          <button
            onClick={() => setMode("login")}
            className="flex-1 py-2.5 text-sm font-bold transition"
            style={{
              backgroundColor: mode === "login" ? "var(--gold)" : "transparent",
              color: mode === "login" ? "var(--royal-blue-dark)" : "var(--text-medium)",
            }}
          >
            ورود
          </button>
          <button
            onClick={() => setMode("register")}
            className="flex-1 py-2.5 text-sm font-bold transition"
            style={{
              backgroundColor: mode === "register" ? "var(--gold)" : "transparent",
              color: mode === "register" ? "var(--royal-blue-dark)" : "var(--text-medium)",
            }}
          >
            ثبت‌نام
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center mb-4" style={{ background: "linear-gradient(135deg, var(--royal-blue), var(--royal-blue-light))", color: "var(--gold)" }}>
            {mode === "login" ? <ShieldCheck size={28} /> : <UserIcon size={28} />}
          </div>
          <h1 className="font-extrabold text-xl" style={{ color: "var(--text-dark)" }}>
            {mode === "login" ? "ورود به خانه بازار" : "ثبت‌نام در خانه بازار"}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-medium)" }}>
            {mode === "login"
              ? "شماره موبایل و رمز عبور خود را وارد کنید"
              : "برای ثبت‌نام، اطلاعات خود را وارد کنید"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(toEn(e.target.value).replace(/\D/g, "").slice(0, 11))}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="w-full h-14 px-4 pr-12 rounded-xl outline-none text-center text-lg fa-num tracking-widest font-bold transition"
              style={{ border: "2px solid var(--stone)", backgroundColor: "white", color: "var(--text-dark)" }}
              dir="ltr"
              onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--stone)"; }}
              maxLength={11}
            />
            <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--gold-dark)" }} />
          </div>

          {/* Name (register only) */}
          {mode === "register" && (
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                className="w-full h-14 px-4 pr-12 rounded-xl outline-none text-center text-lg font-bold transition"
                style={{ border: "2px solid var(--stone)", backgroundColor: "white", color: "var(--text-dark)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--stone)"; }}
              />
              <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--gold-dark)" }} />
            </div>
          )}

          {/* National code (register only) */}
          {mode === "register" && (
            <div className="relative">
              <input
                type="tel"
                value={nationalCode}
                onChange={(e) => setNationalCode(toEn(e.target.value).replace(/\D/g, "").slice(0, 10))}
                placeholder="کد ملی (۱۰ رقم)"
                className="w-full h-14 px-4 pr-12 rounded-xl outline-none text-center text-lg fa-num tracking-widest font-bold transition"
                style={{ border: "2px solid var(--stone)", backgroundColor: "white", color: "var(--text-dark)" }}
                dir="ltr"
                onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--stone)"; }}
                maxLength={10}
              />
              <ShieldCheck size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--gold-dark)" }} />
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "رمز عبور" : "رمز عبور (حداقل ۴ کاراکتر)"}
              className="w-full h-14 px-4 pr-12 rounded-xl outline-none text-center text-lg font-bold transition"
              style={{ border: "2px solid var(--stone)", backgroundColor: "white", color: "var(--text-dark)" }}
              dir="ltr"
              onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--stone)"; }}
            />
            <ShieldCheck size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--gold-dark)" }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 btn-gold"
          >
            {loading ? (
              <><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> در حال پردازش...</>
            ) : (
              <><Check size={16} /> {mode === "login" ? "ورود" : "ثبت‌نام"}</>
            )}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-lg text-xs flex gap-2" style={{ backgroundColor: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)", color: "var(--text-medium)" }}>
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: "var(--gold-dark)" }} />
          <div>
            <strong style={{ color: "var(--text-dark)" }}>نکته:</strong> در صورت فراموشی رمز عبور، با پشتیبانی تماس بگیرید.
            <br />
            شماره تماس: <span className="fa-num font-bold" style={{ color: "var(--gold-dark)" }}>۰۹۳۹۸۲۴۲۳۰۶</span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs leading-6" style={{ color: "var(--text-light)" }}>
          با {mode === "login" ? "ورود" : "ثبت‌نام"}، <a href="/terms" className="font-semibold hover:underline" style={{ color: "var(--gold-dark)" }}>قوانین و حریم خصوصی</a> خانه بازار را می‌پذیرم
        </div>
      </div>
    </div>
  );
}
