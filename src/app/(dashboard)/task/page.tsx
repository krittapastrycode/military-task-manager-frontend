"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ContentContainer from "@/components/ContentContainer";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Search, SearchX, Columns3, Loader2, Plus, Eye, Pencil } from "lucide-react";
import { fetchApi } from "@/lib/api";
import {
  ITask,
  IPagination,
  TASK_TYPE_CONFIG,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TaskTypeKey,
  TaskStatus,
} from "@/types";

/* ───────────────── Column config (WPE-style) ───────────────── */
const ALL_COLUMNS = [
  { key: "title", label: "ข้อมูลภารกิจ", sortable: true },
  { key: "task_type_key", label: "ประเภท", sortable: false },
  { key: "status", label: "สถานะ", sortable: true },
  { key: "priority", label: "ความสำคัญ", sortable: true },
  { key: "deadline_at", label: "กำหนดส่ง", sortable: true },
  { key: "created_at", label: "วันที่สร้าง", sortable: true },
  { key: "creator", label: "สร้างโดย", sortable: false },
  { key: "actions", label: "ดำเนินการ", sortable: false },
] as const;

const DEFAULT_VISIBLE = ["title", "task_type_key", "status", "priority", "deadline_at", "created_at", "actions"];

export default function TaskPage() {
  /* ─── State ─── */
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<IPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Filter
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sort
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ─── Fetch ─── */
  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.per_page),
        sort_by: sortColumn,
        sort_direction: sortDirection,
      });
      if (search) params.set("search", search);
      if (taskTypeFilter) params.set("task_type_key", taskTypeFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res: any = await fetchApi(`/api/task?${params}`);
      setTasks(res?.data ?? []);
      if (res?.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          per_page: res.meta.per_page,
          total: res.meta.total,
        });
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, sortColumn, sortDirection, search, taskTypeFilter, statusFilter]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  /* ─── Sort handler ─── */
  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("desc");
    }
  };

  /* ─── Column toggle ─── */
  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const columns = useMemo(
    () => ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)),
    [visibleColumns]
  );

  /* ─── Pagination ─── */
  const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

  return (
  <>
    <ContentContainer titlePage="จัดการภารกิจ">
      <div className="flex flex-col gap-3">
        {/* ── Toolbar ── */}
        <div className="flex flex-row flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> สร้างภารกิจ
          </button>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            {showFilter ? <SearchX className="w-4 h-4" /> : <Search className="w-4 h-4" />} ค้นหา
          </button>

          {/* Column selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
            >
              <Columns3 className="w-4 h-4" /> Columns
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-20 min-w-[180px]">
                {ALL_COLUMNS.filter((c) => c.key !== "actions").map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="accent-indigo-600"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter panel ── */}
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

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold text-base">
              <tr>
                <th className="px-3 py-2 border-r w-10">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 border-r last:border-r-0 whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:bg-gray-100" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortColumn === col.key && (
                        <span className="text-xs">{sortDirection === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <div className="flex flex-col justify-center items-center py-12">
                      <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
                      <p className="mt-3 text-sm text-gray-500">กำลังโหลด...</p>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">
                    ไม่พบข้อมูลภารกิจ
                  </td>
                </tr>
              ) : (
                tasks.map((task, idx) => {
                  const typeConfig = TASK_TYPE_CONFIG[task.task_type_key] || { label: task.task_type_key, icon: "📋", color: "#6b7280", bgColor: "#f3f4f6" };
                  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const rowNum = pagination.per_page * (pagination.current_page - 1) + (idx + 1);

                  return (
                    <tr key={task.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 border-r text-gray-500">{rowNum}</td>

                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-3 border-r last:border-r-0 align-top">
                          {col.key === "title" && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-base font-medium text-gray-900">{task.title}</span>
                              {task.description && (
                                <span className="text-sm text-amber-600 line-clamp-2">{task.description}</span>
                              )}
                            </div>
                          )}
                          {col.key === "task_type_key" && (
                            <div className="flex justify-center">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                              >
                                <TaskTypeIcon typeKey={task.task_type_key} className="w-3.5 h-3.5" color={typeConfig.color} /> {typeConfig.label}
                              </span>
                            </div>
                          )}
                          {col.key === "status" && (
                            <div className="flex justify-center">
                              <span
                                className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                          )}
                          {col.key === "priority" && (
                            <span className="text-sm font-medium" style={{ color: priorityConfig.color }}>
                              {priorityConfig.label}
                            </span>
                          )}
                          {col.key === "deadline_at" && (
                            <span className="text-sm text-center block">
                              {task.deadline_at
                                ? new Date(task.deadline_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                                : "-"}
                            </span>
                          )}
                          {col.key === "created_at" && (
                            <span className="text-sm text-center block">
                              {task.created_at
                                ? new Date(task.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                                : "-"}
                            </span>
                          )}
                          {col.key === "creator" && (
                            <span className="text-sm font-medium text-gray-800 text-center block">
                              {task.creator?.name || "-"}
                            </span>
                          )}
                          {col.key === "actions" && (
                            <div className="flex flex-col gap-1 items-stretch">
                              <button className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded text-xs font-medium hover:bg-sky-100 transition flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> รายละเอียด
                              </button>
                              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition flex items-center gap-1">
                                <Pencil className="w-3.5 h-3.5" /> แก้ไข
                              </button>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchTasks(pagination.current_page - 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ←
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchTasks(p)}
                className={`px-3 py-1.5 text-sm border rounded-lg transition ${
                  p === pagination.current_page
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchTasks(pagination.current_page + 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              →
            </button>
          </div>
        )}
      </div>

    </ContentContainer>

    <CreateTaskModal
      open={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onCreated={() => fetchTasks(1)}
    />
  </>
  );
}
