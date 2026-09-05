"use client";

import React from "react";
import Link from "next/link";

interface CategoryHeroBannerProps {
  title: string;
  categoryName: string;
  subtitle?: string;
  bannerImage?: string;
}

const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({
  title,
  categoryName,
}) => {
  return (
    <div className="container mx-auto px-4 md:px-6 my-5 sm:my-7">
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[240px] rounded-2xl overflow-hidden bg-[#3a1b08] flex items-center justify-center text-center shadow-xs select-none">
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
          {/* Breadcrumb Navigation */}
          <div className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px] text-[#b8a096] mb-2 sm:mb-3 font-normal tracking-wide">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5 text-[#b8a096] stroke-[1.5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
            <span className="text-[#8f7469]">/</span>
            <span>{categoryName.replace('& Design', '').replace('and Design', '').trim()}</span>
          </div>

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
