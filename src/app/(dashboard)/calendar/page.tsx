"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import TaskTypeIcon from "@/components/TaskTypeIcon";
import { Loader2, X, FileText, Share2, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ITask, TASK_TYPE_CONFIG, TaskTypeKey } from "@/types";

const dayHeaders = ["à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ", "à¸ˆà¸±à¸™à¸—à¸£à¹Œ", "à¸­à¸±à¸‡à¸„à¸²à¸£", "à¸žà¸¸à¸˜", "à¸žà¸¤à¸«à¸±à¸ªà¸šà¸”à¸µ", "à¸¨à¸¸à¸à¸£à¹Œ", "à¹€à¸ªà¸²à¸£à¹Œ"];
const thaiMonths = [
  "à¸¡à¸à¸£à¸²à¸„à¸¡", "à¸à¸¸à¸¡à¸ à¸²à¸žà¸±à¸™à¸˜à¹Œ", "à¸¡à¸µà¸™à¸²à¸„à¸¡", "à¹€à¸¡à¸©à¸²à¸¢à¸™", "à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡", "à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™",
  "à¸à¸£à¸à¸Žà¸²à¸„à¸¡", "à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡", "à¸à¸±à¸™à¸¢à¸²à¸¢à¸™", "à¸•à¸¸à¸¥à¸²à¸„à¸¡", "à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™", "à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡",
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
  reader: "à¸”à¸¹à¹„à¸”à¹‰",
  writer: "à¹à¸à¹‰à¹„à¸‚à¹„à¸”à¹‰",
  owner: "à¹€à¸ˆà¹‰à¸²à¸‚à¸­à¸‡",
  freeBusyReader: "à¸”à¸¹à¸•à¸²à¸£à¸²à¸‡à¹€à¸§à¸¥à¸²",
};

