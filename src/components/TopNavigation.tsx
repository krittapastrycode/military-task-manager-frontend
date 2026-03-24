"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import SideNavigation from "./SideNavigation";

interface TopNavigationProps {
  titlePage: string;
  leftSideContent?: React.ReactNode;
  rightSideContent?: React.ReactNode;
}

export default function TopNavigation({
  titlePage,
  leftSideContent,
  rightSideContent,
}: TopNavigationProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <>
      <div className="h-16 shrink-0 flex items-center border-b border-gray-200 px-4 gap-x-4 min-w-0 bg-white">
        <div className="flex items-center justify-between flex-1 gap-x-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-600"
              onClick={() => setIsOpenMobile(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {leftSideContent}
            <h1 className="flex items-center gap-1.5 font-medium text-xl text-gray-900 min-w-0">
              <span className="truncate">{titlePage}</span>
            </h1>
          </div>
          <div className="flex items-center shrink-0 gap-2">
            {rightSideContent}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#F4F4F4] p-3 shadow-xl z-50">
            <SideNavigation hide={false} onClose={() => setIsOpenMobile(false)} />
          </div>
        </div>
      )}
    </>
  );
}
