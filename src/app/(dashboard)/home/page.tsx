"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ContentContainer from "@/components/ContentContainer";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Search, RefreshCw, Loader2, FileText, Plus } from "lucide-react";
import { fetchApi } from "@/lib/api";
import {
  ITask,
  TASK_TYPE_CONFIG,
  STATUS_CONFIG,
} from "@/types";

interface SectionData {
  label: string;
  tasks: ITask[];
  pending: boolean;
  collapsed: boolean;
  headerBg: string;
  headerText: string;
  rowBg: string;
}

export default function HomePage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionData[]>([
    { label: "วันนี้", tasks: [], pending: true, collapsed: false, headerBg: "#ad1d1d", headerText: "white", rowBg: "#f9e5e5" },
    { label: "สัปดาห์นี้", tasks: [], pending: true, collapsed: false, headerBg: "#ed7014", headerText: "white", rowBg: "" },
    { label: "เดือนนี้", tasks: [], pending: true, collapsed: false, headerBg: "#F4F4F4", headerText: "#111827", rowBg: "" },
  ]);
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTasks = useCallback(async (days: number, daysFrom?: number) => {
    try {
      const params = new URLSearchParams({ per_page: "100", days: String(days) });
      if (daysFrom) params.set("days_from", String(daysFrom));
      if (search) params.set("search", search);
      if (taskTypeFilter) params.set("task_type_key", taskTypeFilter);
      if (statusFilter) params.set("status", statusFilter);

      const response: any = await fetchApi(`/api/task/today?${params}`);
      return (response?.data ?? []) as ITask[];
    } catch {
      return [];
    }
  }, [search, taskTypeFilter, statusFilter]);

  const refreshAll = useCallback(async () => {
    setSections((prev) => prev.map((s) => ({ ...s, pending: true })));

    const [today, week, month] = await Promise.all([
      fetchTasks(1),
      fetchTasks(7, 1),
      fetchTasks(30, 7),
    ]);

    setSections((prev) => [
      { ...prev[0], tasks: today, pending: false, collapsed: today.length === 0 },
      { ...prev[1], tasks: week, pending: false, collapsed: week.length === 0 },
      { ...prev[2], tasks: month, pending: false, collapsed: month.length === 0 },
    ]);
  }, [fetchTasks]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const toggleSection = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, collapsed: !s.collapsed } : s))
    );
  };

  const totalCount = sections.reduce((acc, s) => acc + s.tasks.length, 0);

  return (
  <>
    <ContentContainer
      titlePage="ภารกิจวันนี้"
      rightSideContent={
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1.5"
        >
          <span><Plus className="w-4 h-4" /></span> สร้างภารกิจ
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Filter Bar */}
        <div className="flex items-center flex-wrap justify-end gap-2 px-1">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" /> ค้นหา
          </button>
          <button
            onClick={refreshAll}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> รีเฟรช
          </button>
          <span className="text-sm text-gray-500">
            ทั้งหมด {totalCount} ภารกิจ
          </span>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border">
            <input
              type="text"
              placeholder="ค้นหาภารกิจ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[200px]"
            />
            <select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">ทุกประเภท</option>
              {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">ทุกสถานะ</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Task Table */}
        <table className="w-full h-fit text-left text-gray-500">
          <thead className="text-base text-gray-700 bg-[#F4F4F4]">
            <tr className="border-b">
              <th className="text-start p-2.5">ชื่อรายการ</th>
              <th className="p-2.5 hidden md:table-cell w-[140px]">ประเภท</th>
              <th className="text-start p-2.5 hidden md:table-cell w-[140px]">วันครบกำหนด</th>
              <th className="text-start p-2.5 hidden md:table-cell w-[120px]">ระดับความสำคัญ</th>
              <th className="text-start p-2.5 hidden md:table-cell w-[130px]">สถานะ</th>
            </tr>
          </thead>

          {sections.map((section, sIdx) => (
            <tbody key={section.label}>
              {/* Section Header */}
              <tr
                style={{ backgroundColor: section.headerBg, color: section.headerText }}
                className="border-y cursor-pointer select-none"
                onClick={() => toggleSection(sIdx)}
              >
                <td colSpan={5} className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{section.label}</span>
                    {!section.pending && (
                      <span className="text-sm font-bold">({section.tasks.length})</span>
                    )}
                    <span className="ml-auto">{section.collapsed ? "▶" : "▼"}</span>
                  </div>
                </td>
              </tr>

              {/* Loading */}
              {section.pending && !section.collapsed && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col justify-center items-center py-8">
                      <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
                      <p className="mt-3 text-sm font-light text-gray-500">กำลังโหลด...</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Tasks */}
              {!section.pending && !section.collapsed && section.tasks.length > 0 &&
                section.tasks.map((task) => {
                  const typeConfig = TASK_TYPE_CONFIG[task.task_type_key] || { label: task.task_type_key, icon: "📋", color: "#6b7280", bgColor: "#f3f4f6" };
                  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <tr
                      key={task.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      style={section.rowBg ? { backgroundColor: section.rowBg } : {}}
                    >
                      <td className="p-2.5">
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">{task.title}</span>
                          {task.description && (
                            <span className="text-sm text-gray-500 line-clamp-1">{task.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 hidden md:table-cell">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                        >
                          <TaskTypeIcon typeKey={task.task_type_key} className="w-3.5 h-3.5" color={typeConfig.color} /> {typeConfig.label}
                        </span>
                      </td>
                      <td className="p-2.5 hidden md:table-cell text-sm">
                        {task.deadline_at
                          ? new Date(task.deadline_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                          : "-"}
                      </td>
                      <td className="p-2.5 hidden md:table-cell">
                        <span className="text-sm font-medium" style={{ color: priorityConfig.color }}>
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="p-2.5 hidden md:table-cell">
                        <span
                          className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              }

              {/* Empty */}
              {!section.pending && !section.collapsed && section.tasks.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex justify-center items-center py-5">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <p className="text-sm font-light text-gray-400">ไม่มีภารกิจ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      </div>

    </ContentContainer>

    <CreateTaskModal
      open={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onCreated={refreshAll}
    />
  </>
  );
}
