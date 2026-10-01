import { useState } from "react";
import { Link } from "../lib/Link";
import { SEOHead } from "../components/SEOHead";
import { Search, Calendar, User, Clock, ChevronLeft, Tag, Eye } from "../components/Icons";
import { toFa, timeAgo } from "../lib/format";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  author: string;
  publishedAt: number;
  readTime: number;
  views: number;
  tags: string[];
}

const BLOG_ARTICLES: Article[] = [
  {
    id: "1",
    slug: "guide-buying-first-home",
    title: "راهنمای جامع خرید اولین خانه: از صفر تا صد",
    excerpt: "خرید خانه اولین و مهم‌ترین تصمیم مالی زندگی بسیاری از افراد است. در این مقاله به نکات کلیدی برای خرید هوشمندانه ملک می‌پردازیم.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    category: "راهنمای خرید",
    author: "علی محمدی",
    publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    readTime: 8,
    views: 2450,
    tags: ["خرید خانه", "راهنمای اولین خانه", "سرمایه‌گذاری", "املاک"]
  },
  {
    id: "2",
    slug: "tehran-neighborhoods-2026",
    title: "بهترین محله‌های تهران برای خرید آپارتمان در ۱۴۰۴",
    excerpt: "بررسی کامل مناطق مختلف تهران از نظر قیمت، دسترسی، امکانات و پتانسیل رشد. مناسب‌ترین گزینه‌ها برای خانواده‌ها و سرمایه‌گذاران.",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    category: "تحلیل بازار",
    author: "سارا کریمی",
    publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    readTime: 10,
    views: 3890,
    tags: ["تهران", "محله‌های تهران", "خرید آپارتمان", "سرمایه‌گذاری"]
  },
  {
    id: "3",
    slug: "mortgage-guide-iran",
    title: "وام مسکن در ایران: شرایط، مدارک و نکات مهم",
    excerpt: "راهنمای کامل دریافت وام مسکن از بانک‌های مختلف. نحوه محاسبه اقساط، سود وام و نکات کلیدی برای دریافت سریع‌تر وام.",
    cover: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    category: "وام و تسهیلات",
    author: "محمد رضایی",
    publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    readTime: 6,
    views: 1920,
    tags: ["وام مسکن", "بانک", "تسهیلات", "خرید خانه"]
  },
  {
    id: "4",
    slug: "home-inspection-checklist",
    title: "چک‌لیست کامل بازدید فنی خانه قبل از خرید",
    excerpt: "نکات تخصصی برای بررسی فنی ملک قبل از خرید. از برق‌کشی تا نشست ساختمان، همه چیز را خودتان بررسی کنید.",
    cover: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    category: "نکات فنی",
    author: "حسن احمدی",
    publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    readTime: 7,
    views: 1560,
    tags: ["بازدید فنی", "بررسی ملک", "نکات خرید", "عیب‌یابی"]
  },
  {
    id: "5",
    slug: "rent-vs-buy-2026",
    title: "اجاره یا خرید؟ مقایسه جامع شرایط فعلی بازار",
    excerpt: "آیا در شرایط فعلی اقتصاد بهتر است خانه اجاره کنید یا بخرید؟ تحلیل کامل با محاسبات مالی و پیش‌بینی آینده.",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "تحلیل بازار",
    author: "مریم نوری",
    publishedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    readTime: 9,
    views: 4210,
    tags: ["اجاره vs خرید", "تحلیل اقتصادی", "بازار مسکن", "تصمیم‌گیری"]
  },
  {
    id: "6",
    slug: "luxury-home-features",
    title: "ویژگی‌های یک خانه لوکس و مدرن: استانداردهای ۱۴۰۴",
    excerpt: "از هوشمندسازی تا استخر و جکوزی؛ ویژگی‌هایی که یک خانه معمولی را به ملک لوکس تبدیل می‌کنند.",
    cover: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    category: "سبک زندگی",
    author: "نیکی سلطانی",
    publishedAt: Date.now(),
    readTime: 5,
    views: 980,
    tags: ["خانه لوکس", "هوشمندسازی", "معماری مدرن", "سبک زندگی"]
  }
];

