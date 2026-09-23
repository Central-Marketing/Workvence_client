"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb/Breadcrumb";

interface CategoryHeroBannerProps {
  title: string;
  categoryName?: string;
  subtitle?: string;
  bannerImage?: string;
  banner?: string;
  onExploreGigs?: () => void;
  gigCount?: number;
  homeHref?: string;
  onHomeClick?: () => void;
}

const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({
  title,
  categoryName,
  subtitle,
  bannerImage,
  banner,
  homeHref = "/",
  onHomeClick,
}) => {
  const fallbackBanner = "/media/categoryBannerBg.png";
  const rawBanner = (bannerImage || banner)?.trim();
  const initialBanner = rawBanner && rawBanner !== "" ? rawBanner : fallbackBanner;

  const [imgSrc, setImgSrc] = useState<string>(initialBanner);

  useEffect(() => {
    const nextBanner = (bannerImage || banner)?.trim();
    setImgSrc(nextBanner && nextBanner !== "" ? nextBanner : fallbackBanner);
  }, [bannerImage, banner]);

  const isCustomBanner = imgSrc !== fallbackBanner;

  return (
    <div className="container mx-auto my-5 sm:my-7">
      <div className="relative w-full max-w-[1760px] mx-auto aspect-[1760/500] max-h-[500px] min-h-[160px] sm:min-h-[200px] md:min-h-[240px] rounded-[6px] overflow-hidden bg-[#3a1b08] flex items-center justify-center text-center shadow-xs select-none">
        <Image
          src={imgSrc}
          alt={title || categoryName || "Category Banner"}
          fill
          priority
          quality={100}
          sizes="(max-width: 1760px) 100vw, 1760px"
          className="object-cover object-center pointer-events-none"
          onError={() => setImgSrc(fallbackBanner)}
        />

        {/* Subtle dark overlay for custom photo banners to preserve text legibility */}
        {isCustomBanner && (
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        )}

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          <Breadcrumb
            variant="inverted"
            className="mb-2 sm:mb-3 select-none [&>ol]:justify-center text-xs"
            homeHref={homeHref}
            onHomeClick={onHomeClick}
            items={[
              {
                name: categoryName || title,
                isLast: true,
              },
            ]}
          />
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

