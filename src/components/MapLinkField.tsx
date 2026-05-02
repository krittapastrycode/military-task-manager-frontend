"use client";

import { useState, useEffect } from "react";
import { MapPin, Link2, Navigation2, ExternalLink, ArrowDown } from "lucide-react";

interface MapLinkFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

type Mode = "url" | "route";

export default function MapLinkField({ value, onChange, required }: MapLinkFieldProps) {
  const [mode, setMode] = useState<Mode>("route");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // When switching to URL mode, keep existing value
  // When switching to route mode, parse back if possible
  useEffect(() => {
    if (mode === "url") return;
    // Try to parse existing Google Maps dir URL into origin/destination
    if (value?.includes("maps/dir/")) {
      try {
        const url = new URL(value);
        const params = url.searchParams;
        if (params.get("origin")) setOrigin(decodeURIComponent(params.get("origin")!));
        if (params.get("destination")) setDestination(decodeURIComponent(params.get("destination")!));
      } catch {}
    }
  }, [mode]);

  const buildDirectionsUrl = (from: string, to: string): string => {
    if (!from && !to) return "";
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
  };

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    onChange(buildDirectionsUrl(val, destination));
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    onChange(buildDirectionsUrl(origin, val));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    if (m === "route") {
      // Reset to route builder
      setOrigin("");
      setDestination("");
      onChange("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-full">
        <button
          type="button"
          onClick={() => switchMode("route")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === "route"
              ? "bg-white shadow text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Navigation2 className="w-3.5 h-3.5" />
          เลือกต้นทาง–ปลายทาง
        </button>
        <button
          type="button"
          onClick={() => switchMode("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === "url"
              ? "bg-white shadow text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          วางลิงก์เอง
        </button>
      </div>

      {mode === "route" ? (
        <div className="space-y-1.5">
          {/* Origin */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 flex-shrink-0" />
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
              placeholder="ต้นทาง — พิมพ์ชื่อสถานที่หรือที่อยู่..."
            />
          </div>

          {/* Arrow between */}
          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Destination */}
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
              placeholder="ปลายทาง — พิมพ์ชื่อสถานที่หรือที่อยู่..."
            />
          </div>
        </div>
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

      {/* Preview link */}
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
