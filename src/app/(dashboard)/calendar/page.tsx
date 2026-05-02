"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Loader2, X, FileText, Share2, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toLocalDateString } from "@/lib/dateUtils";
import { ITask, TASK_TYPE_CONFIG, TaskTypeKey } from "@/types";

const dayHeaders = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: ITask[];
  dateObj: Date;
  dateStr: string;
}

interface AclRule {
  id: string;
  role: string;
  scope: { type: string; value: string };
}

const ROLE_LABELS: Record<string, string> = {
  reader: "ดูได้",
  writer: "แก้ไขได้",
  owner: "เจ้าของ",
  freeBusyReader: "ดูตารางเวลา",
};

const ALL_TYPES = Object.keys(TASK_TYPE_CONFIG) as TaskTypeKey[];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [visibleTypes, setVisibleTypes] = useState<Set<TaskTypeKey>>(new Set(ALL_TYPES));
  const [typesPanelOpen, setTypesPanelOpen] = useState(true);

  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState<AclRule[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"reader" | "writer">("reader");
  const [inviting, setInviting] = useState(false);
  const [shareError, setShareError] = useState("");

  const fetchCalendarTasks = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = toLocalDateString(new Date(year, month - 1, 1));
      const end = toLocalDateString(new Date(year, month + 2, 0));
      const res: any = await fetchApi(`/api/task?per_page=200&date_from=${start}&date_to=${end}`);
      setTasks(res?.data ?? []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchCalendarTasks(); }, [fetchCalendarTasks]);

  const fetchShares = useCallback(async () => {
    setSharesLoading(true);
    try {
      const data: any = await fetchApi("/api/calendar/shares");
      setShares(Array.isArray(data) ? data : []);
    } catch {
      setShares([]);
    } finally {
      setSharesLoading(false);
    }
  }, []);

  const openShareModal = () => {
    setShareOpen(true);
    setShareError("");
    setInviteEmail("");
    fetchShares();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setShareError("");
    try {
      await fetchApi("/api/calendar/share", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInviteEmail("");
      fetchShares();
    } catch (err: any) {
      setShareError(err?.message || "ไม่สามารถแชร์ได้");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveShare = async (ruleId: string) => {
    try {
      await fetchApi("/api/calendar/share", {
        method: "DELETE",
        body: JSON.stringify({ rule_id: ruleId }),
      });
      fetchShares();
    } catch { }
  };

  const toggleType = (key: TaskTypeKey) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getTasksForDate = useCallback(
    (dateStr: string) =>
      tasks.filter((t) => {
        if (!t.deadline_at) return false;
        return toLocalDateString(new Date(t.deadline_at)) === dateStr && visibleTypes.has(t.task_type_key as TaskTypeKey);
      }),
    [tasks, visibleTypes]
  );

  const currentMonthYear = useMemo(() =>
    `${thaiMonths[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`,
    [currentDate]
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const d = new Date(year, month - 1, date);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: getTasksForDate(toLocalDateString(d)), dateObj: d, dateStr: toLocalDateString(d) });
    }
    for (let date = 1; date <= daysInMonth; date++) {
      const d = new Date(year, month, date); d.setHours(0, 0, 0, 0);
      const dateStr = toLocalDateString(d);
      days.push({ date, isCurrentMonth: true, isToday: d.getTime() === today.getTime(), tasks: getTasksForDate(dateStr), dateObj: d, dateStr });
    }
    const remaining = 42 - days.length;
    for (let date = 1; date <= remaining; date++) {
      const d = new Date(year, month + 1, date);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: getTasksForDate(toLocalDateString(d)), dateObj: d, dateStr: toLocalDateString(d) });
    }
    return days;
  }, [currentDate, getTasksForDate]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
      const dateStr = toLocalDateString(d);
      return { date: d.getDate(), dayName: dayHeaders[i], isToday: d.toDateString() === today.toDateString(), tasks: getTasksForDate(dateStr) };
    });
  }, [getTasksForDate]);

  const formatSelDate = useMemo(() => {
    if (!selectedDay) return "";
    const d = selectedDay.dateObj;
    return `${dayHeaders[d.getDay()]}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  }, [selectedDay]);

  const prevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const nextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };
  const goToday = () => setCurrentDate(new Date());

  return (
    <ContentContainer titlePage="ปฏิทิน">
      <div className="flex gap-4">

        {/* LEFT SIDEBAR */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">
          <button
            onClick={openShareModal}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            เชิญเข้าปฏิทิน
          </button>

          <div className="bg-white rounded-xl border p-3">
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
              onClick={() => setTypesPanelOpen((v) => !v)}
            >
              ประเภทภารกิจ
              {typesPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {typesPanelOpen && (
              <div className="space-y-1.5">
                {ALL_TYPES.map((key) => {
                  const cfg = TASK_TYPE_CONFIG[key];
                  const active = visibleTypes.has(key);
                  return (
                    <button key={key} onClick={() => toggleType(key)} className="flex items-center gap-2.5 w-full text-left group">
                      <span
                        className="w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition"
                        style={{ backgroundColor: active ? cfg.color : "transparent", borderColor: cfg.color }}
                      >
                        {active && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-xs text-gray-700 group-hover:text-gray-900 truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MAIN CALENDAR */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">◀</button>
              <h2 className="text-xl font-bold text-[#0d1738] min-w-[180px] text-center">{currentMonthYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">▶</button>
              <button onClick={goToday} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition">วันนี้</button>
            </div>
            <div className="flex gap-1">
              {(["month", "week"] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {m === "month" ? "เดือน" : "สัปดาห์"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden bg-white">
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {dayHeaders.map((d) => (
                <div key={d} className="p-2.5 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0">{d}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : viewMode === "month" ? (
              <div className="grid grid-cols-7" style={{ minHeight: "480px" }}>
                {calendarDays.map((day, i) => (
                  <div key={i}
                    className={`border-r border-b border-gray-100 p-2 min-h-[90px] hover:bg-gray-50 transition cursor-pointer ${!day.isCurrentMonth ? "bg-gray-50/60" : ""} ${day.isToday ? "ring-2 ring-indigo-500 ring-inset" : ""}`}
                    onClick={() => setSelectedDay(day)}>
                    <span className={`text-sm font-medium ${day.isToday ? "bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : day.isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}>
                      {day.date}
                    </span>
                    {day.tasks.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {day.tasks.slice(0, 2).map((t) => {
                          const cfg = TASK_TYPE_CONFIG[t.task_type_key] || { label: t.task_type_key, color: "#6b7280", bgColor: "#f3f4f6" };
                          return (
                            <div key={t.id} className="text-xs px-1.5 py-0.5 rounded truncate" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                              {t.title}
                            </div>
                          );
                        })}
                        {day.tasks.length > 2 && <div className="text-xs text-gray-500 pl-1">+{day.tasks.length - 2}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7" style={{ minHeight: "480px" }}>
                {weekDays.map((day, i) => (
                  <div key={i} className={`border-r border-gray-100 p-3 ${day.isToday ? "bg-indigo-50" : ""}`}>
                    <div className="text-center mb-3">
                      <div className={`text-xs font-semibold mb-1 ${day.isToday ? "text-indigo-600" : "text-gray-500"}`}>{day.dayName}</div>
                      <div className={`text-lg font-bold ${day.isToday ? "bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full mx-auto" : "text-gray-800"}`}>{day.date}</div>
                    </div>
                    <div className="space-y-1.5">
                      {day.tasks.map((t) => {
                        const cfg = TASK_TYPE_CONFIG[t.task_type_key] || { label: t.task_type_key, color: "#6b7280", bgColor: "#f3f4f6" };
                        return (
                          <div key={t.id} className="text-xs p-1.5 rounded border" style={{ borderColor: cfg.color + "40", backgroundColor: cfg.bgColor }}>
                            <div className="font-medium truncate" style={{ color: cfg.color }}>{t.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DAY DETAIL MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDay(null); }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-[#0d1738]">ภารกิจ {formatSelDate}</h2>
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              {selectedDay.tasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDay.tasks.map((t) => {
                    const cfg = TASK_TYPE_CONFIG[t.task_type_key] || { label: t.task_type_key, icon: "📋", color: "#6b7280", bgColor: "#f3f4f6" };
                    return (
                      <div key={t.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <TaskTypeIcon typeKey={t.task_type_key} className="w-5 h-5 mt-0.5" color={cfg.color} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{t.title}</div>
                            {t.description && <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>}
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>{cfg.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p><FileText className="w-5 h-5 inline mr-1" />ไม่มีภารกิจในวันนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE CALENDAR MODAL */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-gray-900">แชร์ปฏิทินภารกิจ</h2>
              </div>
              <button onClick={() => setShareOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <form onSubmit={handleInvite} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">เชิญด้วยอีเมล</label>
                {shareError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{shareError}</div>
                )}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="อีเมล Google"
                    required
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "reader" | "writer")}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="reader">ดูได้</option>
                    <option value="writer">แก้ไขได้</option>
                  </select>
                  <button type="submit" disabled={inviting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap">
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "เชิญ"}
                  </button>
                </div>
              </form>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ผู้ที่มีสิทธิ์เข้าถึง</p>
                {sharesLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 text-gray-400" /></div>
                ) : shares.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีการแชร์</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {shares.map((rule) => {
                      const isOwner = rule.role === "owner";
                      return (
                        <div key={rule.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{rule.scope?.value || rule.scope?.type}</p>
                            <p className="text-xs text-gray-500">{ROLE_LABELS[rule.role] ?? rule.role}</p>
                          </div>
                          {!isOwner && (
                            <button onClick={() => handleRemoveShare(rule.id)}
                              className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ContentContainer>
  );
}