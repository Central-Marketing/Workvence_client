"use client";

import React from "react";
import { FiSliders, FiArrowRight } from "react-icons/fi";

interface SubcategoryFilterBarProps {
  items: string[];
  activeTag: string;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
  onOpenFilter: () => void;
}

const SubcategoryFilterBar: React.FC<SubcategoryFilterBarProps> = ({
  items = [],
  activeTag,
  onSelectTag,
  onClearTag,
  onOpenFilter,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-4 mb-6 py-2 overflow-x-auto no-scrollbar">
      {/* Left: Filter Trigger Button + Divider + Sub-service Pills */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="flex items-center gap-2 text-gray-800 font-medium text-[13.5px] hover:text-black transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100/70 cursor-pointer shrink-0"
        >
          <FiSliders className="w-4 h-4 text-gray-700" />
          <span>Filter</span>
        </button>

        {/* Vertical Divider */}
        <div className="h-5 w-[1px] bg-gray-200 shrink-0" />

        {/* Sub-service Pills */}
        <div className="flex items-center gap-2">
          {items.map((item, idx) => {
            const isSelected = activeTag.toLowerCase() === item.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => (isSelected ? onClearTag() : onSelectTag(item))}
                className={`px-4 py-1.5 rounded-full text-[13px] sm:text-[13.5px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${isSelected
                  ? "bg-gray-900 text-white border border-gray-900 shadow-xs"
                  : "bg-white text-gray-800 border border-gray-200/90 hover:border-gray-900"
                  }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: View All Button */}
      <button
        type="button"
        onClick={onClearTag}
        className="shrink-0 bg-black text-white hover:bg-neutral-800 px-6 py-3 rounded-[10px] text-[13px] sm:text-[13.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
      >
        <span>View All</span>
        <FiArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SubcategoryFilterBar;
