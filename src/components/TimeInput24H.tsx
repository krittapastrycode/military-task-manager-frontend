"use client";

interface Props {
  value?: string;
  onChange?: (val: string) => void;
}

export default function TimeInput24H({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="HH:mm"
      maxLength={5}
      className="border border-gray-300 rounded px-2 py-1 text-sm w-[72px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}
