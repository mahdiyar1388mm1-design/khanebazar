/**
 * اسکلت لودینگ آگهی — با افکت شیمر (نور متحرک) نمایش داده می‌شود
 * تا کاربر هنگام بارگذاری آگهی‌ها احساس سرعت بیشتری داشته باشد.
 */
export function ListingCardSkeleton() {
  return (
    <div className="card-achaemenid overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] kb-shimmer" />
      <div className="p-3 flex flex-col flex-1">
        <div className="h-4 rounded kb-shimmer mb-2" style={{ width: "90%" }} />
        <div className="h-4 rounded kb-shimmer mb-3" style={{ width: "60%" }} />
        <div className="h-5 rounded kb-shimmer mb-3" style={{ width: "45%" }} />
        <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--stone-light)" }}>
          <div className="h-3 rounded kb-shimmer" style={{ width: "35%" }} />
          <div className="h-3 rounded kb-shimmer" style={{ width: "25%" }} />
        </div>
      </div>
    </div>
  );
}

/** یک شبکه از اسکلت‌ها — پیش‌فرض ۸ کارت */
export function ListingSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      <ShimmerStyle />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ animation: "kb-fade .4s ease both", animationDelay: `${i * 60}ms` }}>
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
    </>
  );
}

function ShimmerStyle() {
  return (
    <style>{`
      .kb-shimmer{ position:relative; overflow:hidden; background: var(--cream-dark, #ece7de); }
      .kb-shimmer::after{
        content:""; position:absolute; inset:0; transform: translateX(-100%);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
        animation: kb-slide 1.25s infinite;
      }
      @keyframes kb-slide{ 100%{ transform: translateX(100%);} }
      @keyframes kb-fade{ from{opacity:0; transform: translateY(6px);} to{opacity:1; transform:none;} }
    `}</style>
  );
}
