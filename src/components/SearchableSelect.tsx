"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "เลือกหรือค้นหา...",
  required,
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between gap-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span onClick={handleClear} className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[99999] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">ไม่พบข้อมูล</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                    value === option ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-800"
                  }`}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Hidden input for form required validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
