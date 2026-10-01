// Path-based (history) router — با سازگاری با لینک‌های هش‌دار قدیمی (#/...)
import { useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "search"; query?: Record<string, string> }
  | { name: "category"; slug: string }
  | { name: "listing"; id: string }
  | { name: "create" }
  | { name: "login" }
  | { name: "dashboard" }
  | { name: "my-listings" }
  | { name: "messages"; conversationId?: string }
  | { name: "favorites" }
  | { name: "notifications" }
  | { name: "settings" }
  | { name: "admin" }
  | { name: "about" }
  | { name: "app" }
  | { name: "contact" }
  | { name: "terms" }
  | { name: "faq" }
  | { name: "config" }
  | { name: "blog" }
  | { name: "blog-post"; slug: string }
  | { name: "404" };

function parseSegments(path: string, qs: string): Route {
  const segs = path.split("/").filter(Boolean);
  const query: Record<string, string> = {};
  if (qs) {
    for (const pair of qs.replace(/^\?/, "").split("&")) {
      const [k, v] = pair.split("=");
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    }
  }
  switch (segs[0]) {
    case undefined: return { name: "home" };
    case "search": return { name: "search", query };
    case "category": return segs[1] ? { name: "category", slug: segs[1] } : { name: "404" };
    case "listing": return segs[1] ? { name: "listing", id: segs[1] } : { name: "404" };
    case "create": return { name: "create" };
    case "login": return { name: "login" };
    case "dashboard": return { name: "dashboard" };
    case "my-listings": return { name: "my-listings" };
    case "messages": return { name: "messages", conversationId: segs[1] };
    case "favorites": return { name: "favorites" };
    case "notifications": return { name: "notifications" };
    case "settings": return { name: "settings" };
    case "admin": return { name: "admin" };
    case "about": return { name: "about" };
    case "app": return { name: "app" };
    case "contact": return { name: "contact" };
    case "terms": return { name: "terms" };
    case "faq": return { name: "faq" };
    case "config": return { name: "config" };
    case "blog": return segs[1] ? { name: "blog-post", slug: segs[1] } : { name: "blog" };
    default: return { name: "404" };
  }
}

// سازگاری با لینک‌های قدیمی هش‌دار
export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [path, qs] = clean.split("?");
  return parseSegments(path, qs || "");
}

export function parseLocation(): Route {
  const path = window.location.pathname || "/";
  const isRoot = path === "/" || path === "/index.html";
  // اگر آدرس قدیمی هش‌دار بود (مثلاً /#/listing/12) از آن استفاده کن
  if (isRoot && window.location.hash && window.location.hash.length > 1) {
    return parseHash(window.location.hash);
  }
  return parseSegments(path, window.location.search);
}

export function buildPath(route: Route): string {
  switch (route.name) {
    case "home": return "/";
    case "search": {
      const qs = route.query
        ? "?" + Object.entries(route.query).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
        : "";
      return `/search${qs}`;
    }
    case "category": return `/category/${route.slug}`;
    case "listing": return `/listing/${route.id}`;
    case "blog-post": return `/blog/${route.slug}`;
    case "messages": return route.conversationId ? `/messages/${route.conversationId}` : "/messages";
    default: return `/${route.name}`;
  }
}

// برای سازگاری با کدهای قدیمی که buildHash صدا می‌زدند
export function buildHash(route: Route): string {
  return "#" + buildPath(route);
}

export function navigate(route: Route) {
  window.history.pushState({}, "", buildPath(route));
  window.dispatchEvent(new Event("kb:navigate"));
  try { window.scrollTo(0, 0); } catch { /* ignore */ }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseLocation());
  useEffect(() => {
    const handler = () => setRoute(parseLocation());
    window.addEventListener("popstate", handler);
    window.addEventListener("hashchange", handler);
    window.addEventListener("kb:navigate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("kb:navigate", handler);
    };
  }, []);
  return route;
}
