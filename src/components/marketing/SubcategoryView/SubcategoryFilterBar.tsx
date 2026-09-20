"use client";

import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui";

interface SubcategoryFilterBarProps {
  items: string[];
  activeTag: string;
  isFilterOpen?: boolean;
  onSelectTag: (tag: string) => void;
  onClearTag?: () => void;
  onViewAll?: () => void;
  onOpenFilter: () => void;
  className?: string;
}

const SubcategoryFilterBar: React.FC<SubcategoryFilterBarProps> = ({
  items = [],
  activeTag,
  isFilterOpen = false,
  onSelectTag,
  onClearTag,
  onViewAll,
  onOpenFilter,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-3 gap-x-2 sm:gap-4 ${className}`}>
      {/* Filter Toggle Button (Top-left on mobile, Left on desktop) */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        radius="lg"
        onClick={onOpenFilter}
        className="order-1 flex items-center gap-1.5 hover:opacity-80 px-2 py-1.5 hover:bg-gray-100/70 shrink-0 h-auto font-normal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5.8335 17.5V15" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.1665 17.5V12.5" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.1665 5V2.5" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.8335 7.5V2.5" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.8335 15C5.05693 15 4.66865 15 4.36235 14.8732C3.95398 14.704 3.62952 14.3795 3.46036 13.9712C3.3335 13.6648 3.3335 13.2766 3.3335 12.5C3.3335 11.7234 3.3335 11.3352 3.46036 11.0288C3.62952 10.6205 3.95398 10.296 4.36235 10.1268C4.66865 10 5.05693 10 5.8335 10C6.61006 10 6.99835 10 7.30464 10.1268C7.71301 10.296 8.03747 10.6205 8.20663 11.0288C8.3335 11.3352 8.3335 11.7234 8.3335 12.5C8.3335 13.2766 8.3335 13.6648 8.20663 13.9712C8.03747 14.3795 7.71301 14.704 7.30464 14.8732C6.99835 15 6.61006 15 5.8335 15Z" stroke="#868686" strokeWidth="1.5" />
          <path d="M14.1665 10C13.3899 10 13.0017 10 12.6953 9.87317C12.287 9.704 11.9625 9.3795 11.7933 8.97117C11.6665 8.66483 11.6665 8.27657 11.6665 7.5C11.6665 6.72343 11.6665 6.33515 11.7933 6.02886C11.9625 5.62048 12.287 5.29602 12.6953 5.12687C13.0017 5 13.3899 5 14.1665 5C14.9431 5 15.3313 5 15.6377 5.12687C16.046 5.29602 16.3705 5.62048 16.5397 6.02886C16.6665 6.33515 16.6665 6.72343 16.6665 7.5C16.6665 8.27657 16.6665 8.66483 16.5397 8.97117C16.3705 9.3795 16.046 9.704 15.6377 9.87317C15.3313 10 14.9431 10 14.1665 10Z" stroke="#868686" strokeWidth="1.5" />
        </svg>
        <span className="text-[var(--Foundation-Grey-grey-300,#868686)] font-sf-pro text-[16px] font-[510] not-italic leading-normal">
          Filter
        </span>
        {isFilterOpen && (
          <span className="flex items-center justify-center text-red-500 hover:text-red-600 ml-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5.00068 14.9993M14.9993 15L5 5.00071" stroke="#F00000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </Button>

      {/* Vertical Divider (Desktop only) */}
      <div className="hidden sm:block sm:order-2 h-5 w-[1px] bg-gray-200 shrink-0" />

      {/* Sub-service Pills (Full-width row 2 on mobile, scrollable row in middle on desktop) */}
      <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-0.5 min-w-0">
        {items.map((item, idx) => {
          const isSelected = activeTag.toLowerCase() === item.toLowerCase();
          return (
            <Button
              key={idx}
              type="button"
              variant={isSelected ? "dark" : "outline"}
              size="sm"
              radius="full"
              onClick={() => (isSelected ? onClearTag?.() : onSelectTag(item))}
              className={`px-3.5 sm:px-4 py-1.5 text-sm sm:text-base font-[510] font-sf-pro whitespace-nowrap shrink-0 ${isSelected
                ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                : "bg-white text-gray-800 border-gray-200/90 hover:border-gray-900"
                }`}
            >
              {item}
            </Button>
          );
        })}
      </div>

      {/* Right: View All Button (Top-right on mobile, Far-right on desktop) */}
      <Button
        type="button"
        variant="dark"
        size="sm"
        radius="full"
        onClick={onViewAll || onClearTag}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
        className="order-2 sm:order-3 shrink-0 px-3.5 sm:px-4 py-1.5 text-sm sm:text-base font-[510] font-sf-pro whitespace-nowrap shadow-xs hover:bg-neutral-800 ml-auto sm:ml-0"
      >
        <span>View All</span>
      </Button>
    </div>
  );
};

export default SubcategoryFilterBar;
