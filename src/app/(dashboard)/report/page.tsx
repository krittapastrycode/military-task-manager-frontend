"use client";

import { useState, useEffect, useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ITask, TASK_TYPE_CONFIG, STATUS_CONFIG, TaskTypeKey, TaskStatus } from "@/types";

export default function ReportPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "200" });
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (taskTypeFilter) params.set("task_type_key", taskTypeFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res: any = await fetchApi(`/api/task?${params}`);
      setTasks(res?.data ?? []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, taskTypeFilter, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  /* Stats */
  const stats = {
    total: tasks.length,
    byStatus: Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      color: cfg.color,
      bgColor: cfg.bgColor,
      count: tasks.filter((t) => t.status === key).length,
    })).filter((s) => s.count > 0),
    byType: Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      icon: cfg.icon,
      color: cfg.color,
      bgColor: cfg.bgColor,
      count: tasks.filter((t) => t.task_type_key === key).length,
    })).filter((s) => s.count > 0),
  };

  return (
    <ContentContainer titlePage="รายงาน">
      <div className="flex flex-col gap-4">
        {/* Filter */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">ถึงวันที่</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">ประเภท</label>
            <select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">ทั้งหมด</option>
              {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">ทั้งหมด</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">ภารกิจทั้งหมด</p>
                <p className="text-3xl font-bold text-[#0d1738]">{stats.total}</p>
              </div>
              {stats.byStatus.slice(0, 3).map((s) => (
                <div key={s.key} className="bg-white rounded-lg border p-4">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
                </div>
              ))}
            </div>

            {/* By type breakdown */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">สรุปตามประเภทภารกิจ</h3>
              <div className="space-y-2">
                {stats.byType.map((t) => {
                  const pct = stats.total > 0 ? (t.count / stats.total) * 100 : 0;
                  return (
                    <div key={t.key} className="flex items-center gap-3">
                      <span className="w-8 flex justify-center"><TaskTypeIcon typeKey={t.key} color={t.color} /></span>
                      <span className="text-sm font-medium text-gray-700 w-28">{t.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: t.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                        {t.count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task table */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-3 py-2 border-r w-10">#</th>
                    <th className="px-3 py-2 border-r w-[40%]">ชื่อภารกิจ</th>
                    <th className="px-3 py-2 border-r w-[120px]">ประเภท</th>
                    <th className="px-3 py-2 border-r w-[120px]">สถานะ</th>
                    <th className="px-3 py-2 border-r w-[120px]">กำหนดส่ง</th>
                    <th className="px-3 py-2 w-[120px]">วันที่สร้าง</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td>
                    </tr>
                  ) : (
                    tasks.map((task, idx) => {
                      const typeConfig = TASK_TYPE_CONFIG[task.task_type_key] || { label: task.task_type_key, icon: "📋", color: "#6b7280", bgColor: "#f3f4f6" };
                      const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 border-r text-gray-500 text-center">{idx + 1}</td>
                          <td className="px-3 py-2 border-r">
                            <span className="font-medium text-gray-900">{task.title}</span>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                            >
                              <TaskTypeIcon typeKey={task.task_type_key} className="w-3.5 h-3.5" color={typeConfig.color} /> {typeConfig.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <span
                              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r text-sm">
                            {task.deadline_at
                              ? new Date(task.deadline_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {task.created_at
                              ? new Date(task.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ContentContainer>
  );
}
