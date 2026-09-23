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
    <div
      id="section-about"
      className="scroll-mt-36 w-full max-w-full overflow-hidden bg-[#F5F5F5] border border-gray-100 rounded-[6px] p-5 sm:p-6 md:p-8 mb-10 shadow-2xs break-words [overflow-wrap:anywhere]"
    >
      {/* Section Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-6 pb-2">
        <h2 className="text-xl font-bold text-gray-900 ">
          About this package
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-[6px] max-w-full truncate">
          {badgeText}
        </span>
      </div>

      {/* Description Content (HTML rendered cleanly and fully responsive) */}
      <div
        className="w-full max-w-full overflow-hidden text-[14.5px] sm:text-[15px] text-gray-700 leading-relaxed prose prose-slate max-w-none break-words [overflow-wrap:anywhere] [word-break:break-word] [&_p]:break-words [&_p]:[overflow-wrap:anywhere] [&_span]:break-words [&_span]:[overflow-wrap:anywhere] [&_a]:break-all [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_*]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-[6px] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block [&_iframe]:max-w-full"
        dangerouslySetInnerHTML={{ __html: description || "<p>No description provided.</p>" }}
      />
    </div>
  );
};