const CATEGORIES = [
  { name: "همه", slug: "all" },
  { name: "راهنمای خرید", slug: "guide" },
  { name: "تحلیل بازار", slug: "market" },
  { name: "وام و تسهیلات", slug: "loan" },
  { name: "نکات فنی", slug: "technical" },
  { name: "سبک زندگی", slug: "lifestyle" },
];

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === "all" || 
      (selectedCategory === "guide" && article.category === "راهنمای خرید") ||
      (selectedCategory === "market" && article.category === "تحلیل بازار") ||
      (selectedCategory === "loan" && article.category === "وام و تسهیلات") ||
      (selectedCategory === "technical" && article.category === "نکات فنی") ||
      (selectedCategory === "lifestyle" && article.category === "سبک زندگی");
    
    const matchesSearch = article.title.includes(searchQuery) || 
      article.excerpt.includes(searchQuery) ||
      article.tags.some(tag => tag.includes(searchQuery));
    
    return matchesCategory && matchesSearch;
  });

  const totalViews = BLOG_ARTICLES.reduce((sum, a) => sum + a.views, 0);

  return (
    <div>
      <SEOHead
        title="وبلاگ خانه بازار | راهنمای خرید، فروش و اجاره ملک"
        description="جدیدترین مقالات و راهنمایی‌های تخصصی درباره خرید خانه، بازار املاک، وام مسکن و نکات حقوقی و فنی"
        keywords={["بلاگ املاک", "راهنمای خرید خانه", "نکات مسکن", "بازار املاک ایران", "وام مسکن"]}
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12" style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }} />
            <span style={{ color: "var(--gold)" }}>◆</span>
            <div className="h-[1px] w-12" style={{ background: "linear-gradient(270deg, transparent, var(--gold))" }} />
          </div>
          <h1 className="text-3xl font-extrabold mb-3" style={{ color: "var(--text-dark)" }}>
            وبلاگ خانه بازار
          </h1>
          <p className="max-w-2xl mx-auto leading-7" style={{ color: "var(--text-medium)" }}>
            راهنمای تخصصی خرید، فروش و اجاره ملک در ایران. جدیدترین تحلیل‌های بازار، نکات حقوقی و فنی
          </p>
          <div className="mt-4 text-sm" style={{ color: "var(--text-light)" }}>
            {toFa(BLOG_ARTICLES.length)} مقاله | {toFa(totalViews.toLocaleString())} بازدید
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در مقالات..."
              className="w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone)", color: "var(--text-dark)" }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: selectedCategory === cat.slug ? "var(--gold)" : "var(--card-bg)",
                color: selectedCategory === cat.slug ? "var(--royal-blue-dark)" : "var(--text-medium)",
                border: `1px solid ${selectedCategory === cat.slug ? "var(--gold)" : "var(--stone-light)"}`
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: "var(--text-light)" }}>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-dark)" }}>
              مقاله‌ای یافت نشد
            </h3>
            <p>لطفاً عبارت دیگری جستجو کنید</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group card-achaemenid overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={article.cover} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span 
            className="px-2.5 py-1 text-[11px] font-bold rounded-md"
            style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
          >
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-bold text-lg leading-7 mb-2 line-clamp-2 group-hover:underline" style={{ color: "var(--text-dark)" }}>
          <Link to={{ name: "blog-post", slug: article.slug }}>
            {article.title}
          </Link>
        </h2>
        
        <p className="text-sm leading-6 mb-4 line-clamp-2" style={{ color: "var(--text-medium)" }}>
          {article.excerpt}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-xs" style={{ color: "var(--text-light)" }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {timeAgo(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {toFa(article.readTime)} دقیقه
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {toFa(article.views.toLocaleString())}
          </span>
        </div>
      </div>
    </article>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const article = BLOG_ARTICLES.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>مقاله یافت نشد</h1>
        <Link to={{ name: "blog" }} className="btn-gold px-6 py-3 rounded-lg inline-block">
          بازگشت به وبلاگ
        </Link>
      </div>
    );
  }

  const relatedArticles = BLOG_ARTICLES
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div>
      <SEOHead
        title={article.title}
        description={article.excerpt}
        keywords={article.tags}
        type="article"
        image={article.cover}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-light)" }}>
          <Link to={{ name: "home" }}>خانه</Link>
          <ChevronLeft size={14} />
          <Link to={{ name: "blog" }}>وبلاگ</Link>
          <ChevronLeft size={14} />
          <span style={{ color: "var(--text-dark)" }}>{article.title}</span>
        </nav>

        {/* Cover */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-8">
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 right-4 left-4 text-white">
            <span 
              className="px-3 py-1 rounded-lg text-xs font-bold mb-2 inline-block"
              style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
            >
              {article.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{article.title}</h1>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6" style={{ borderBottom: "1px solid var(--stone-light)", color: "var(--text-light)" }}>
          <span className="flex items-center gap-1">
            <User size={16} />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {timeAgo(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {toFa(article.readTime)} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {toFa(article.views.toLocaleString())} بازدید
          </span>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-10"
          style={{ color: "var(--text-dark)", lineHeight: "2" }}
        >
          <p style={{ color: "var(--text-medium)" }}>{article.excerpt}</p>
          <p className="mt-4" style={{ color: "var(--text-medium)" }}>
            برای مطالعه کامل این مقاله، لطفاً به نسخه کامل مراجعه کنید. 
            این مقاله شامل نکات تخصصی و کاربردی در زمینه {article.category} است.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Tag size={16} style={{ color: "var(--gold-dark)" }} />
          {article.tags.map(tag => (
            <span 
              key={tag}
              className="px-3 py-1 rounded-lg text-sm"
              style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-medium)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: "2px solid var(--stone-light)" }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-dark)" }}>
              مقالات مرتبط
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map(related => (
                <Link 
                  key={related.id}
                  to={{ name: "blog-post", slug: related.slug }}
                  className="p-4 rounded-xl transition"
                  style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone-light)" }}
                >
                  <h4 className="font-bold line-clamp-2 mb-2" style={{ color: "var(--text-dark)" }}>
                    {related.title}
                  </h4>
                  <span className="text-xs" style={{ color: "var(--text-light)" }}>
                    {toFa(related.readTime)} دقیقه مطالعه
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
