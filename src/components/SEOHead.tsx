import { useEffect } from "react";
import type { SeoConfig } from "../lib/seo";
import { generateJsonLd, DEFAULT_SEO } from "../lib/seo";

export function SEOHead(props: SeoConfig & { jsonLd?: any; breadcrumbs?: { name: string; url: string }[] }) {
  const seo = { ...DEFAULT_SEO, ...props };
  const fullTitle = seo.title.includes("خانه بازار") ? seo.title : `${seo.title} | خانه بازار`;

  useEffect(() => {
    // Force HTTPS in production (except localhost)
    if (typeof window !== "undefined") {
      const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (!isLocal && window.location.protocol === "http:") {
        window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
        return;
      }
    }

    // Update document title
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (selector: string, content: string, property = false) => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        if (property) tag.setAttribute("property", selector.replace('meta[property="', "").replace('"]', ""));
        else tag.setAttribute("name", selector.replace('meta[name="', "").replace('"]', ""));
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Standard meta tags
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[name="keywords"]', (seo.keywords || DEFAULT_SEO.keywords || []).join(", "));
    setMeta('meta[name="robots"]', seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Open Graph
    setMeta('meta[property="og:title"]', fullTitle, true);
    setMeta('meta[property="og:description"]', seo.description, true);
    setMeta('meta[property="og:type"]', seo.type || "website", true);
    setMeta('meta[property="og:image"]', seo.image || DEFAULT_SEO.image || "", true);
    setMeta('meta[property="og:site_name"]', "خانه بازار", true);
    setMeta('meta[property="og:locale"]', "fa_IR", true);

    // Twitter
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', seo.description);
    setMeta('meta[name="twitter:image"]', seo.image || DEFAULT_SEO.image || "");

    // Canonical
    if (seo.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = seo.canonical;
    }

    // JSON-LD structured data
    const jsonLdRaw = props.jsonLd || generateJsonLd();
    const jsonLdData = typeof jsonLdRaw === "string" ? jsonLdRaw : JSON.stringify(jsonLdRaw);
    let script = document.getElementById("json-ld-data") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "json-ld-data";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = jsonLdData;

    // Breadcrumb JSON-LD
    if (props.breadcrumbs) {
      const breadcrumbScriptId = "breadcrumb-ld-data";
      let breadcrumbScript = document.getElementById(breadcrumbScriptId) as HTMLScriptElement | null;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement("script");
        breadcrumbScript.id = breadcrumbScriptId;
        breadcrumbScript.type = "application/ld+json";
        document.head.appendChild(breadcrumbScript);
      }
      import("../lib/seo").then(({ generateBreadcrumbSchema }) => {
        breadcrumbScript.textContent = generateBreadcrumbSchema(props.breadcrumbs!);
      });
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, [fullTitle, seo.description, seo.keywords, seo.image, seo.canonical, seo.type, props.jsonLd, props.breadcrumbs]);

  return null;
}
