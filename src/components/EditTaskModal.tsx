"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimeInput24H from "@/components/TimeInput24H";
import SearchableSelect from "@/components/SearchableSelect";
import { X, Loader2, MapPin } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toLocalISOString } from "@/lib/dateUtils";
import {
  ITask,
  TASK_TYPE_CONFIG,
  TASK_TYPE_FIELDS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TaskStatus,
} from "@/types";
import TaskTypeIcon from "@/components/TaskTypeIcon";

interface Props {
  task: ITask | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EDITABLE_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pending",   label: "รอดำเนินการ" },
  { value: "progress",  label: "กำลังดำเนินการ" },
  { value: "on-hold",   label: "พักไว้" },
  { value: "success",   label: "สำเร็จ" },
  { value: "cancel",    label: "ยกเลิก" },
];

export default function EditTaskModal({ task, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState("medium");
  const [deadlineAt, setDeadlineAt] = useState<Date | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDeadlineAt(task.deadline_at ? new Date(task.deadline_at) : null);
    setContent((task.content as Record<string, string>) ?? {});
    setError("");
  }, [task]);

  if (!task) return null;

  const typeCfg = TASK_TYPE_CONFIG[task.task_type_key] || { label: task.task_type_key, color: "#6b7280" };

  const fields = TASK_TYPE_FIELDS[task.task_type_key] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingRequired = fields.find(
      (f) => f.required && !content[f.key]?.trim()
    );
    if (missingRequired) {
      setError(`กรุณากรอก "${missingRequired.label}" ก่อนบันทึก`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await fetchApi(`/api/task/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description: description || null,
          status,
          priority,
          deadline_at: deadlineAt ? toLocalISOString(deadlineAt) : null,
          content,
        }),
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.errors
          ? Object.values(err.data.errors).flat().join(", ")
          : err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setError(msg as string);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <TaskTypeIcon typeKey={task.task_type_key} className="w-5 h-5" color={typeCfg.color} />
            <h2 className="text-base font-semibold text-gray-900">แก้ไขภารกิจ</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อภารกิจ</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>

            {/* Dynamic type-specific fields (e.g. บุคคลอารักขา) */}
            {TASK_TYPE_FIELDS[task.task_type_key]?.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "select" ? (
                  <SearchableSelect
                    value={content[field.key] || ""}
                    onChange={(v) => setContent({ ...content, [field.key]: v })}
                    options={field.options ?? []}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === "datetime-local" ? (
                  <DatePicker
                    selected={content[field.key] ? new Date(content[field.key]) : null}
                    onChange={(date: Date | null) => setContent({ ...content, [field.key]: date ? toLocalISOString(date) : "" })}
                    showTimeInput
                    timeInputLabel="เวลา:"
                    customTimeInput={<TimeInput24H />}
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText={field.placeholder || "เลือกวันและเวลา..."}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    popperPlacement="bottom-start"
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    value={content[field.key] || ""}
                    onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                    rows={2}
                    required={field.required}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
                    placeholder={field.placeholder}
                  />
                ) : field.type === "url" ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="url"
                        value={content[field.key] || ""}
                        onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                        required={field.required}
                        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                        placeholder={field.placeholder}
                      />
                    </div>
                    {content[field.key] && (
                      <a
                        href={content[field.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                      >
                        <MapPin className="w-3 h-3" /> เปิด Google Maps
                      </a>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={content[field.key] || ""}
                    onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                    required={field.required}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <div className="grid grid-cols-2 gap-2">
                {EDITABLE_STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s.value];
                  const active = status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition"
                      style={active
                        ? { backgroundColor: cfg.bgColor, borderColor: cfg.color, color: cfg.color }
                        : { borderColor: "#e5e7eb", color: "#374151" }
                      }
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                  const active = priority === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriority(key)}
                      className="px-2 py-2 rounded-lg border text-xs font-medium transition"
                      style={active
                        ? { backgroundColor: cfg.color + "20", borderColor: cfg.color, color: cfg.color }
                        : { borderColor: "#e5e7eb", color: "#374151" }
                      }
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันปฏิบัติภารกิจ</label>
              <DatePicker
                selected={deadlineAt}
                onChange={(date) => setDeadlineAt(date)}
                showTimeInput
                timeInputLabel="เวลา:"
                customTimeInput={<TimeInput24H />}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="เลือกวันและเวลา..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                popperPlacement="bottom-start"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
