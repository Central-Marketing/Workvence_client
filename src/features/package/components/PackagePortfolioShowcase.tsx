"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface PackagePortfolioShowcaseProps {
  sellerPackages?: any[];
  sellerName?: string;
}

export const PackagePortfolioShowcase: React.FC<PackagePortfolioShowcaseProps> = ({
  sellerPackages = [],
  sellerName = "Seller",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!Array.isArray(sellerPackages) || sellerPackages.length === 0) {
    return null;
  }

  const currentPkg = sellerPackages[activeIndex] || sellerPackages[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : sellerPackages.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < sellerPackages.length - 1 ? prev + 1 : 0));
  };

  const coverImage = currentPkg.cover || (Array.isArray(currentPkg.images) && currentPkg.images[0]) || "";
  const pkgUrl = `/package/${currentPkg.slug || currentPkg._id || currentPkg.id}`;

  return (
    <div id="section-packages" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            More Services by {sellerName}
          </h2>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
            {sellerPackages.length} {sellerPackages.length === 1 ? 'Package' : 'Packages'}
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        {sellerPackages.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous package"
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next package"
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Active Package Showcase Card */}
      <Link href={pkgUrl} className="block group">
        <div className="relative aspect-[16/9] sm:aspect-[2.1/1] w-full rounded-2xl overflow-hidden mb-4 shadow-sm bg-gray-950">
          {coverImage && (
            <img
              src={coverImage}
              alt={currentPkg.title || "Package Cover"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}

          {/* Frosted Glass Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-1.5 drop-shadow-sm group-hover:text-brand-green transition-colors">
              {currentPkg.title}
            </h3>
            {currentPkg.shortDesc && (
              <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-2xl mb-4 leading-relaxed font-normal">
                {currentPkg.shortDesc}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/15">
              <div className="flex items-center gap-6 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Starting At</span>
                  <span className="font-bold text-white">${currentPkg.price}</span>
                </div>
                {currentPkg.deliveryTime && (
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Delivery</span>
                    <span className="font-bold text-white">{currentPkg.deliveryTime}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {Array.isArray(currentPkg.tags) && currentPkg.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentPkg.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-white/15 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Thumbnails of other packages if more than 1 */}
      {sellerPackages.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {sellerPackages.map((pkg, idx) => {
            const isSelected = activeIndex === idx;
            const thumbImg = pkg.cover || (Array.isArray(pkg.images) && pkg.images[0]) || "";
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 ${
                  isSelected
                    ? "border-brand-green ring-1 ring-brand-green shadow-xs scale-98"
                    : "border-transparent opacity-75 hover:opacity-100 hover:border-gray-300"
                }`}
              >
                {thumbImg && (
                  <img
                    src={thumbImg}
                    alt={pkg.title || ""}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
