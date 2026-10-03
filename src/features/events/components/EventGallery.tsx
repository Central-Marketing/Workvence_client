"use client";

import React, { useState } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";

interface EventGalleryProps {
  images?: string[];
  title?: string;
}

export const EventGallery: React.FC<EventGalleryProps> = ({ images, title = "Event Photos" }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  // Filter out invalid blob: URLs that may not be reachable in public sessions
  const validImages = images.filter((img) => img && typeof img === "string");

  if (validImages.length === 0) return null;

  const handleNext = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % validImages.length);
    }
  };

  const handlePrev = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + validImages.length) % validImages.length);
    }
  };

  return (
    <div className="space-y-3 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <Images className="w-4 h-4 text-[#0D6D5F]" />
        <h3 className="font-sf-pro font-semibold text-lg text-[#112131]">
          Event Gallery
        </h3>
      </div>

      {/* Grid of Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveImageIndex(idx)}
            className="group relative aspect-[4/3] rounded-[6px] overflow-hidden bg-gray-100 border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-[#0D6D5F]"
          >
            <img
              src={img}
              alt={`${title} - Photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden">
            <img
              src={validImages[activeImageIndex]}
              alt={`${title} - Preview`}
              className="max-w-full max-h-[85vh] object-contain rounded-[4px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
