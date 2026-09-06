"use client";

import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { PortfolioProject, FALLBACK_IMAGES } from "../utils/packageDetailsNormalizer";

interface PackagePortfolioShowcaseProps {
  projects?: PortfolioProject[];
  totalPackagesCount?: number;
}

export const PackagePortfolioShowcase: React.FC<PackagePortfolioShowcaseProps> = ({
  projects = [],
  totalPackagesCount = 54,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const projectList = projects.length > 0 ? projects : [
    {
      id: 'proj-1',
      title: 'SPRAY Branding Design',
      description: 'I have done Branding design part for this game project and developed a visually appealing design. Customer satisfaction is my top priority :)',
      image: FALLBACK_IMAGES.portfolioShowcase,
      projectCost: '800$-1000$',
      duration: '10-15 Days',
      tags: ['Ui/Ux Design', 'Branding', 'Marketing']
    }
  ];

  const currentProject = projectList[activeIndex] || projectList[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : projectList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < projectList.length - 1 ? prev + 1 : 0));
  };

  const showcaseThumbs = [
    '/images/mock-package/thumb-1.png',
    '/images/mock-package/thumb-2.png',
    '/images/mock-package/thumb-3.png',
    '/images/mock-package/thumb-1.png',
    '/images/mock-package/thumb-2.png',
  ];

  return (
    <div id="section-packages" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Packages
          </h2>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
            Total Packages {totalPackagesCount}
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous project"
            className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next project"
            className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
          >
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Active Project Showcase Card */}
      <div className="relative aspect-[16/9] sm:aspect-[2.1/1] w-full rounded-2xl overflow-hidden mb-4 group shadow-sm bg-gray-900">
        <img
          src={currentProject.image || FALLBACK_IMAGES.portfolioShowcase}
          alt={currentProject.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES.portfolioShowcase;
          }}
        />

        {/* Frosted Glass Background Blur & Dark Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/55 to-transparent backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_25%)] [mask-image:linear-gradient(to_bottom,transparent,black_25%)] pointer-events-none" />

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 text-white">
          <h3 className="text-lg sm:text-xl font-bold mb-1.5 drop-shadow-sm">
            {currentProject.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-2xl mb-4 leading-relaxed font-normal">
            {currentProject.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/15">
            <div className="flex items-center gap-6 text-xs sm:text-sm">
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Project Cost</span>
                <span className="font-bold text-white">{currentProject.projectCost}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block font-medium">Duration</span>
                <span className="font-bold text-white">{currentProject.duration}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentProject.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-white/15 backdrop-blur-md text-white text-xs px-3 py-1 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails Track Below Showcase (Single Row of 5 items) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {showcaseThumbs.map((thumb, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx % projectList.length)}
              className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 ${isSelected
                  ? "border-gray-900 ring-1 ring-gray-900 shadow-xs scale-98"
                  : "border-transparent opacity-75 hover:opacity-100 hover:border-gray-300"
                }`}
            >
              <img
                src={thumb}
                alt=""
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
  );
};
