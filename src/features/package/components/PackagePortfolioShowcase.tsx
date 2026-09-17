"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mouse Drag-to-Scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Keep the active thumbnail scrolled into view
  useEffect(() => {
    if (scrollContainerRef.current && scrollContainerRef.current.children[activeIndex]) {
      const activeEl = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

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
    <div id="section-packages" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
          <h2 className="text-[20px] min-[400px]:text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-[590] font-sf-pro text-[var(--Foundation-Grey-grey-800,#292929)] not-italic leading-tight tracking-tight">
            Packages
          </h2>
          <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--Foundation-Grey-grey-100,#C7C7C7)] bg-[var(--Foundation-Grey-grey-50,#EDEDED)] px-2 sm:px-[10px] py-0.5 sm:py-[4px] text-xs sm:text-sm md:text-[16px] font-[510] font-sf-pro text-[var(--Foundation-Grey-grey-400,#6E6E6E)] not-italic leading-normal shrink-0">
            <span className="font-bold text-[var(--Foundation-Grey-grey-700,#353535)] font-sf-pro not-italic leading-normal">
              {sellerPackages.length}
            </span>
            <span>
              {sellerPackages.length === 1 ? 'Package' : 'Packages'}
            </span>
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

      {/* Thumbnails of other packages in single scrollable row with drag-to-scroll */}
      {sellerPackages.length > 1 && (
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {sellerPackages.map((pkg, idx) => {
            const isSelected = activeIndex === idx;
            const thumbImg = pkg.cover || (Array.isArray(pkg.images) && pkg.images[0]) || "";
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!hasMoved) setActiveIndex(idx);
                }}
                className={`relative w-[130px] sm:w-[160px] md:w-[180px] shrink-0 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 active:scale-95 ${isSelected
                    ? "border-brand-green ring-1 ring-brand-green shadow-xs scale-98"
                    : "border-transparent opacity-75 hover:opacity-100 hover:border-gray-300"
                  }`}
              >
                {thumbImg && (
                  <img
                    src={thumbImg}
                    alt={pkg.title || ""}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
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
