import { Link } from "../lib/Link";
import { Phone, Pin, ShieldCheck, Sparkles } from "../components/Icons";
import { SEOHead } from "../components/SEOHead";

export function AboutPage() {
  return (
    <Wrap title="درباره خانه بازار">
      <SEOHead
        title="درباره خانه بازار"
        description="خانه بازار مارکت‌پلیس آگهی‌محور فارسی برای خرید، فروش و اجاره املاک، خودرو و وسایل نقلیه در سراسر ایران است."
        canonical="https://khane-bazar-118.ir/about"
      />
      <div className="not-prose mb-6 overflow-hidden rounded-2xl border border-slate-200">
        <img src="/images/about-banner.jpg" alt="درباره خانه بازار" className="w-full h-56 object-cover" />
      </div>
      <p>
        <strong>خانه بازار</strong> یک مارکت‌پلیس آگهی‌محور فارسی برای خرید، فروش و اجاره
        املاک، خودرو و سایر وسایل نقلیه در ایران است. هدف ما این است که پیدا کردن خانه،
        ملک، ویلا، زمین یا خودرو برای کاربران ساده‌تر، سریع‌تر و شفاف‌تر شود.
      </p>
      <p>
        خانه بازار با تمرکز روی ثبت آگهی ساده، دسته‌بندی دقیق، جستجوی سریع، اطلاعات کامل آگهی
        و ارتباط مستقیم میان آگهی‌دهنده و متقاضی طراحی شده است. ما تلاش می‌کنیم تجربه‌ای قابل
        اعتماد و روان برای کاربران فراهم کنیم تا بتوانند با اطلاعات بهتر تصمیم بگیرند.
      </p>
      <h3>خدمات خانه بازار</h3>
      <ul>
        <li>ثبت و مشاهده آگهی‌های خرید و فروش املاک</li>
        <li>ثبت و مشاهده آگهی‌های اجاره ملک، ویلا و خودرو</li>
        <li>ثبت آگهی خودرو، موتورسیکلت و سایر وسایل نقلیه</li>
        <li>نمایش موقعیت آگهی روی نقشه</li>
        <li>امکان تماس مستقیم با آگهی‌دهنده</li>
        <li>امکان ذخیره آگهی‌ها در علاقه‌مندی‌ها</li>
      </ul>
      <h3>چرا خانه بازار؟</h3>
      <ul>
        <li>پوشش تمام استان‌ها و شهرهای ایران</li>
        <li>ثبت آگهی رایگان و بدون پیچیدگی</li>
        <li>فیلدهای اختصاصی متناسب با نوع آگهی</li>
        <li>طراحی فارسی، راست‌چین و مناسب موبایل</li>
        <li>بررسی آگهی‌ها توسط مدیریت برای افزایش اعتماد کاربران</li>
      </ul>
      <h3>اطلاعات تماس</h3>
      <ul>
        <li>شماره تماس: <strong className="fa-num">۰۹۳۹۸۲۴۲۳۰۶</strong></li>
        <li>آدرس: <strong>مشهد، توس ۳۹</strong></li>
        <li>شبکه‌های اجتماعی: در حال حاضر خانه بازار شبکه اجتماعی رسمی ندارد.</li>
      </ul>
      <h3>تعهد ما</h3>
      <p>
        خانه بازار متعهد است بستری ساده، امن و قابل اعتماد برای انتشار و مشاهده آگهی فراهم کند.
        هدف ما کمک به کاربران برای یافتن گزینه مناسب، ارتباط آسان‌تر و تصمیم‌گیری مطمئن‌تر است.
      </p>
      <h3>مجوزها و اعتماد</h3>
      <div className="not-prose flex justify-center mt-6">
        <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=744946&Code=dkuJGAaWohZuAV2g5S7ygc00vkitdgi5" className="inline-block transition-transform hover:scale-110 active:scale-95">
          <img 
            src="/images/enamad-gold.png" 
            alt="نماد اعتماد الکترونیکی" 
            style={{ height: "120px", width: "auto", cursor: "pointer", filter: "drop-shadow(0 0 8px rgba(200, 169, 81, 0.3))" }}
            data-code="dkuJGAaWohZuAV2g5S7ygc00vkitdgi5"
          />
        </a>
      </div>
    </Wrap>
  );
}

