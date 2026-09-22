"use client";

import React from "react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui";

interface PackageSectionNavProps {
  activeSection: string;
  reviewCount?: number;
  onNavigate: (sectionId: string) => void;
  isSeller?: boolean;
}

export const PackageSectionNav: React.FC<PackageSectionNavProps> = ({
  activeSection,
  reviewCount = 20,
  onNavigate,
  isSeller,
}) => {
  const storeUser = useUserStore((state) => state.user);
  const isUserSeller = isSeller !== undefined ? isSeller : Boolean(storeUser?.isSeller);

  const sections = [
    { id: "section-about", label: "About" },
    { id: "section-seller", label: "Seller Info" },
    { id: "section-packages", label: "Packages" },
    { id: "section-reviews", label: "Review", badge: reviewCount },
    { id: "section-faq", label: "FAQ" },
  ];

  // Responsive fallback values if CSS custom property is pending hydration
  const fallbackTopClass = isUserSeller
    ? "top-[74px] md:top-[92px]"
    : "top-[128px] md:top-[146px]";

  return (
    <div
      id="package-section-nav"
      style={{
        top: `calc(var(--navbar-height, ${isUserSeller ? "82px" : "136px"}) + 10px)`,
      }}
      className={`w-full bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-[6px] p-1.5 mb-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky z-30 shadow-xs transition-[top] duration-200 ${fallbackTopClass}`}
    >
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <Button
            key={sec.id}
            type="button"
            variant={isActive ? "brand" : "ghost"}
            size="sm"
            radius="lg"
            onClick={() => onNavigate(sec.id)}
            className={`px-5 py-2 text-[13.5px] font-medium flex items-center gap-2 whitespace-nowrap cursor-pointer ${isActive
              ? "!bg-brand-green !text-white shadow-xs"
              : "!text-gray-600 hover:!text-gray-900 hover:!bg-gray-200/50"
              }`}
          >
            <span>{sec.label}</span>
            {sec.badge !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${isActive ? "bg-teal-700/80 text-teal-100" : "bg-teal-100 text-teal-800"
                  }`}
              >
                {sec.badge}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
