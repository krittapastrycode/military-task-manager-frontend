"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Crown,
  ShieldCheck,
  Siren,
  TrafficCone,
  Building2,
  ChevronLeft,
  ChevronDown,
  X,
  ArrowRight,
} from "lucide-react";
import {
  TASK_TYPE_CONFIG,
  TASK_TYPE_FIELDS,
  PRIORITY_CONFIG,
  TaskTypeKey,
} from "@/types";

/* ─── Icon + gradient card config per type ─── */
const TYPE_CARD_STYLES: Record<TaskTypeKey, {
  gradient: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  royal_security:  { gradient: "from-amber-400 to-yellow-600",   iconBg: "text-white", Icon: Crown },
  vip_protection:  { gradient: "from-emerald-400 to-teal-600",   iconBg: "text-white", Icon: ShieldCheck },
  convoy:          { gradient: "from-blue-400 to-indigo-600",    iconBg: "text-white", Icon: Siren },
  traffic:         { gradient: "from-orange-400 to-red-500",     iconBg: "text-white", Icon: TrafficCone },
  venue_security:  { gradient: "from-violet-400 to-purple-600",  iconBg: "text-white", Icon: Building2 },
};

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({ open, onClose, onCreated }: CreateTaskModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<TaskTypeKey | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [content, setContent] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const resetAndClose = () => {
    setStep(1);
    setSelectedType(null);
    setTitle("");
    setPriority("medium");
    setDeadlineAt("");
    setContent({});
    setError("");
    onClose();
  };

  const handleSelectType = (key: TaskTypeKey) => {
    setSelectedType(key);
    setContent({});
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setCreating(true);
    setError("");
    try {
      const typeLabel = TASK_TYPE_CONFIG[selectedType]?.label || selectedType;
      await fetchApi("/api/task", {
        method: "POST",
        body: JSON.stringify({
        title: title.trim() || typeLabel,
          task_type_key: selectedType,
          priority,
          ...(deadlineAt ? { deadline_at: deadlineAt } : {}),
          content,
        }),
      });
      resetAndClose();
      onCreated();
    } catch (err: any) {
      const msg =
        err?.data?.errors
          ? Object.values(err.data.errors).flat().join(", ")
          : err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setError(msg as string);
    } finally {
      setCreating(false);
    }
  };

  const typeCfg = selectedType ? TASK_TYPE_CONFIG[selectedType] : null;
  const fields = selectedType ? TASK_TYPE_FIELDS[selectedType] : [];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999 }}
      className="flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══════════ STEP 1 ─ Type Selection ══════════ */}
        {step === 1 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div />
              <button type="button" onClick={resetAndClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div className="text-center pb-4">
              <h2 className="text-lg font-bold text-gray-900">ประเภทภารกิจ</h2>
              <p className="text-sm text-gray-500 mt-1">เลือกประเภทภารกิจที่คุณต้องการสร้าง</p>
            </div>

            {/* Grid of type cards */}
            <div className="px-6 pb-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4 pt-3">
                {(Object.entries(TASK_TYPE_CONFIG) as [TaskTypeKey, typeof TASK_TYPE_CONFIG[TaskTypeKey]][]).map(([key, cfg]) => {
                  const cardStyle = TYPE_CARD_STYLES[key];
                  const IconComp = cardStyle.Icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectType(key)}
                      className="flex flex-col items-center gap-2 group overflow-visible"
                    >
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cardStyle.gradient} flex items-center justify-center shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-200`}>
                        <IconComp className="w-9 h-9 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ══════════ STEP 2 ─ Form ══════════ */}
        {step === 2 && selectedType && typeCfg && (
          <>
            {/* Header with back button */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <button type="button" onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition">
                <ChevronLeft className="w-4 h-4" />
                ก่อนหน้า
              </button>
              <div className="flex items-center gap-2">
                {(() => { const IC = TYPE_CARD_STYLES[selectedType].Icon; return <IC className="w-5 h-5" style={{ color: typeCfg.color }} />; })()}
                <h2 className="text-base font-semibold text-gray-900">{typeCfg.label}</h2>
              </div>
              <button type="button" onClick={resetAndClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-5 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
                )}

                {/* ชื่องาน */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่องาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="ระบุชื่องาน..."
                  />
                </div>

                {/* Section title */}
                <div className="flex items-center gap-2 pb-1">
                  {(() => { const IC = TYPE_CARD_STYLES[selectedType].Icon; return <IC className="w-5 h-5" style={{ color: typeCfg.color }} />; })()}
                  <h3 className="text-sm font-semibold text-gray-800">ข้อมูล{typeCfg.label}</h3>
                </div>

                {/* Dynamic fields */}
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={content[field.key] || ""}
                        onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                        rows={2}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={content[field.key] || ""}
                        onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}

                {/* วันปฏิบัติภารกิจ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันปฏิบัติภารกิจ</label>
                  <input
                    type="datetime-local"
                    value={deadlineAt}
                    onChange={(e) => setDeadlineAt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t mt-auto">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? "กำลังสร้าง..." : (
                    <>
                      ดำเนินการต่อ
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