export function ContactPage() {
  return (
    <Wrap title="تماس با ما">
      <SEOHead
        title="تماس با خانه بازار"
        description="راه‌های ارتباطی با پشتیبانی خانه بازار: شماره تماس، آدرس و فرم تماس آنلاین."
        canonical="https://khane-bazar-118.ir/contact"
      />
      <p>برای ارتباط با مدیریت و پشتیبانی خانه بازار از روش‌های زیر استفاده کنید:</p>
      <div className="not-prose grid md:grid-cols-3 gap-4 my-6">
        <ContactCard icon={<Phone className="text-blue-600" size={24} />} title="تلفن پشتیبانی" value="۰۹۳۹۸۲۴۲۳۰۶" />
        <ContactCard icon={<Pin className="text-emerald-600" size={24} />} title="آدرس" value="مشهد، توس ۳۹" />
        <ContactCard icon={<ShieldCheck className="text-amber-600" size={24} />} title="گزارش تخلف" value="از دکمه گزارش در صفحه هر آگهی استفاده کنید" />
      </div>
      <h3>ساعات پاسخگویی</h3>
      <p>پشتیبانی خانه بازار همه روزه از ساعت ۹ صبح تا ۹ شب آماده پاسخگویی به کاربران است.</p>
      <h3>شبکه‌های اجتماعی</h3>
      <p>خانه بازار در حال حاضر شبکه اجتماعی رسمی ندارد. تنها راه ارتباطی رسمی، شماره تماس و فرم تماس همین سایت است.</p>
      <h3>فرم تماس</h3>
      <p>می‌توانید پیام، پیشنهاد، انتقاد یا گزارش خود را از طریق فرم زیر برای مدیریت سایت ارسال کنید.</p>
      <form className="not-prose space-y-3 mt-4 max-w-md">
        <input className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm" placeholder="نام شما" />
        <input className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm" placeholder="شماره تماس / ایمیل" />
        <textarea rows={4} className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none" placeholder="پیام شما..." />
        <button type="button" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm">ارسال پیام</button>
      </form>
    </Wrap>
  );
}

export function TermsPage() {
  return (
    <Wrap title="قوانین و مقررات">
      <SEOHead
        title="قوانین و مقررات خانه بازار"
        description="قوانین و مقررات استفاده از خانه بازار، مسئولیت آگهی‌دهندگان و حریم خصوصی کاربران."
        canonical="https://khane-bazar-118.ir/terms"
      />
      <h3>۱. مقدمه</h3>
      <p>استفاده از خانه بازار به معنای پذیرش کامل قوانین زیر است.</p>
      <h3>۲. مسئولیت آگهی‌دهنده</h3>
      <p>هر کاربری که آگهی منتشر می‌کند، مسئول صحت اطلاعات، تصاویر و قیمت اعلام‌شده در آگهی است.</p>
      <h3>۳. آگهی‌های ممنوع</h3>
      <ul>
        <li>اطلاعات ساختگی یا گمراه‌کننده</li>
        <li>تصاویر متعلق به دیگران بدون اجازه</li>
        <li>کالاهای غیرقانونی</li>
        <li>استفاده از شماره تماس‌های جعلی</li>
      </ul>
      <h3>۴. حریم خصوصی</h3>
      <p>خانه بازار اطلاعات شخصی شما را مطابق قوانین جمهوری اسلامی ایران محافظت می‌کند.</p>
      <h3>۵. تغییرات قوانین</h3>
      <p>این قوانین ممکن است در هر زمان توسط مدیریت سایت به‌روزرسانی شوند.</p>
    </Wrap>
  );
}

