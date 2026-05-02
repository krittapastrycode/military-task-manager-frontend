"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation2, MapPin, ExternalLink } from "lucide-react";

interface Props {
  onChange: (url: string) => void;
}

export default function MapPicker({ onChange }: Props) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [embedSrc, setEmbedSrc] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (origin || destination) {
        const query = origin && destination
          ? `${origin} to ${destination}`
          : origin || destination;
        setEmbedSrc(
          `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=th`
        );
        const mapsUrl = origin && destination
          ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(origin || destination)}`;
        onChange(mapsUrl);
      } else {
        setEmbedSrc("");
        onChange("");
      }
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [origin, destination, onChange]);

  const mapsUrl = origin && destination
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    : origin || destination
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(origin || destination)}`
    : "";

  return (
    <div className="space-y-2">
      {/* Origin */}
      <div className="relative">
        <Navigation2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
          placeholder="ต้นทาง..."
        />
      </div>

      {/* Destination */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 pointer-events-none" />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
          placeholder="ปลายทาง..."
        />
      </div>

      {/* Google Maps Embed */}
      {embedSrc && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 240 }}>
          <iframe
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          <ExternalLink className="w-3 h-3" />
          เปิดใน Google Maps
        </a>
      )}
    </div>
  );
}
