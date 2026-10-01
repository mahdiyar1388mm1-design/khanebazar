import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_CONFIG } from "../lib/api";

// آیکن قطره‌ای هماهنگ با هویت بصری خانه بازار (طلایی) به‌جای مارکر پیش‌فرض لیفلت
const pinIconCache = new Map<string, L.DivIcon>();
function getPinIcon(color: string): L.DivIcon {
  if (pinIconCache.has(color)) return pinIconCache.get(color)!;
  const icon = L.divIcon({
    className: "kb-map-pin-wrapper",
    html: `
      <div class="kb-map-pin">
        <svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 10.5 18.5 11.1 19.1a1.2 1.2 0 0 0 1.8 0C13.5 30.5 24 21 24 12 24 5.4 18.6 0 12 0z" fill="${color}"/>
          <circle cx="12" cy="12" r="5.5" fill="#fff"/>
        </svg>
      </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -36],
  });
  pinIconCache.set(color, icon);
  return icon;
}

export interface MapViewProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: { lat: number; lng: number; popup?: string; color?: string }[];
  onClick?: (lat: number, lng: number) => void;
  onAddress?: (address: string) => void;
  showGeocode?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
}

export function MapView(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const center = props.center || [35.699756, 51.338076];
  const zoom = props.zoom ?? 15;
  const height = props.height || "400px";

  // Reverse geocode via server proxy (نمینتیم / OpenStreetMap — رایگان)
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!propsRef.current.onAddress) return;
    setGeocoding(true);
    try {
      const base = API_CONFIG.BASE_URL || "";
      const res = await fetch(`${base}/api/map/geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        const address = data?.formatted_address || data?.address || data?.display_name || "";
        propsRef.current.onAddress?.(address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } else {
        propsRef.current.onAddress?.(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      // سرور آفلاین است — به مختصات خام برمی‌گردیم
      propsRef.current.onAddress?.(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setGeocoding(false);
    }
  };

  // ساخت نقشه — فقط یک بار
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      dragging: props.interactive !== false,
      scrollWheelZoom: props.interactive !== false,
      doubleClickZoom: props.interactive !== false,
    });

    // کاشی‌های نقشه CARTO Voyager (بر پایه OpenStreetMap) — رایگان، بدون نیاز به کلید API،
    // ظاهری تمیزتر و خواناتر از کاشی‌های استاندارد OSM
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    map.attributionControl.setPrefix(false);
    map.zoomControl.setPosition("bottomleft");

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      propsRef.current.onClick?.(lat, lng);
      if (propsRef.current.showGeocode || propsRef.current.onAddress) {
        reverseGeocode(lat, lng);
      }
    });

    mapRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // به‌روزرسانی مرکز/زوم در تغییرات بعدی
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);

  // به‌روزرسانی مارکرها
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    (props.markers || []).forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: getPinIcon(m.color || "#C8A951") });
      if (m.popup) marker.bindPopup(m.popup);
      marker.addTo(markersLayerRef.current!);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.markers)]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-stone-200 shadow-sm ${props.className || ""}`}
      style={{ height, ...(props.style || {}) }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {geocoding && (
        <div className="absolute bottom-3 right-3 bg-white/95 rounded-full px-3.5 py-2 text-xs font-medium text-stone-600 shadow-md backdrop-blur flex items-center gap-2 z-[1000]">
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--gold, #C8A951)", borderTopColor: "transparent" }}
          />
          در حال دریافت آدرس...
        </div>
      )}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse grid place-items-center z-[1000]">
          <span className="text-stone-400 text-sm flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--gold, #C8A951)", borderTopColor: "transparent" }}
            />
            در حال بارگذاری نقشه...
          </span>
        </div>
      )}
    </div>
  );
}

export { MapView as default };
