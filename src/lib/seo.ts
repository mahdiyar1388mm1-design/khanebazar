// SEO utilities for Khaneh Bazaar

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
}

export const DEFAULT_SEO: SeoConfig = {
  title: "خانه بازار | خرید، فروش و اجاره املاک و خودرو در ایران",
  description: "بزرگ‌ترین مارکت‌پلیس آگهی محور ایران. خرید، فروش و اجاره املاک، آپارتمان، ویلا، خودرو و موتورسیکلت در سراسر کشور با تضمین امنیت و بدون واسطه.",
  canonical: "https://khane-bazar-118.ir/",
  keywords: [
    "خرید خانه",
    "فروش آپارتمان",
    "اجاره ملک",
    "خرید خودرو",
    "املاک تهران",
    "آپارتمان فروشی",
    "ویلا فروشی",
    "زمین فروشی",
    "خانه بازار",
    "نیازمندی‌های املاک",
  ],
  image: "https://khane-bazar-118.ir/images/logo.png",
  type: "website",
};

export function generateMetaTags(config: Partial<SeoConfig> = {}): string {
  const seo = { ...DEFAULT_SEO, ...config };
  const fullTitle = seo.title.includes("خانه بازار") ? seo.title : `${seo.title} | خانه بازار`;
  
  const keywords = seo.keywords || DEFAULT_SEO.keywords || [];
  return `
    <title>${fullTitle}</title>
    <meta name="description" content="${seo.description}" />
    <meta name="keywords" content="${keywords.join(", ")}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:type" content="${seo.type}" />
    <meta property="og:image" content="${seo.image || DEFAULT_SEO.image}" />
    <meta property="og:site_name" content="خانه بازار" />
    <meta property="og:locale" content="fa_IR" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${seo.image || DEFAULT_SEO.image}" />
    
    ${seo.canonical ? `<link rel="canonical" href="${seo.canonical}" />` : ""}
  `.trim();
}

export function generateJsonLd(listing?: any): string {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "خانه بازار",
    alternateName: "Khaneh Bazaar",
    url: "https://khane-bazar-118.ir",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://khane-bazar-118.ir/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "خانه بازار",
    url: "https://khane-bazar-118.ir",
    logo: "https://khane-bazar-118.ir/images/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "پشتیبانی",
      availableLanguage: "Persian",
      telephone: "+989398242306",
      areaServed: "IR",
    },
  };

  const items = [website, org];

  if (listing) {
    const isRealEstate = ["real-estate", "rent"].includes(listing.categorySlug);
    const schema: any = {
      "@context": "https://schema.org",
      "@type": isRealEstate ? "RealEstateListing" : "Product",
      name: listing.title,
      description: listing.shortDescription,
      url: `https://khane-bazar-118.ir/listing/${listing.id}`,
      image: listing.images?.[0]?.dataUrl,
      datePublished: new Date(listing.createdAt).toISOString(),
      dateModified: new Date(listing.updatedAt || listing.createdAt).toISOString(),
    };

    if (isRealEstate) {
      schema.address = {
        "@type": "PostalAddress",
        addressLocality: listing.city,
        addressRegion: listing.province,
        addressCountry: "IR",
      };
      schema.geo = listing.lat && listing.lng ? {
        "@type": "GeoCoordinates",
        latitude: listing.lat,
        longitude: listing.lng,
      } : undefined;
    }

    if (listing.price && listing.price > 0) {
      schema.offers = {
        "@type": "Offer",
        price: listing.price.toString(),
        priceCurrency: "IRR",
        availability: listing.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      };
    }

    items.push(schema);
  }

  return JSON.stringify(items);
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  tags: string[];
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "خانه بازار",
      logo: {
        "@type": "ImageObject",
        url: "https://khane-bazar-118.ir/images/logo.png",
      },
    },
    keywords: article.tags.join(", "),
    url: article.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  });
}
