"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronsLeft } from "lucide-react";
import SideNavigation from "@/components/SideNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        className={`hidden lg:flex flex-col ${hide ? "w-20" : "w-[280px]"} p-4 relative z-20 transition-all duration-200`}
      >
        <div
          className={`flex flex-col bg-[#F4F4F4] h-full rounded-xl shadow-inner ${
            hide ? "px-1 py-2 rounded-lg" : "py-3 px-2"
          }`}
        >
          <SideNavigation hide={hide} />
        </div>

        {/* Collapse toggle */}
        <button
          className="absolute right-5 top-5 p-1 rounded hover:bg-gray-200 transition-transform duration-200 text-gray-500"
          onClick={() => setHide(!hide)}
        >
          <ChevronsLeft
            className={`w-4 h-4 transition-transform duration-200 ${hide ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
