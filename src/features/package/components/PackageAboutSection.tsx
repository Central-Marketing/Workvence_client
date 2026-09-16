"use client";

import React from "react";

interface PackageAboutSectionProps {
  description: string;
  categoryName?: string;
  subcategoryName?: string;
  basicPackage?: any;
  areaCovered?: string[];
  tools?: string[];
  whyMe?: string[];
}

export const PackageAboutSection: React.FC<PackageAboutSectionProps> = ({
  description,
  categoryName,
  subcategoryName,
}) => {
  const badgeText = subcategoryName || categoryName || "Service Package";

  return (
    <div id="section-about" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          About this package
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-md">
          {badgeText}
        </span>
      </div>

      {/* Description Content (HTML rendered cleanly) */}
      <div
        className="text-[14.5px] sm:text-[15px] text-gray-700 leading-relaxed prose prose-slate max-w-none [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
        dangerouslySetInnerHTML={{ __html: description || "<p>No description provided.</p>" }}
      />
    </div>
  );
};
