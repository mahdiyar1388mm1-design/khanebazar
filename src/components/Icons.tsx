// Lightweight inline SVG icons (no library)
type P = { className?: string; size?: number; style?: React.CSSProperties };

const ic = (size = 20, cls = "") => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, className: cls,
});

export const Search = (p: P) => <svg {...ic(p.size, p.className)}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
export const Plus = (p: P) => <svg {...ic(p.size, p.className)}><path d="M12 5v14M5 12h14"/></svg>;
export const Heart = (p: P & { filled?: boolean }) => <svg {...ic(p.size, p.className)} fill={p.filled ? "currentColor" : "none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
export const Chat = (p: P) => <svg {...ic(p.size, p.className)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
export const User = (p: P) => <svg {...ic(p.size, p.className)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
export const Bell = (p: P) => <svg {...ic(p.size, p.className)}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>;
export const Menu = (p: P) => <svg {...ic(p.size, p.className)}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
export const X = (p: P) => <svg {...ic(p.size, p.className)}><path d="M18 6 6 18M6 6l12 12"/></svg>;
export const Phone = (p: P) => <svg {...ic(p.size, p.className)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
export const Map = (p: P) => <svg {...ic(p.size, p.className)}><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/></svg>;
export const Pin = (p: P) => <svg {...ic(p.size, p.className)}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>;
export const Eye = (p: P) => <svg {...ic(p.size, p.className)}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
export const Camera = (p: P) => <svg {...ic(p.size, p.className)}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
export const Trash = (p: P) => <svg {...ic(p.size, p.className)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>;
export const Edit = (p: P) => <svg {...ic(p.size, p.className)}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
export const Check = (p: P) => <svg {...ic(p.size, p.className)}><path d="M20 6 9 17l-5-5"/></svg>;
export const ArrowLeft = (p: P) => <svg {...ic(p.size, p.className)}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
export const ArrowRight = (p: P) => <svg {...ic(p.size, p.className)}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
export const ChevronDown = (p: P) => <svg {...ic(p.size, p.className)}><path d="m6 9 6 6 6-6"/></svg>;
export const ChevronLeft = (p: P) => <svg {...ic(p.size, p.className)}><path d="m15 18-6-6 6-6"/></svg>;
export const Star = (p: P & { filled?: boolean }) => <svg {...ic(p.size, p.className)} fill={p.filled ? "currentColor" : "none"}><path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/></svg>;
export const Fire = (p: P) => <svg {...ic(p.size, p.className)}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17v0a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-2-2.5-4.5C11 7 14 5 14 5s-1 3 1 5c2 2 3 3 3 5a6 6 0 0 1-12 0c0-3 4-7 4-7s.5 2.5-1.5 6.5z"/></svg>;
export const Settings = (p: P) => <svg {...ic(p.size, p.className)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.16.65.42.85.74"/></svg>;
export const LogOut = (p: P) => <svg {...ic(p.size, p.className)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
export const Share = (p: P) => <svg {...ic(p.size, p.className)}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>;
export const Filter = (p: P) => <svg {...ic(p.size, p.className)}><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>;
export const Send = (p: P) => <svg {...ic(p.size, p.className)}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>;
export const Home = (p: P) => <svg {...ic(p.size, p.className)}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>;
export const Database = (p: P) => <svg {...ic(p.size, p.className)}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
export const Server = (p: P) => <svg {...ic(p.size, p.className)}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg>;
export const ShieldCheck = (p: P) => <svg {...ic(p.size, p.className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
export const Sparkles = (p: P) => <svg {...ic(p.size, p.className)}><path d="m12 3-1.5 5L5 9.5 10.5 11 12 16l1.5-5L19 9.5 13.5 8z"/></svg>;
export const Grid = (p: P) => <svg {...ic(p.size, p.className)}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
export const Image = (p: P) => <svg {...ic(p.size, p.className)}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
export const Calendar = (p: P) => <svg {...ic(p.size, p.className)}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
export const Tag = (p: P) => <svg {...ic(p.size, p.className)}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg>;
export const Copy = (p: P) => <svg {...ic(p.size, p.className)}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
export const Info = (p: P) => <svg {...ic(p.size, p.className)}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
export const Download = (p: P) => <svg {...ic(p.size, p.className)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
export const AlertTriangle = (p: P) => <svg {...ic(p.size, p.className)}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>;
export const Clock = (p: P) => <svg {...ic(p.size, p.className)}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
