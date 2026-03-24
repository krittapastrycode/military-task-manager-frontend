"use client";

import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { TASK_TYPE_CONFIG, STATUS_CONFIG } from "@/types";

interface TaskFilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  taskTypeFilter: string;
  setTaskTypeFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}

export default function TaskFilterBar({
  search,
  setSearch,
  taskTypeFilter,
  setTaskTypeFilter,
  statusFilter,
  setStatusFilter,
}: TaskFilterBarProps) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const hasFilter = search || taskTypeFilter || statusFilter;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-3">
      {/* Search */}
      <div className="relative w-[700px] max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="ค้นหาภารกิจ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Task Type custom dropdown */}
        <div className="flex flex-col gap-1 w-[350px] relative">
          <label className="text-xs font-medium text-gray-500">ประเภทภารกิจ</label>
          <button
            type="button"
            onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowStatusDropdown(false); }}
            className="flex items-center gap-2 w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 cursor-pointer transition text-left relative"
          >
            {taskTypeFilter ? (
              <>
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: TASK_TYPE_CONFIG[taskTypeFilter as keyof typeof TASK_TYPE_CONFIG]?.bgColor }}
                >
                  <TaskTypeIcon
                    typeKey={taskTypeFilter}
                    className="w-3 h-3"
                    color={TASK_TYPE_CONFIG[taskTypeFilter as keyof typeof TASK_TYPE_CONFIG]?.color}
                  />
                </span>
                <span>{TASK_TYPE_CONFIG[taskTypeFilter as keyof typeof TASK_TYPE_CONFIG]?.label}</span>
              </>
            ) : (
              <span className="text-gray-400">ทุกประเภท</span>
            )}
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </button>
          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => { setTaskTypeFilter(""); setShowTypeDropdown(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
                  !taskTypeFilter ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"
                }`}
              >
                ทุกประเภท
              </button>
              {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTaskTypeFilter(key); setShowTypeDropdown(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
                    taskTypeFilter === key ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"
                  }`}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0"
                    style={{ backgroundColor: cfg.bgColor }}
                  >
                    <TaskTypeIcon typeKey={key} className="w-3.5 h-3.5" color={cfg.color} />
                  </span>
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status custom dropdown */}
        <div className="flex flex-col gap-1 w-[350px] relative">
          <label className="text-xs font-medium text-gray-500">สถานะ</label>
          <button
            type="button"
            onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowTypeDropdown(false); }}
            className="flex items-center gap-2 w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 cursor-pointer transition text-left relative"
          >
            {statusFilter ? (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.bgColor,
                  color: STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.color,
                }}
              >
                {STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}
              </span>
            ) : (
              <span className="text-gray-400">ทุกสถานะ</span>
            )}
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => { setStatusFilter(""); setShowStatusDropdown(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
                  !statusFilter ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"
                }`}
              >
                ทุกสถานะ
              </button>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setStatusFilter(key); setShowStatusDropdown(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
                    statusFilter === key ? "bg-indigo-50 font-medium" : "text-gray-700"
                  }`}
                >
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear button */}
        {hasFilter && (
          <div className="flex flex-col gap-1 justify-end">
            <button
              type="button"
              onClick={() => { setSearch(""); setTaskTypeFilter(""); setStatusFilter(""); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              <X className="w-3.5 h-3.5" /> เคลียร์ทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
