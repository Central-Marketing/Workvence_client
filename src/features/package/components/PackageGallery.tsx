"use client";

import React, { useState } from "react";
import { FiMaximize2, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { FALLBACK_IMAGES } from "../utils/packageDetailsNormalizer";

interface PackageGalleryProps {
  mainBanner?: string;
  thumbnails?: string[];
  title: string;
}

export const PackageGallery: React.FC<PackageGalleryProps> = ({
  mainBanner = FALLBACK_IMAGES.mainBanner,
  thumbnails = FALLBACK_IMAGES.thumbs,
  title,
}) => {
  const thumbList = thumbnails.length > 0 ? thumbnails : FALLBACK_IMAGES.thumbs;
  const allImages = [mainBanner, ...thumbList];

  const [activeImage, setActiveImage] = useState(mainBanner);
  const [activeThumbIndex, setActiveThumbIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleSelectThumb = (img: string, idx: number) => {
    setActiveImage(img);
    setActiveThumbIndex(idx);
  };

  return (
    <div className="w-full mb-8">
      {/* Side-by-side Gallery: Main Display (left) + 5 Stacked Thumbnails (right) */}
      <div className="flex gap-2.5 sm:gap-3 h-[320px] sm:h-[380px] md:h-[420px]">
        {/* Left: Large Main Hero Image */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="flex-1 h-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 relative group cursor-pointer shadow-xs"
        >
          <img
            src={activeImage || FALLBACK_IMAGES.mainBanner}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGES.mainBanner;
            }}
          />

          {/* Expand Icon on Hover */}
          <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-sm">
            <FiMaximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Right: Exactly 5 Stacked Thumbnails matching the height of Main Display */}
        <div className="w-[80px] sm:w-[95px] md:w-[105px] flex flex-col justify-between gap-2 h-full shrink-0">
          {thumbList.slice(0, 5).map((img, idx) => {
            const isSelected = activeThumbIndex === idx || (activeThumbIndex === null && activeImage === img);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectThumb(img, idx)}
                className={`relative flex-1 w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 shadow-2xs ${
                  isSelected
                    ? "border-gray-900 ring-1 ring-gray-900 scale-[0.98]"
                    : "border-transparent opacity-85 hover:opacity-100 hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGES.fallbackPlaceholder;
                  }}
                />
              </button>
            );
          })}
        </div>
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
              Preview
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Main Large Image */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center gap-2.5 max-w-full overflow-x-auto p-2 no-scrollbar z-10" onClick={(e) => e.stopPropagation()}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  activeImage === img ? "border-white scale-105" : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
