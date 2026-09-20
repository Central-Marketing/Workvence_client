"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { FiArrowRight } from "react-icons/fi";
import { getFallbackSubcategoryBanner } from "@/data/categoryTaxonomy";

interface SubcategoryCardProps {
  id?: string;
  title: string;
  banner?: string;
  items: string[];
  onSelectService: (serviceName: string, subcatId?: string, subcatTitle?: string) => void;
  onSelectSubcategory?: (subcatId: string, subcatTitle: string) => void;
}

const isValidBanner = (url?: unknown): boolean => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''" || trimmed === "null" || trimmed === "undefined") {
    return false;
  }
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
};

const resolveBanner = (rawBanner?: string, contextTitle: string = "", contextId: string = ""): string => {
  if (isValidBanner(rawBanner)) {
    return (rawBanner as string).trim();
  }
  return getFallbackSubcategoryBanner(contextTitle || contextId);
};

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  id,
  title,
  banner,
  items,
  onSelectService,
  onSelectSubcategory,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => resolveBanner(banner, title, id));

  useEffect(() => {
    setImgSrc(resolveBanner(banner, title, id));
  }, [banner, title, id]);

  const handleBannerError = () => {
    const fallback = getFallbackSubcategoryBanner(title || id);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const handleCardClick = () => {
    if (onSelectSubcategory) {
      onSelectSubcategory(id || title, title);
    } else {
      onSelectService(title, id || title, title);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Inset Rounded Banner Image with Padding */}
      <div className="p-3 pb-0">
        <div
          onClick={handleCardClick}
          className="relative w-full aspect-[385/190] bg-gray-50 rounded-[5px] overflow-hidden cursor-pointer group/banner"
          title={title}
        >
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 25vw, 385px"
            className="w-full h-full object-cover rounded-[5px] group-hover/banner:scale-105 transition-transform duration-500"
            onError={handleBannerError}
            unoptimized
          />
        </div>
      </div>

      {/* Card Header Title */}
      <div className="px-4 pt-3.5 pb-2">
        <h3
          onClick={handleCardClick}
          className="font-bold text-[15px] sm:text-[15.5px] text-gray-900 leading-snug tracking-tight hover:text-brand-green cursor-pointer transition-colors"
        >
          {title}
        </h3>
      </div>

      {/* Sub-services List */}
      <div className="flex-1 flex flex-col divide-y divide-gray-100 text-[12.5px] sm:text-[13px] text-[#4b5563] pb-1">
        {items.map((item, idx) => (
          <Button
            key={idx}
            type="button"
            variant="ghost"
            size="sm"
            radius="none"
            fullWidth
            onClick={() => onSelectService(item, id || title, title)}
            rightIcon={
              <FiArrowRight className="w-3.5 h-3.5 text-brand-green opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
            }
            className="w-full !justify-between text-left px-4 py-2.5 hover:bg-gray-50/50 text-[#4b5563] hover:text-brand-green transition-colors cursor-pointer group font-normal text-[12.5px] sm:text-[13px] border-none shadow-none h-auto min-h-0 [&>span:first-child]:text-left [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1"
          >
            <span className="truncate text-left block font-normal group-hover:font-medium">
              {item}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryCard;
