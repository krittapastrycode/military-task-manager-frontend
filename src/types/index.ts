export type TaskStatus = "progress" | "pending" | "on-hold" | "success" | "cancel" | "reject" | "delete";

export type TaskTypeKey =
  | "royal_security"   // ถวายความปลอดภัย
  | "vip_protection"   // อารักขา
  | "convoy"           // นำขบวน
  | "traffic"          // จราจร
  | "venue_security";  // อารักขาสถานที่

export type SubTaskStatus = "pending" | "progress" | "success" | "cancel";

export interface ISubTask {
  id: string;
  task_id: string;
  step_key: string;
  title: string;
  status: SubTaskStatus;
  order: number;
  content: Record<string, any> | null;
  assigned_by: string | null;
  assigned_admin?: IAdmin | null;
  created_at: string;
  updated_at: string;
}

export interface ITaskGroup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  user_id: string;
  tasks_count?: number;
  completed_tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ITask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  task_type_key: TaskTypeKey;
  priority: "low" | "medium" | "high" | "urgent";
  deadline_at: string | null;
  completed_at: string | null;
  content: Record<string, any> | null;
  meta: Record<string, any> | null;
  task_group_id: string | null;
  task_group?: ITaskGroup | null;
  user_id: string;
  creator?: IAdmin | null;
  sub_task?: ISubTask[];
  sub_tasks_count?: number;
  completed_sub_tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface IAdmin {
  id: string;
  name: string;
  email: string;
  rank?: string;
  position?: string;
  role?: string[];
  permissions?: string[];
  created_at?: string;
}

export interface IPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface INotification {
  id: string;
  message: string;
  task_id: string | null;
  task_type_key: TaskTypeKey | null;
  read_at: string | null;
  created_at: string;
  created_at_for_humans: string;
}

export const TASK_TYPE_CONFIG: Record<TaskTypeKey, { label: string; icon: string; color: string; bgColor: string }> = {
  royal_security:  { label: "ถวายความปลอดภัย",  icon: "👑", color: "#b45309", bgColor: "#fef3c7" },
  vip_protection:  { label: "อารักขา",          icon: "🛡️", color: "#059669", bgColor: "#d1fae5" },
  convoy:          { label: "นำขบวน",           icon: "🚔", color: "#2563eb", bgColor: "#dbeafe" },
  traffic:         { label: "จราจร",            icon: "🚦", color: "#d97706", bgColor: "#fef9c3" },
  venue_security:  { label: "อารักขาสถานที่",    icon: "🏛️", color: "#7c3aed", bgColor: "#ede9fe" },
};

/* ─── Dynamic fields per task type (stored in content JSON) ─── */
export interface ITaskTypeField {
  key: string;
  label: string;
  type: "text" | "datetime-local" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export const TASK_TYPE_FIELDS: Record<TaskTypeKey, ITaskTypeField[]> = {
  royal_security: [
    { key: "royal_name", label: "ชื่อพระบรมวงศานุวงศ์ / รหัสประจำพระองค์", type: "text", placeholder: "ระบุพระนาม หรือ รหัสประจำพระองค์", required: true },
    { key: "origin", label: "ออกมาจากที่ใด", type: "text", placeholder: "สถานที่ต้นทาง" },
    { key: "time", label: "เวลา", type: "datetime-local" },
    { key: "destination", label: "จะเสด็จไปที่ไหน", type: "text", placeholder: "สถานที่ปลายทาง" },
  ],
  vip_protection: [
    { key: "vip_name", label: "ชื่อ VIP", type: "text", placeholder: "ชื่อ-นามสกุล บุคคลสำคัญ", required: true },
    { key: "vehicle_info", label: "ทะเบียน สี ยี่ห้อ รถ", type: "text", placeholder: "เช่น กก-1234 สีดำ Toyota Camry" },
    { key: "origin", label: "เดินทางออกจากที่ไหน", type: "text", placeholder: "สถานที่ต้นทาง" },
    { key: "arrival_time", label: "เวลาออกเดินทางมายังพื้นที่ ทอ.", type: "datetime-local" },
    { key: "destination", label: "จะเดินทางไปที่ไหน", type: "text", placeholder: "สถานที่ปลายทาง" },
  ],
  convoy: [
    { key: "vehicle_or_group", label: "ทะเบียน/ยี่ห้อรถ หรือชื่อคณะ", type: "text", placeholder: "เช่น กก-1234 สีดำ หรือ คณะกรรมาธิการฯ", required: true },
    { key: "destination", label: "ไปที่ไหน", type: "text", placeholder: "สถานที่ปลายทาง" },
  ],
  traffic: [
    { key: "vehicle_info", label: "ทะเบียน สี ยี่ห้อ รถ", type: "text", placeholder: "เช่น กก-1234 สีดำ Toyota Camry" },
    { key: "venue", label: "สถานที่จัดงาน", type: "text", placeholder: "ระบุสถานที่", required: true },
    { key: "parking_allowed", label: "ใครจอดได้บ้าง", type: "textarea", placeholder: "ระบุรายละเอียดผู้ได้รับอนุญาต" },
    { key: "traffic_direction", label: "เดินรถทางไหน", type: "text", placeholder: "ระบุเส้นทางเดินรถ" },
  ],
  venue_security: [
    { key: "date_range", label: "วันที่เริ่ม - วันที่สิ้นสุด", type: "text", placeholder: "เช่น 1-5 เม.ย. 2569", required: true },
    { key: "start_time", label: "เวลางานเริ่มกี่โมง", type: "text", placeholder: "เช่น 08:00 น." },
  ],
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  progress: { label: "กำลังดำเนินการ", color: "#2563eb", bgColor: "#dbeafe" },
  pending:  { label: "รอดำเนินการ",   color: "#d97706", bgColor: "#fef3c7" },
  "on-hold": { label: "พักไว้",       color: "#6b7280", bgColor: "#f3f4f6" },
  success:  { label: "สำเร็จ",        color: "#059669", bgColor: "#d1fae5" },
  cancel:   { label: "ยกเลิก",        color: "#dc2626", bgColor: "#fee2e2" },
  reject:   { label: "ปฏิเสธ",        color: "#9333ea", bgColor: "#f3e8ff" },
  delete:   { label: "ลบแล้ว",        color: "#374151", bgColor: "#e5e7eb" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "ต่ำ",     color: "#6b7280" },
  medium: { label: "ปานกลาง", color: "#d97706" },
  high:   { label: "สูง",     color: "#dc2626" },
  urgent: { label: "เร่งด่วน", color: "#7c2d12" },
};
