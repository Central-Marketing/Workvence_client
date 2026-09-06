"use client";

import React from "react";
import { FiCheckCircle, FiFigma, FiMonitor, FiSmartphone, FiPenTool } from "react-icons/fi";
import { SiFramer } from "react-icons/si";

interface PackageAboutSectionProps {
  description: string;
  areaCovered?: string[];
  whyMe?: string[];
}

export const PackageAboutSection: React.FC<PackageAboutSectionProps> = ({
  description,
  areaCovered = [],
  whyMe = [],
}) => {
  return (
    <div id="section-about" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          About this packages
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-md">
          Blog, Business House
        </span>
      </div>

      {/* Description Content */}
      <div className="text-[14.5px] sm:text-[15px] text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
        {description}
      </div>

      {/* Basic Package Highlight */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-1.5">
          Basic Package :
        </h3>
        <p className="text-[14.5px] text-gray-600">
          Landing Page Figma UI UX design<br />
          Responsive Version
        </p>
      </div>

      {/* Area Covered Checklist */}
      {areaCovered.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-bold text-gray-900 mb-3.5">
            Area Covered :
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {areaCovered.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-[14px] text-gray-700">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Me Section */}
      {whyMe.length > 0 && (
        <div className="border-t border-gray-100 pt-6 mb-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            Why Me?
          </h3>
          <div className="space-y-1.5 text-[14px] text-gray-600">
            {whyMe.map((item, idx) => (
              <p key={idx}>{item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Design Tools & Platforms Row */}
      <div className="border-t border-gray-100 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
            Design Tool
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black transition-colors" title="Figma">
              <FiFigma className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black transition-colors" title="Framer">
              <SiFramer className="w-3.5 h-3.5" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black transition-colors" title="Vector / Pen Tool">
              <FiPenTool className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Device Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <FiMonitor className="w-3.5 h-3.5" />
            <span>Web App</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <FiSmartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </div>
        </div>
      </div>
    </div>
  );
};
