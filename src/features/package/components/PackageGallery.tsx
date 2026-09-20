"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiMaximize2, FiX } from "react-icons/fi";
import { Button } from "@/components/ui";

interface PackageGalleryProps {
  mainBanner?: string;
  thumbnails?: string[];
  title: string;
}

export const PackageGallery: React.FC<PackageGalleryProps> = ({
  mainBanner,
  thumbnails = [],
  title,
}) => {
  // Collect all real unique images
  const allImages = Array.from(
    new Set([mainBanner, ...thumbnails].filter((img): img is string => Boolean(img && img.trim())))
  );

  const heroImage = allImages[0] || "";
  const [activeImage, setActiveImage] = useState(heroImage);
  const [activeThumbIndex, setActiveThumbIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = useState<number | null>(null);

  useEffect(() => {
    if (heroImage && (!activeImage || !allImages.includes(activeImage))) {
      setActiveImage(heroImage);
      setActiveThumbIndex(0);
    }
  }, [heroImage]);

  const hasThumbnails = allImages.length > 1;
  const hasMoreThan5 = allImages.length > 5;

  useEffect(() => {
    if (!hasMoreThan5) {
      setItemHeight(null);
      return;
    }

    const calcHeight = () => {
      if (containerRef.current) {
        const ch = containerRef.current.clientHeight;
        if (ch > 0) {
          const h = (ch - 32) / 4.5;
          setItemHeight(h);
        }
      }
    };

    calcHeight();
    window.addEventListener("resize", calcHeight);
    return () => window.removeEventListener("resize", calcHeight);
  }, [hasMoreThan5, allImages.length]);

  const handleSelectThumb = (img: string, idx: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    setActiveImage(img);
    setActiveThumbIndex(idx);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  if (allImages.length === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[340px] rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 mb-8 p-6 text-center">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-gray-400 mt-1">No cover image uploaded</span>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Side-by-side Gallery when multiple images, or full-width hero when 1 image */}
      <div className="flex gap-2.5 sm:gap-3 h-[320px] sm:h-[380px] md:h-[420px]">
        {/* Main Hero Image */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="flex-1 h-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-100 relative group cursor-pointer shadow-xs"
        >
          <img
            src={activeImage || heroImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Expand Icon on Hover */}
          <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-sm">
            <FiMaximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Stacked Thumbnails (only shown if seller uploaded multiple images) */}
        {hasThumbnails && (
          <div
            ref={containerRef}
            className={`w-[80px] sm:w-[95px] md:w-[105px] flex flex-col gap-2 h-full shrink-0 ${
              hasMoreThan5
                ? "overflow-y-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-y-contain"
                : "justify-start"
            }`}
          >
            {allImages.map((img, idx) => {
              const isSelected = activeImage === img;

              return (
                <Button
                  key={idx}
                  type="button"
                  variant="ghost"
                  size="xs"
                  radius="xl"
                  onClick={(e) => handleSelectThumb(img, idx, e)}
                  style={
                    hasMoreThan5
                      ? {
                          height: itemHeight ? `${itemHeight}px` : "calc((100% - 32px) / 4.5)",
                          minHeight: itemHeight ? `${itemHeight}px` : "calc((100% - 32px) / 4.5)",
                          flexBasis: itemHeight ? `${itemHeight}px` : "calc((100% - 32px) / 4.5)",
                        }
                      : { height: "76px", minHeight: "76px" }
                  }
                  className={`relative w-full !p-0 !min-h-0 overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 shadow-2xs shrink-0 ${
                    isSelected
                      ? "border-brand-green ring-1 ring-brand-green scale-[0.98]"
                      : "border-transparent opacity-80 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-6 select-none animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-semibold bg-white/10 px-3.5 py-1 rounded-full">
              {title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors p-0"
              icon={<FiX className="w-5 h-5" />}
            />
          </div>

          {/* Main Large Image */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage || heroImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Bottom Thumbnails Strip */}
          {hasThumbnails && (
            <div className="flex items-center gap-2.5 max-w-full overflow-x-auto p-2 no-scrollbar z-10" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="ghost"
                  size="xs"
                  radius="lg"
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 !p-0 !min-h-0 overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImage === img ? "border-white scale-105" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
