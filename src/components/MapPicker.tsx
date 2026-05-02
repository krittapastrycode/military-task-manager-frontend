"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, Navigation2, MapPin } from "lucide-react";

// Fix leaflet marker icons in Next.js
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface LatLng { lat: number; lng: number; label: string }
interface NominatimResult { lat: string; lon: string; display_name: string }

interface MapPickerProps {
  onChange: (url: string) => void;
}

function MapClickHandler({ placing, onPlace }: { placing: "origin" | "dest" | null; onPlace: (ll: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (placing) onPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function SearchInput({ placeholder, icon, onSelect, color }: {
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (r: NominatimResult) => void;
  color: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=th`,
        { headers: { "Accept-Language": "th,en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(query), 400);
    return () => clearTimeout(timer.current);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
        <span style={{ color }}>{icon}</span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) setOpen(false); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="flex-1 text-sm outline-none bg-transparent"
          placeholder={placeholder}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setResults([]); setOpen(false); }}>
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
        {loading && <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-[9999] top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-gray-700 text-xs leading-snug"
                onClick={() => { onSelect(r); setQuery(r.display_name.split(",")[0]); setOpen(false); }}
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

export default function MapPicker({ onChange }: MapPickerProps) {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [dest, setDest] = useState<LatLng | null>(null);
  const [placing, setPlacing] = useState<"origin" | "dest" | null>(null);

  const buildUrl = (o: LatLng | null, d: LatLng | null) => {
    if (!o && !d) return "";
    if (o && !d) return `https://www.google.com/maps/search/?api=1&query=${o.lat},${o.lng}`;
    if (!o && d) return `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${o!.lat},${o!.lng}&destination=${d!.lat},${d!.lng}`;
  };

  const handleOriginSelect = (r: NominatimResult) => {
    const ll = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name };
    setOrigin(ll);
    onChange(buildUrl(ll, dest));
    setPlacing(null);
  };

  const handleDestSelect = (r: NominatimResult) => {
    const ll = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name };
    setDest(ll);
    onChange(buildUrl(origin, ll));
    setPlacing(null);
  };

  const handleMapClick = (ll: { lat: number; lng: number }) => {
    if (placing === "origin") {
      const o = { ...ll, label: `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}` };
      setOrigin(o);
      onChange(buildUrl(o, dest));
    } else if (placing === "dest") {
      const d = { ...ll, label: `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}` };
      setDest(d);
      onChange(buildUrl(origin, d));
    }
    setPlacing(null);
  };

  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : dest
    ? [dest.lat, dest.lng]
    : [13.7563, 100.5018];

  return (
    <div className="space-y-2">
      {/* Origin search */}
      <SearchInput
        placeholder="ต้นทาง — ค้นหาสถานที่..."
        icon={<Navigation2 className="w-4 h-4" />}
        color="#10b981"
        onSelect={handleOriginSelect}
      />

      {/* Destination search */}
      <SearchInput
        placeholder="ปลายทาง — ค้นหาสถานที่..."
        icon={<MapPin className="w-4 h-4" />}
        color="#ef4444"
        onSelect={handleDestSelect}
      />

      {/* Pin on map buttons */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPlacing(placing === "origin" ? null : "origin")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition ${
            placing === "origin"
              ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-medium"
              : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {placing === "origin" ? "แตะแผนที่เพื่อปักหมุด..." : "ปักต้นทางบนแผนที่"}
        </button>
        <button
          type="button"
          onClick={() => setPlacing(placing === "dest" ? null : "dest")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition ${
            placing === "dest"
              ? "bg-red-50 border-red-400 text-red-700 font-medium"
              : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {placing === "dest" ? "แตะแผนที่เพื่อปักหมุด..." : "ปักปลายทางบนแผนที่"}
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 220 }}>
        <MapContainer
          center={center}
          zoom={origin || dest ? 13 : 6}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <MapClickHandler placing={placing} onPlace={handleMapClick} />
          {origin && <Marker position={[origin.lat, origin.lng]} icon={greenIcon} />}
          {dest && <Marker position={[dest.lat, dest.lng]} icon={redIcon} />}
        </MapContainer>
      </div>

      {(origin || dest) && (
        <button
          type="button"
          onClick={() => { setOrigin(null); setDest(null); setPlacing(null); onChange(""); }}
          className="text-xs text-gray-400 hover:text-red-500 transition"
        >
          ล้างหมุดทั้งหมด
        </button>
      )}
    </div>
  );
}
