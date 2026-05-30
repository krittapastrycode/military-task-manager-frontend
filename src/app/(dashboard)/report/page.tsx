"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ContentContainer from "@/components/ContentContainer";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Loader2, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchApi } from "@/lib/api";
import { canExportPDF } from "@/lib/auth";
import { ITask, TASK_TYPE_CONFIG, STATUS_CONFIG } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  royal_security: "#b45309",
  vip_protection: "#059669",
  convoy: "#2563eb",
  traffic: "#d97706",
  venue_security: "#7c3aed",
};

export default function ReportPage() {
  const router = useRouter();

  useEffect(() => {
    const roles: string[] = (() => {
      try {
        const p = JSON.parse(localStorage.getItem('profile') ?? '{}');
        return Array.isArray(p?.role) ? p.role : [p?.role ?? 'user'];
      } catch { return ['user']; }
    })();
    const isPrivileged = roles.includes('admin') || roles.includes('commander');
    if (!isPrivileged) router.replace('/home');
  }, [router]);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* Chart state */
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [chartQuarter, setChartQuarter] = useState<string>("");
  const [chartLoading, setChartLoading] = useState(true);
  const [canExport, setCanExport] = useState(false);
  const [pdfMode, setPdfMode] = useState(false);
  const [pdfTasks, setPdfTasks] = useState<ITask[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanExport(canExportPDF());
  }, []);

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

  const fetchChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const params = new URLSearchParams({ year: String(chartYear) });
      if (chartQuarter) params.set("quarter", chartQuarter);

      const res: any = await fetchApi(`/api/report/chart?${params}`);
      setChartData(res?.data ?? []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [chartYear, chartQuarter]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  const handleExportPDF = async () => {
    if (!printRef.current) return;

    // Build completed_at date range matching the chart period
    let completedFrom: string, completedTo: string;
    if (chartQuarter) {
      const q = parseInt(chartQuarter);
      const sm = (q - 1) * 3 + 1;
      const endMonth = sm + 2;
      completedFrom = `${chartYear}-${String(sm).padStart(2, "0")}-01`;
      const lastDay = new Date(chartYear, endMonth, 0).getDate();
      completedTo = `${chartYear}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
    } else {
      completedFrom = `${chartYear}-01-01`;
      completedTo = `${chartYear}-12-31`;
    }

    // Fetch tasks for the exact chart period
    try {
      const params = new URLSearchParams({
        per_page: "500",
        completed_from: completedFrom,
        completed_to: completedTo,
      });
      const res: any = await fetchApi(`/api/task?${params}`);
      setPdfTasks(res?.data ?? []);
    } catch {
      setPdfTasks(tasks);
    }

    setPdfMode(true);
    await new Promise((r) => setTimeout(r, 150));

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0, page = 0;
      while (y < imgH) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH);
        y += pageH;
        page++;
      }
      const label = chartQuarter ? `Q${chartQuarter}` : "ทั้งปี";
      pdf.save(`รายงานอารักขา_${chartYear}_${label}.pdf`);
    } finally {
      setPdfMode(false);
      setPdfTasks([]);
    }
  };

  const displayTasks = pdfMode ? pdfTasks : tasks;

  /* Stats */
  const stats = {
    total: displayTasks.length,
    byStatus: Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      color: cfg.color,
      bgColor: cfg.bgColor,
      count: displayTasks.filter((t) => t.status === key).length,
    })).filter((s) => s.count > 0),
    byType: Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      icon: cfg.icon,
      color: cfg.color,
      bgColor: cfg.bgColor,
      count: displayTasks.filter((t) => t.task_type_key === key).length,
    })).filter((s) => s.count > 0),
  };

  return (
    <ContentContainer
      titlePage="รายงาน"
      rightSideContent={
        canExport && (
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg text-base font-medium hover:bg-rose-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> ดาวน์โหลด PDF
          </button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {/* ── Filter controls (OUTSIDE printRef) ── */}
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

        {/* ── Chart controls (OUTSIDE printRef) ── */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-base font-semibold text-gray-900">กราฟภารกิจที่เสร็จสิ้นตามช่วงเวลา</h3>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">ปี</label>
            <input
              type="number"
              min={2020}
              max={2030}
              value={chartYear}
              onChange={(e) => setChartYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">ไตรมาส</label>
            <select
              value={chartQuarter}
              onChange={(e) => setChartQuarter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">ทั้งปี</option>
              <option value="1">Q1 (ม.ค.-มี.ค.)</option>
              <option value="2">Q2 (เม.ย.-มิ.ย.)</option>
              <option value="3">Q3 (ก.ค.-ก.ย.)</option>
              <option value="4">Q4 (ต.ค.-ธ.ค.)</option>
            </select>
          </div>
        </div>

        {/* ── Printable area ── */}
        <div ref={printRef} className="flex flex-col gap-4 bg-white">
          {/* Print header */}
          <div className="mb-2 text-sm text-gray-500">
            ประมวลผล: {new Date().toLocaleDateString("th-TH")} | ปี {chartYear}
            {chartQuarter ? ` Q${chartQuarter}` : ""}
          </div>

          {/* Chart section */}
          <div className="bg-white rounded-lg border p-5 mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="text-base font-semibold text-gray-900">กราฟภารกิจที่เสร็จสิ้นตามช่วงเวลา</h3>
            </div>

            {chartLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={cfg.label}
                        stackId="a"
                        fill={TYPE_COLORS[key] ?? cfg.color}
                        radius={key === "venue_security" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
                    {displayTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td>
                      </tr>
                    ) : (
                      displayTasks.map((task, idx) => {
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
      </div>
    </ContentContainer>
  );
}
