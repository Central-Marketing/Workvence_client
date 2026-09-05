"use client";

import React from "react";

interface SubcategoryCardProps {
  title: string;
  banner: string;
  items: string[];
  onSelectService: (serviceName: string) => void;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  title,
  banner,
  items,
  onSelectService,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Inset Rounded Banner Image with Padding */}
      <div className="p-3 pb-0">
        <div className="relative w-full aspect-[2.04/1] bg-gray-50 rounded-xl overflow-hidden">
          <img
            src={banner}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Card Header Title */}
      <div className="px-4 pt-3.5 pb-2">
        <h3 className="font-bold text-[15px] sm:text-[15.5px] text-gray-900 leading-snug tracking-tight">
          {title}
        </h3>
      </div>

      {/* Sub-services List */}
      <div className="flex-1 flex flex-col divide-y divide-gray-100 text-[12.5px] sm:text-[13px] text-[#4b5563] pb-1">
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectService(item)}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50/50 hover:text-brand-green transition-colors cursor-pointer group"
          >
            <span className="truncate block font-normal group-hover:font-medium">
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryCard;
