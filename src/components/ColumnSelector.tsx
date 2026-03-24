"use client";

import { useState } from "react";
import { Columns3 } from "lucide-react";

interface Column {
  key: string;
  label: string;
}

interface ColumnSelectorProps {
  columns: readonly Column[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
  excludeKeys?: string[];
}

export default function ColumnSelector({
  columns,
  visibleColumns,
  onToggle,
  excludeKeys = ["actions"],
}: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
      >
        <Columns3 className="w-4 h-4" /> Columns
      </button>
      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-20 min-w-[180px]">
            {columns
              .filter((c) => !excludeKeys.includes(c.key))
              .map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => onToggle(col.key)}
                    className="accent-indigo-600"
                  />
                  {col.label}
                </label>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
