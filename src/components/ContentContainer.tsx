"use client";

import TopNavigation from "./TopNavigation";

interface ContentContainerProps {
  titlePage: string;
  leftSideContent?: React.ReactNode;
  rightSideContent?: React.ReactNode;
  children: React.ReactNode;
}

export default function ContentContainer({
  titlePage,
  leftSideContent,
  rightSideContent,
  children,
}: ContentContainerProps) {
  return (
    <div className="flex flex-1 w-full min-w-0 overflow-y-auto">
      <div className="flex-col items-stretch relative w-full flex-1 flex">
        <TopNavigation
          titlePage={titlePage}
          leftSideContent={leftSideContent}
          rightSideContent={rightSideContent}
        />
        <div className="flex flex-col z-10 lg:pl-0 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
