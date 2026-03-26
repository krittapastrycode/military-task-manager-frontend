"use client";

interface Props {
  value?: string;
  onChange?: (val: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export default function TimeInput24H({ value, onChange }: Props) {
  const [hh, mm] = (value || "00:00").split(":");

  const handleHour = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(`${e.target.value}:${mm || "00"}`);
  };

  const handleMinute = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(`${hh || "00"}:${e.target.value}`);
  };

  return (
    <div className="flex items-center gap-1">
      <select
        value={hh || "00"}
        onChange={handleHour}
        className="border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-14"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-gray-500 font-medium">:</span>
      <select
        value={mm || "00"}
        onChange={handleMinute}
        className="border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-14"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