export function FaqPage() {
  const items = [
    { q: "ثبت آگهی در خانه بازار رایگان است؟", a: "بله، ثبت آگهی در خانه بازار رایگان است و فعلاً هیچ هزینه‌ای برای انتشار آگهی دریافت نمی‌شود." },
    { q: "چطور با فروشنده تماس بگیرم؟", a: "در صفحه هر آگهی، با کلیک بر روی «نمایش شماره تماس» می‌توانید با فروشنده تماس بگیرید. همچنین امکان ارسال پیام نیز وجود دارد." },
    { q: "آگهی‌ها چقدر فعال می‌مانند؟", a: "هر آگهی پس از ثبت و تأیید، به مدت ۳۰ روز فعال می‌ماند و در آینده امکان تمدید نیز اضافه خواهد شد." },
    { q: "آیا می‌توانم آگهی خود را حذف کنم؟", a: "بله، در پنل کاربری از بخش آگهی‌های من می‌توانید آگهی خود را حذف کنید." },
    { q: "اطلاعات من امن است؟", a: "بله، اطلاعات شخصی کاربران با دقت نگهداری می‌شود و برای اهداف غیرمرتبط استفاده نمی‌شود." },
    { q: "آدرس و شماره تماس خانه بازار چیست؟", a: "شماره تماس خانه بازار ۰۹۳۹۸۲۴۲۳۰۶ و آدرس ما مشهد، توس ۳۹ است." },
    { q: "آیا خانه بازار شبکه اجتماعی رسمی دارد؟", a: "خیر، در حال حاضر خانه بازار شبکه اجتماعی رسمی ندارد و تنها راه ارتباطی رسمی شماره تماس و فرم تماس سایت است." },
    { q: "رمز عبورم را فراموش کرده‌ام، چه کنم؟", a: "برای بازیابی رمز عبور با پشتیبانی خانه بازار به شماره ۰۹۳۹۸۲۴۲۳۰۶ تماس بگیرید." },
    { q: "چطور ثبت‌نام کنم؟", a: "در صفحه ورود، روی تب «ثبت‌نام» بزنید، شماره موبایل، نام و رمز عبور خود را وارد کنید." },
  ];
  return (
    <Wrap title="سوالات متداول">
      <SEOHead
        title="سوالات متداول خانه بازار"
        description="پاسخ به پرسش‌های رایج درباره ثبت آگهی، تماس با فروشنده، حریم خصوصی و نحوه استفاده از خانه بازار."
        canonical="https://khane-bazar-118.ir/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a },
          })),
        }}
      />
      <div className="not-prose space-y-3">
        {items.map((it, i) => (
          <details key={i} className="bg-white border border-slate-200 rounded-xl p-4 group">
            <summary className="font-bold text-slate-800 cursor-pointer flex items-center gap-2">
              <Sparkles className="text-blue-500" size={18} /> {it.q}
            </summary>
            <p className="text-sm text-slate-600 leading-7 mt-3 pr-7">{it.a}</p>
          </details>
        ))}
      </div>
    </Wrap>
  );
}

export function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <SEOHead title="صفحه پیدا نشد" description="صفحه‌ی مورد نظر یافت نشد." noindex />
      <div className="text-7xl mb-4">404</div>
      <h1 className="font-extrabold text-2xl mb-3 text-slate-800">۴۰۴ - صفحه پیدا نشد</h1>
      <p className="text-slate-500 mb-6">صفحه‌ای که دنبالش بودید وجود ندارد یا حذف شده است.</p>
      <Link to={{ name: "home" }} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">بازگشت به خانه</Link>
    </div>
  );
}

function Wrap(props: { title: string; children: any }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-2xl text-slate-800 mb-5">{props.title}</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-8 prose-li:text-slate-600 prose-li:leading-8" style={{ direction: "rtl" }}>
        {props.children}
      </div>
    </div>
  );
}

function ContactCard(props: { icon: any; title: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-white grid place-items-center mb-2">{props.icon}</div>
      <div className="font-bold text-sm text-slate-800 mb-1">{props.title}</div>
      <div className="text-xs text-slate-500 leading-6 fa-num">{props.value}</div>
    </div>
  );
}