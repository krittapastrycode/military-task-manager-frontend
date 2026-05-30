"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ClipboardList,
  ListTodo,
  Calendar,
  BarChart3,
  Users,
  Settings,
  LogOut,
  X,
  MoreVertical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  to: string;
  text: string;
  Icon: LucideIcon;
  privileged?: boolean; // commander + admin only
}

const menus: MenuItem[] = [
  { to: "/home", text: "ภารกิจวันนี้", Icon: ClipboardList },
  { to: "/task", text: "จัดการภารกิจ", Icon: ListTodo },
  { to: "/calendar", text: "ปฏิทิน", Icon: Calendar },
  { to: "/report", text: "รายงาน", Icon: BarChart3, privileged: true },
  { to: "/personnel", text: "กำลังพล", Icon: Users, privileged: true },
  { to: "/settings", text: "การตั้งค่า", Icon: Settings },
];

interface SideNavigationProps {
  hide: boolean;
  onClose?: () => void;
}

export default function SideNavigation({ hide, onClose }: SideNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isPrivileged, setIsPrivileged] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setProfile(p);
        const roles: string[] = Array.isArray(p?.role) ? p.role : [p?.role ?? "user"];
        setIsPrivileged(roles.includes("admin") || roles.includes("commander"));
      } catch {}
    }
  }, []);

  const visibleMenus = menus.filter((m) => !m.privileged || isPrivileged);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-1 justify-between h-full">
      <div className="flex flex-col gap-1">
        {/* Brand */}
        <div className={`mb-3 flex gap-2 items-center ${hide ? "justify-center" : "pl-3"}`}>
          {onClose && (
            <button
              className="lg:hidden p-1 rounded hover:bg-gray-200"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <Link href="/home" className="flex items-center gap-2">
            <img
              src="/Emblem_of_the_Royal_Thai_Air_Force.svg.png"
              alt="Logo"
              className={hide ? "w-8 h-8" : "w-10 h-10"}
            />
            {!hide && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-[#0d1738]">Military</span>
                <span className="font-semibold text-sm text-indigo-600">Task Manager</span>
              </div>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        {visibleMenus.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={`rounded-md text-base font-normal px-2 py-2.5 gap-2.5 flex items-center text-gray-800 transition-colors
              ${hide ? "justify-center" : ""}
              ${pathname === item.to || pathname?.startsWith(item.to + "/")
                ? "bg-gray-200 font-medium"
                : "hover:bg-gray-200"
              }`}
          >
            <item.Icon className="w-5 h-5 shrink-0" />
            {!hide && <span className="truncate">{item.text}</span>}
          </Link>
        ))}
      </div>

      {/* User Section */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`rounded-md text-sm font-normal px-2 py-2 gap-2 flex items-center w-full hover:bg-gray-200 transition-colors
              ${hide ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#0d1738] text-white flex items-center justify-center text-sm font-bold shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!hide && (
              <>
                <span className="select-none text-base truncate flex-1 text-left">
                  {profile?.name || "Officer"}
                </span>
                <span className="text-gray-400 ml-auto"><MoreVertical className="w-4 h-4" /></span>
              </>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-60 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium">ลงชื่อเข้าใช้ด้วย</p>
                <p className="text-sm text-gray-600 truncate">
                  {profile?.email || "admin@military.go.th"}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
