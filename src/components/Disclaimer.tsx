import { Info } from "./Icons";

/**
 * توضیح کوتاه سلب مسئولیت که در انتهای بخش نمایش آگهی‌ها نشان داده می‌شود.
 */
export function ListingDisclaimer() {
  return (
    <div
      className="max-w-3xl mx-auto mt-10 rounded-xl p-4 flex items-start gap-3 text-xs md:text-[13px] leading-7"
      style={{
        backgroundColor: "rgba(200,169,81,0.08)",
        border: "1px solid rgba(200,169,81,0.35)",
        color: "var(--text-medium)",
      }}
    >
      <Info size={18} className="shrink-0 mt-0.5" style={{ color: "var(--gold-dark)" }} />
      <p>
        <strong style={{ color: "var(--text-dark)" }}>سلب مسئولیت:</strong>{" "}
        مسئولیت صحت، اصالت و محتوای هر آگهی بر عهده‌ی کاربر ثبت‌کننده‌ی آن است.
        «خانه بازار» تنها بستری برای نمایش آگهی‌هاست و در معاملات میان کاربران نقشی ندارد.
        لطفاً پیش از هرگونه پرداخت یا توافق، اطلاعات را با دقت بررسی کنید و جانب احتیاط را رعایت نمایید.
      </p>
    </div>
  );
}
