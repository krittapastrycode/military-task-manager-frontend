"use client";

import { X, Calendar, Clock, User, Flag, Tag } from "lucide-react";
import {
  ITask,
  TASK_TYPE_CONFIG,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from "@/types";
import TaskTypeIcon from "@/components/TaskTypeIcon";

interface Props {
  task: ITask | null;
  onClose: () => void;
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    <div className="text-sm text-gray-800">{children}</div>
  </div>
);

export default function TaskDetailModal({ task, onClose }: Props) {
  if (!task) return null;

  const typeCfg = TASK_TYPE_CONFIG[task.task_type_key] || { label: task.task_type_key, color: "#6b7280", bgColor: "#f3f4f6" };
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "-";

  const contentEntries = task.content ? Object.entries(task.content).filter(([, v]) => v !== null && v !== "") : [];

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
            <h2 className="text-base font-semibold text-gray-900">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: typeCfg.bgColor, color: typeCfg.color }}>
              <TaskTypeIcon typeKey={task.task_type_key} className="w-3.5 h-3.5" color={typeCfg.color} />
              {typeCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
              style={{ color: priorityCfg.color }}>
              <Flag className="w-3 h-3" />
              {priorityCfg.label}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <Row label="รายละเอียด">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </Row>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Row label="กำหนดส่ง">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {fmtDate(task.deadline_at)}
              </span>
            </Row>
            <Row label="วันที่สร้าง">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {fmtDate(task.created_at)}
              </span>
            </Row>
          </div>

          {/* Creator */}
          {task.creator && (
            <Row label="สร้างโดย">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {task.creator.name}
                {task.creator.rank && ` (${task.creator.rank})`}
              </span>
            </Row>
          )}

          {/* Content fields */}
          {contentEntries.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">ข้อมูลเพิ่มเติม</span>
              </div>
              <div className="space-y-3">
                {contentEntries.map(([key, value]) => (
                  <Row key={key} label={key}>
                    <span className="break-words">{String(value)}</span>
                  </Row>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
