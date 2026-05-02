"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Link2, Navigation2, ExternalLink, MapPin, Loader2 } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50" style={{ height: 300 }}>
      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  ),
});

interface MapLinkFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function MapLinkField({ value, onChange, required }: MapLinkFieldProps) {
  const [mode, setMode] = useState<"map" | "url">("map");

  const switchMode = (m: "map" | "url") => {
    setMode(m);
    if (m === "map") onChange("");
  };

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => switchMode("map")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === "map" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Navigation2 className="w-3.5 h-3.5" />
          เลือกบนแผนที่
        </button>
        <button
          type="button"
          onClick={() => switchMode("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === "url" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          วางลิงก์เอง
        </button>
      </div>

      {mode === "map" ? (
        <MapPicker onChange={onChange} />
      ) : (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
            placeholder="วางลิงก์ Google Maps ที่นี่..."
          />
        </div>
      )}

      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          <ExternalLink className="w-3 h-3" />
          เปิดดูเส้นทางใน Google Maps
        </a>
      )}
    </div>
  );
}
