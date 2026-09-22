"use client";

import React from "react";

interface CategoryHeroBannerProps {
  title: string;
  categoryName: string;
  subtitle?: string;
  bannerImage?: string;
  onExploreGigs?: () => void;
  gigCount?: number;
}

const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({
  title,
  categoryName,
}) => {
  return (
    <div className="container mx-auto my-5 sm:my-7">
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[240px] rounded-[6px] overflow-hidden bg-[#3a1b08] flex items-center justify-center text-center shadow-xs select-none">
        {/* Exact Architectural 3-Step Pillars Matching Screenshot */}
        <div className="absolute inset-0 pointer-events-none flex justify-between">
          {/* Left Step Pillars */}
          <div className="h-full flex items-end w-[32%]">
            {/* Outer Left Pillar */}
            <div className="h-[86.4%] w-[33%] bg-[#6b3614]" />
            {/* Middle Left Pillar */}
            <div className="h-[56.7%] w-[34%] bg-[#5f2f11]" />
            {/* Inner Left Step */}
            <div className="h-[27.9%] w-[33%] bg-[#4e250c]" />
          </div>

          {/* Right Step Pillars */}
          <div className="h-full flex items-end justify-end w-[32%]">
            {/* Inner Right Step */}
            <div className="h-[27.9%] w-[33%] bg-[#4e250c]" />
            {/* Middle Right Pillar */}
            <div className="h-[56.7%] w-[34%] bg-[#5f2f11]" />
            {/* Outer Right Pillar */}
            <div className="h-[86.4%] w-[33%] bg-[#6b3614]" />
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4">

          {/* Title in Oblique Sans-Serif Orange */}
          <h1 className="italic text-3xl sm:text-4xl md:text-[46px] lg:text-[50px] leading-tight text-[#ea580c] font-normal tracking-tight drop-shadow-2xs">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeroBanner;
