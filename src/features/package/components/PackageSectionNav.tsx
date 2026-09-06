"use client";

import React from "react";

interface PackageSectionNavProps {
  activeSection: string;
  reviewCount?: number;
  onNavigate: (sectionId: string) => void;
}

export const PackageSectionNav: React.FC<PackageSectionNavProps> = ({
  activeSection,
  reviewCount = 20,
  onNavigate,
}) => {
  const sections = [
    { id: "section-about", label: "About" },
    { id: "section-seller", label: "Seller Info" },
    { id: "section-packages", label: "Packages" },
    { id: "section-reviews", label: "Review", badge: reviewCount },
    { id: "section-faq", label: "FAQ" },
  ];

  return (
    <div className="w-full bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-1.5 mb-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky top-20 z-20 shadow-2xs">
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onNavigate(sec.id)}
            className={`px-5 py-2 rounded-xl text-[13.5px] font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#0F172A] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            <span>{sec.label}</span>
            {sec.badge !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                  isActive ? "bg-teal-700/80 text-teal-100" : "bg-teal-100 text-teal-800"
                }`}
              >
                {sec.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
