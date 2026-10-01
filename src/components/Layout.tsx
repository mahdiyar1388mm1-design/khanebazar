import { useState, type ReactNode } from "react";
import { Link } from "../lib/Link";
import { navigate, useRoute } from "../lib/router";
import { useCurrentUser, setCurrentUser, useNotifications } from "../lib/store";
import { Bell, Chat, Download, Heart, Home, Menu, Plus, Search, User, X, LogOut, Server, Grid } from "./Icons";
import { isNativeApp } from "../lib/native";

export function Layout(props: { children: ReactNode }) {
  const route = useRoute();
  const user = useCurrentUser();
  // داخل اپلیکیشن مستقل، لینک «نصب اپلیکیشن» معنی ندارد و پنهان می‌شود
  const native = isNativeApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const notifs = useNotifications(user?.id);
  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0" style={{ backgroundColor: "var(--cream)" }}>
      {/* Header - Royal Achaemenid */}
      <header className="sticky top-0 z-40" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark) 0%, var(--royal-blue) 50%, var(--royal-blue-light) 100%)" }}>
        {/* Gold trim line */}
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-dark), var(--gold), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to={{ name: "home" }} className="flex items-center gap-2.5 shrink-0">
            <img src="/images/logo.png" alt="خانه بازار" className="h-10 w-10 rounded-lg object-cover" style={{ border: "1.5px solid var(--gold)" }} />
            <div className="hidden sm:block leading-tight">
              <div className="font-extrabold text-base" style={{ color: "var(--gold-light)" }}>خانه بازار</div>
              <div className="text-[10px]" style={{ color: "var(--stone)" }}>Khaneh Bazaar</div>
            </div>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBox />
          </div>

          <div className="flex-1 md:hidden" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavIcon to={{ name: "favorites" }}><Heart size={20} /></NavIcon>
            <NavIcon to={{ name: "messages" }}><Chat size={20} /></NavIcon>
            <Link to={{ name: "notifications" }} className="relative p-2.5 rounded-lg hover:bg-white/10 transition" style={{ color: "var(--stone)" }}>
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 left-1 w-2 h-2 rounded-full ring-2" style={{ backgroundColor: "var(--burgundy)", borderColor: "var(--royal-blue)" }} />
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 pr-2 pl-3 py-1.5 rounded-lg hover:bg-white/10 transition">
                  <div className="w-8 h-8 rounded-full grid place-items-center font-bold text-sm" style={{ backgroundColor: "rgba(200,169,81,0.2)", color: "var(--gold)" }}>
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate" style={{ color: "var(--stone-light)" }}>{user.name}</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone)" }}>
                  <DropdownLink to={{ name: "dashboard" }} icon={<Grid size={16} />}>داشبورد</DropdownLink>
                  <DropdownLink to={{ name: "my-listings" }} icon={<Home size={16} />}>آگهی‌های من</DropdownLink>
                  <DropdownLink to={{ name: "favorites" }} icon={<Heart size={16} />}>علاقه‌مندی‌ها</DropdownLink>
                  <DropdownLink to={{ name: "settings" }} icon={<User size={16} />}>تنظیمات حساب</DropdownLink>
                  {user.isAdmin && (
                    <DropdownLink to={{ name: "admin" }} icon={<Server size={16} />}>پنل مدیریت</DropdownLink>
                  )}
                  <div className="my-1" style={{ borderTop: "1px solid var(--stone-light)" }} />
                  <button
                    onClick={() => { setCurrentUser(null); navigate({ name: "home" }); }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2" style={{ color: "var(--burgundy)" }}
                  >
                    <LogOut size={16} /> خروج
                  </button>
                </div>
              </div>
            ) : (
              <Link to={{ name: "login" }} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition" style={{ color: "var(--gold)" }}>
                ورود / ثبت‌نام
              </Link>
            )}

            <Link
              to={{ name: "create" }}
              className="mr-2 px-4 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-sm btn-gold"
            >
              <Plus size={16} /> ثبت آگهی
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 -ml-2" style={{ color: "var(--gold)" }}>
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile search row (only on home/search) */}
        {(route.name === "home" || route.name === "search") && (
          <div className="md:hidden px-4 pb-3">
            <SearchBox />
          </div>
        )}
        {/* Bottom gold trim */}
        <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, var(--gold-dark), var(--gold), var(--gold-dark), transparent)" }} />
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 shadow-2xl animate-slide-up overflow-y-auto" style={{ backgroundColor: "var(--card-bg)" }}>
            <div className="p-3" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))" }}>
              <div className="flex items-center justify-between mb-4">
                <img src="/images/logo.png" alt="" className="h-8 rounded" />
                <button onClick={() => setMenuOpen(false)} className="p-2 -m-2" style={{ color: "var(--gold)" }}><X size={20} /></button>
              </div>
              {user ? (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(200,169,81,0.1)" }}>
                  <div className="w-10 h-10 rounded-full grid place-items-center font-bold" style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: "var(--gold-light)" }}>{user.name}</div>
                    <div className="text-xs truncate fa-num" style={{ color: "var(--stone)" }}>{user.phone}</div>
                  </div>
                </div>
              ) : (
                <Link to={{ name: "login" }} onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 rounded-lg font-semibold btn-gold">
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
            <div className="p-3 space-y-1">
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "home" }} icon={<Home size={18} />}>صفحه اصلی</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "search" }} icon={<Search size={18} />}>جستجوی آگهی</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "create" }} icon={<Plus size={18} />}>ثبت آگهی جدید</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "favorites" }} icon={<Heart size={18} />}>علاقه‌مندی‌ها</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "messages" }} icon={<Chat size={18} />}>پیام‌ها</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "notifications" }} icon={<Bell size={18} />}>اعلان‌ها</MobileLink>
              {!native && <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "app" }} icon={<Download size={18} />}>نصب اپلیکیشن</MobileLink>}
              {user && <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "dashboard" }} icon={<Grid size={18} />}>داشبورد</MobileLink>}
              {user?.isAdmin && <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "admin" }} icon={<Server size={18} />}>پنل مدیریت</MobileLink>}
              <div className="my-2" style={{ borderTop: "1px solid var(--stone-light)" }} />
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "about" }} icon={<Home size={18} />}>درباره ما</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "contact" }} icon={<Home size={18} />}>تماس با ما</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "blog" }} icon={<Home size={18} />}>وبلاگ</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "faq" }} icon={<Home size={18} />}>سوالات متداول</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "terms" }} icon={<Home size={18} />}>قوانین و مقررات</MobileLink>
              <MobileLink onClick={() => setMenuOpen(false)} to={{ name: "config" }} icon={<Server size={18} />}>پیکربندی بک‌اند</MobileLink>
              {user && (
                <button
                  onClick={() => { setCurrentUser(null); setMenuOpen(false); navigate({ name: "home" }); }}
                  className="w-full text-right px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm hover:bg-red-50" style={{ color: "var(--burgundy)" }}
                >
                  <LogOut size={18} /> خروج از حساب
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1">{props.children}</main>

      {/* Footer - Achaemenid */}
      <footer className="hidden md:block mt-12" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-dark), var(--gold), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/logo.png" alt="" className="h-9 rounded" />
              <span className="font-bold" style={{ color: "var(--gold)" }}>خانه بازار</span>
            </div>
            <p className="text-sm leading-7" style={{ color: "var(--stone)" }}>
              مارکت‌پلیس آگهی محور خرید، فروش و اجاره املاک، خودرو و وسایل نقلیه در سراسر ایران.
            </p>
          </div>
          <FooterCol title="دسته‌بندی‌ها">
            <Link to={{ name: "category", slug: "real-estate" }}>املاک</Link>
            <Link to={{ name: "category", slug: "rent" }}>اجاره</Link>
            <Link to={{ name: "category", slug: "vehicles" }}>وسایل نقلیه</Link>
          </FooterCol>
          <FooterCol title="خانه بازار">
            {!native && <Link to={{ name: "app" }}>نصب اپلیکیشن</Link>}
            <Link to={{ name: "about" }}>درباره ما</Link>
            <Link to={{ name: "contact" }}>تماس با ما</Link>
            <Link to={{ name: "blog" }}>وبلاگ</Link>
            <Link to={{ name: "terms" }}>قوانین</Link>
            <Link to={{ name: "faq" }}>سوالات متداول</Link>
          </FooterCol>
          <FooterCol title="مدیر سایت">
            <Link to={{ name: "config" }}>پیکربندی بک‌اند</Link>
            <a href="/database/schema.sql" download>دانلود اسکیمای MySQL</a>
            <a href="/backend/.env.example" download>دانلود نمونه .env</a>
          </FooterCol>
        </div>
        <div className="py-6 text-center" style={{ borderTop: "1px solid rgba(200,169,81,0.15)" }}>
          {/* نماد اعتماد الکترونیکی - نسخه طلایی هماهنگ با تم */}
          <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=744946&Code=dkuJGAaWohZuAV2g5S7ygc00vkitdgi5" className="inline-block transition-transform hover:scale-110 active:scale-95">
            <img 
              src="/images/enamad-gold.png" 
              alt="نماد اعتماد الکترونیکی" 
              style={{ height: "100px", width: "auto", cursor: "pointer", filter: "drop-shadow(0 0 8px rgba(200, 169, 81, 0.3))" }}
              data-code="dkuJGAaWohZuAV2g5S7ygc00vkitdgi5"
            />
          </a>
          <div className="mt-4 text-xs" style={{ color: "var(--stone)" }}>
            ◆ خانه بازار — با الهام از شکوه هخامنشیان ◆
          </div>
          <div className="mt-1 text-[10px]" style={{ color: "var(--stone)" }}>
            نسخه ۴٫۷ — نصب به‌صورت اپلیکیشن (PWA)
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav - Royal */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40" style={{ background: "linear-gradient(135deg, var(--royal-blue-dark), var(--royal-blue))", borderTop: "1.5px solid var(--gold-dark)" }}>
        <div className="grid grid-cols-5 h-16">
          <BottomItem to={{ name: "home" }} active={route.name === "home"} icon={<Home size={20} />} label="خانه" />
          <BottomItem to={{ name: "search" }} active={route.name === "search"} icon={<Search size={20} />} label="جستجو" />
          <BottomItem to={{ name: "create" }} active={route.name === "create"} icon={<Plus size={22} />} label="ثبت" highlight />
          <BottomItem to={{ name: "messages" }} active={route.name === "messages"} icon={<Chat size={20} />} label="پیام" />
          <BottomItem to={{ name: user ? "dashboard" : "login" }} active={route.name === "dashboard" || route.name === "login"} icon={<User size={20} />} label="من" />
        </div>
      </nav>
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ name: "search", query: q ? { q } : {} });
      }}
      className="relative"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder="جستجوی آگهی... مثلاً آپارتمان تهران"
        className="w-full h-11 pr-11 pl-4 rounded-xl text-sm transition outline-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(200,169,81,0.3)",
          color: "var(--cream)",
        }}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
    </form>
  );
}

