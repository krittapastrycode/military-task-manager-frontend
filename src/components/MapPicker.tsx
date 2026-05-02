"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Navigation2, MapPin } from "lucide-react";

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});

interface LatLng { lat: number; lng: number }
interface NominatimResult { lat: string; lon: string; display_name: string }

/* ── Fix stale closure: keep refs in sync with latest state ── */
function MapClickHandler({
  placingRef,
  onPlace,
}: {
  placingRef: React.MutableRefObject<"origin" | "dest" | null>;
  onPlace: (ll: LatLng) => void;
}) {
  const onPlaceRef = useRef(onPlace);
  useEffect(() => { onPlaceRef.current = onPlace; }, [onPlace]);

  useMapEvents({
    click(e) {
      if (placingRef.current) {
        onPlaceRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

/* ── Nominatim autocomplete search input ── */
function SearchInput({
  placeholder,
  dotColor,
  onSelect,
}: {
  placeholder: string;
  dotColor: string;
  onSelect: (r: NominatimResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { "Accept-Language": "th,en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchResults(query), 450);
    return () => clearTimeout(timerRef.current);
  }, [query, fetchResults]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="flex-1 text-sm outline-none bg-transparent"
          placeholder={placeholder}
        />
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-[9999] top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto text-sm">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-gray-700 text-xs leading-snug"
                onClick={() => {
                  onSelect(r);
                  setQuery(r.display_name.split(",").slice(0, 2).join(", "));
                  setOpen(false);
                }}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Main MapPicker ── */
export default function MapPicker({ onChange }: { onChange: (url: string) => void }) {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [dest, setDest] = useState<LatLng | null>(null);
  const [placing, setPlacing] = useState<"origin" | "dest" | null>(null);

  // Ref keeps latest value visible inside MapClickHandler's stale closure
  const placingRef = useRef<"origin" | "dest" | null>(null);
  useEffect(() => { placingRef.current = placing; }, [placing]);

  const buildUrl = useCallback((o: LatLng | null, d: LatLng | null) => {
    if (!o && !d) return "";
    if (o && d) return `https://www.google.com/maps/dir/?api=1&origin=${o.lat},${o.lng}&destination=${d.lat},${d.lng}`;
    const pt = o ?? d!;
    return `https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}`;
  }, []);

  const handleOriginSelect = useCallback((r: NominatimResult) => {
    const ll: LatLng = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    setOrigin(ll);
    setDest((prev) => { onChange(buildUrl(ll, prev)); return prev; });
    setPlacing(null);
  }, [buildUrl, onChange]);

  const handleDestSelect = useCallback((r: NominatimResult) => {
    const ll: LatLng = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    setDest(ll);
    setOrigin((prev) => { onChange(buildUrl(prev, ll)); return prev; });
    setPlacing(null);
  }, [buildUrl, onChange]);

  const handleMapClick = useCallback((ll: LatLng) => {
    const current = placingRef.current;
    if (current === "origin") {
      setOrigin(ll);
      setDest((prev) => { onChange(buildUrl(ll, prev)); return prev; });
    } else if (current === "dest") {
      setDest(ll);
      setOrigin((prev) => { onChange(buildUrl(prev, ll)); return prev; });
    }
    setPlacing(null);
  }, [buildUrl, onChange]);

  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : dest
    ? [dest.lat, dest.lng]
    : [13.7563, 100.5018];

  const zoom = origin || dest ? 13 : 6;

  return (
    <div className="space-y-2">
      <SearchInput
        placeholder="ต้นทาง — ค้นหาสถานที่..."
        dotColor="#10b981"
        onSelect={handleOriginSelect}
      />
      <SearchInput
        placeholder="ปลายทาง — ค้นหาสถานที่..."
        dotColor="#ef4444"
        onSelect={handleDestSelect}
      />

      {/* Pin buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPlacing((p) => (p === "origin" ? null : "origin"))}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
            placing === "origin"
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
          }`}
        >
          <Navigation2 className="w-3 h-3" />
          {placing === "origin" ? "คลิกบนแผนที่เลย..." : "ปักต้นทาง"}
        </button>
        <button
          type="button"
          onClick={() => setPlacing((p) => (p === "dest" ? null : "dest"))}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
            placing === "dest"
              ? "bg-red-50 border-red-400 text-red-700"
              : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
          }`}
        >
          <MapPin className="w-3 h-3" />
          {placing === "dest" ? "คลิกบนแผนที่เลย..." : "ปักปลายทาง"}
        </button>

        {(origin || dest) && (
          <button
            type="button"
            onClick={() => { setOrigin(null); setDest(null); setPlacing(null); onChange(""); }}
            className="ml-auto text-xs text-gray-400 hover:text-red-500 transition"
          >
            ล้าง
          </button>
        )}
      </div>

      {/* Map */}
      <div
        className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
        style={{
          height: 220,
          cursor: placing ? "crosshair" : "grab",
        }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler placingRef={placingRef} onPlace={handleMapClick} />
          {origin && <Marker position={[origin.lat, origin.lng]} icon={greenIcon} />}
          {dest && <Marker position={[dest.lat, dest.lng]} icon={redIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}