const ALL_TYPES = Object.keys(TASK_TYPE_CONFIG) as TaskTypeKey[];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Type filter toggles
  const [visibleTypes, setVisibleTypes] = useState<Set<TaskTypeKey>>(new Set(ALL_TYPES));
  const [typesPanelOpen, setTypesPanelOpen] = useState(true);

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState<AclRule[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"reader" | "writer">("reader");
  const [inviting, setInviting] = useState(false);
  const [shareError, setShareError] = useState("");

  /* Fetch tasks for current month range */
  const fetchCalendarTasks = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const end = new Date(year, month + 2, 0).toISOString().slice(0, 10);
      const res: any = await fetchApi(`/api/task?per_page=200&date_from=${start}&date_to=${end}`);
      setTasks(res?.data ?? []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchCalendarTasks(); }, [fetchCalendarTasks]);

  /* Fetch ACL shares */
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
      setShareError(err?.message || "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹à¸Šà¸£à¹Œà¹„à¸”à¹‰");
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
    } catch {
      // ignore
    }
  };

  /* Toggle task type visibility */
  const toggleType = (key: TaskTypeKey) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* Helper: get filtered tasks for a date */
  const getTasksForDate = useCallback(
    (dateStr: string) =>
      tasks.filter((t) => t.deadline_at?.slice(0, 10) === dateStr && visibleTypes.has(t.task_type_key as TaskTypeKey)),
    [tasks, visibleTypes]
  );

  const currentMonthYear = useMemo(() =>
    `${thaiMonths[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`,
    [currentDate]
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: CalendarDay[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const d = new Date(year, month - 1, date);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: getTasksForDate(d.toISOString().slice(0, 10)), dateObj: d, dateStr: d.toISOString().slice(0, 10) });
    }
    for (let date = 1; date <= daysInMonth; date++) {
      const d = new Date(year, month, date); d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date, isCurrentMonth: true, isToday: d.getTime() === today.getTime(), tasks: getTasksForDate(dateStr), dateObj: d, dateStr });
    }
    const remaining = 42 - days.length;
    for (let date = 1; date <= remaining; date++) {
      const d = new Date(year, month + 1, date);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: getTasksForDate(d.toISOString().slice(0, 10)), dateObj: d, dateStr: d.toISOString().slice(0, 10) });
    }
    return days;
  }, [currentDate, getTasksForDate]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      return { date: d.getDate(), dayName: dayHeaders[i], isToday: d.toDateString() === today.toDateString(), tasks: getTasksForDate(dateStr) };
    });
  }, [getTasksForDate]);

  const formatSelDate = useMemo(() => {
    if (!selectedDay) return "";
    const d = selectedDay.dateObj;
    return `${dayHeaders[d.getDay()]}à¸—à¸µà¹ˆ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  }, [selectedDay]);

  const prevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const nextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };
  const goToday  = () => setCurrentDate(new Date());

  return (
    <ContentContainer titlePage="à¸›à¸à¸´à¸—à¸´à¸™">
      <div className="flex gap-4">

        {/* â•â•â•â•â•â•â•â•â•â• LEFT SIDEBAR â•â•â•â•â•â•â•â•â•â• */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">

          {/* Share button */}
          <button
            onClick={openShareModal}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            à¹€à¸Šà¸´à¸à¹€à¸‚à¹‰à¸²à¸›à¸à¸´à¸—à¸´à¸™
          </button>

          {/* Task type toggles */}
          <div className="bg-white rounded-xl border p-3">
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
              onClick={() => setTypesPanelOpen((v) => !v)}
            >
              à¸›à¸£à¸°à¹€à¸ à¸—à¸ à¸²à¸£à¸à¸´à¸ˆ
              {typesPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {typesPanelOpen && (
              <div className="space-y-1.5">
                {ALL_TYPES.map((key) => {
                  const cfg = TASK_TYPE_CONFIG[key];
                  const active = visibleTypes.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleType(key)}
                      className="flex items-center gap-2.5 w-full text-left group"
                    >
                      {/* Colored checkbox */}
                      <span
                        className="w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition"
                        style={{
                          backgroundColor: active ? cfg.color : "transparent",
                          borderColor: cfg.color,
                        }}
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

        {/* â•â•â•â•â•â•â•â•â•â• MAIN CALENDAR â•â•â•â•â•â•â•â•â•â• */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">â—€</button>
              <h2 className="text-xl font-bold text-[#0d1738] min-w-[180px] text-center">{currentMonthYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">â–¶</button>
              <button onClick={goToday} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition">à¸§à¸±à¸™à¸™à¸µà¹‰</button>
            </div>
            <div className="flex gap-1">
              {(["month", "week"] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {m === "month" ? "à¹€à¸”à¸·à¸­à¸™" : "à¸ªà¸±à¸›à¸”à¸²à¸«à¹Œ"}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
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

      {/* â•â•â•â•â•â•â•â•â•â• DAY DETAIL MODAL â•â•â•â•â•â•â•â•â•â• */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDay(null); }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-[#0d1738]">à¸ à¸²à¸£à¸à¸´à¸ˆ {formatSelDate}</h2>
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              {selectedDay.tasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDay.tasks.map((t) => {
                    const cfg = TASK_TYPE_CONFIG[t.task_type_key] || { label: t.task_type_key, icon: "ðŸ“‹", color: "#6b7280", bgColor: "#f3f4f6" };
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
                  <p><FileText className="w-5 h-5 inline mr-1" />à¹„à¸¡à¹ˆà¸¡à¸µà¸ à¸²à¸£à¸à¸´à¸ˆà¹ƒà¸™à¸§à¸±à¸™à¸™à¸µà¹‰</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â• SHARE CALENDAR MODAL â•â•â•â•â•â•â•â•â•â• */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-gray-900">à¹à¸Šà¸£à¹Œà¸›à¸à¸´à¸—à¸´à¸™à¸ à¸²à¸£à¸à¸´à¸ˆ</h2>
              </div>
              <button onClick={() => setShareOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Invite form */}
              <form onSubmit={handleInvite} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">à¹€à¸Šà¸´à¸à¸”à¹‰à¸§à¸¢à¸­à¸µà¹€à¸¡à¸¥</label>
                {shareError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{shareError}</div>
                )}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="à¸­à¸µà¹€à¸¡à¸¥ Google"
                    required
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "reader" | "writer")}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="reader">à¸”à¸¹à¹„à¸”à¹‰</option>
                    <option value="writer">à¹à¸à¹‰à¹„à¸‚à¹„à¸”à¹‰</option>
                  </select>
                  <button type="submit" disabled={inviting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap">
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "à¹€à¸Šà¸´à¸"}
                  </button>
                </div>
              </form>

              {/* Current shares list */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">à¸œà¸¹à¹‰à¸—à¸µà¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¹€à¸‚à¹‰à¸²à¸–à¸¶à¸‡</p>
                {sharesLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 text-gray-400" /></div>
                ) : shares.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸²à¸£à¹à¸Šà¸£à¹Œ</p>
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