function NavIcon(props: { to: any; children: ReactNode }) {
  return (
    <Link to={props.to} className="p-2.5 rounded-lg hover:bg-white/10 transition" style={{ color: "var(--stone)" }}>
      {props.children}
    </Link>
  );
}

function DropdownLink(props: { to: any; icon: ReactNode; children: ReactNode }) {
  return (
    <Link to={props.to} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-amber-50/60" style={{ color: "var(--text-dark)" }}>
      <span style={{ color: "var(--text-light)" }}>{props.icon}</span> {props.children}
    </Link>
  );
}

function MobileLink(props: { to: any; icon: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <Link to={props.to} onClick={props.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50/60 text-sm" style={{ color: "var(--text-dark)" }}>
      <span style={{ color: "var(--text-light)" }}>{props.icon}</span>
      <span>{props.children}</span>
    </Link>
  );
}

function FooterCol(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="font-bold mb-3 text-sm" style={{ color: "var(--gold)" }}>{props.title}</h4>
      <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--stone)" }}>
        {props.children}
      </div>
    </div>
  );
}

function BottomItem(props: { to: any; active: boolean; icon: ReactNode; label: string; highlight?: boolean }) {
  if (props.highlight) {
    return (
      <Link to={props.to} className="flex flex-col items-center justify-center -mt-5">
        <div className="w-12 h-12 rounded-full grid place-items-center shadow-lg btn-gold">
          {props.icon}
        </div>
        <span className="text-[10px] mt-1 font-semibold" style={{ color: "var(--gold)" }}>{props.label}</span>
      </Link>
    );
  }
  return (
    <Link to={props.to} className="flex flex-col items-center justify-center gap-1" style={{ color: props.active ? "var(--gold)" : "var(--stone)" }}>
      {props.icon}
      <span className="text-[10px] font-medium">{props.label}</span>
    </Link>
  );
}
